/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db, logoutUser, handleFirestoreError, OperationType } from './firebase';
import { Client, ClassRecord, MonthlyPayment, TabType, Workout } from './types';
import { getCurrentMonthKey } from './utils/formatters';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ClientsTab } from './components/ClientsTab';
import { ClassesTab } from './components/ClassesTab';
import { WorkoutsTab } from './components/WorkoutsTab';
import { FinanceTab } from './components/FinanceTab';
import { AuthScreen } from './components/AuthScreen';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<TabType>('clientes');

  // Active month for classes and finances (default: current month)
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(getCurrentMonthKey());

  // Data states (empty by default as requested: "deixe o app sem dados preenchidos")
  const [clients, setClients] = useState<Client[]>([]);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  // Feedback notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Realtime Firestore subscriptions for authenticated user
  useEffect(() => {
    if (!user) {
      setClients([]);
      setClasses([]);
      setPayments([]);
      setWorkouts([]);
      return;
    }

    const userId = user.uid;

    // 1. Clients subscription
    const clientsPath = `users/${userId}/clients`;
    const unsubClients = onSnapshot(
      collection(db, 'users', userId, 'clients'),
      (snapshot) => {
        const list: Client[] = [];
        snapshot.forEach((docSnap) => {
          list.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Client, 'id'>),
          });
        });
        setClients(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, clientsPath);
      }
    );

    // 2. Classes subscription
    const classesPath = `users/${userId}/classes`;
    const unsubClasses = onSnapshot(
      collection(db, 'users', userId, 'classes'),
      (snapshot) => {
        const list: ClassRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ClassRecord, 'id'>),
          });
        });
        setClasses(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, classesPath);
      }
    );

    // 3. Monthly payments subscription
    const paymentsPath = `users/${userId}/monthly_payments`;
    const unsubPayments = onSnapshot(
      collection(db, 'users', userId, 'monthly_payments'),
      (snapshot) => {
        const list: MonthlyPayment[] = [];
        snapshot.forEach((docSnap) => {
          list.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<MonthlyPayment, 'id'>),
          });
        });
        setPayments(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, paymentsPath);
      }
    );

    // 4. Workouts subscription
    const workoutsPath = `users/${userId}/workouts`;
    const unsubWorkouts = onSnapshot(
      collection(db, 'users', userId, 'workouts'),
      (snapshot) => {
        const list: Workout[] = [];
        snapshot.forEach((docSnap) => {
          list.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Workout, 'id'>),
          });
        });
        setWorkouts(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, workoutsPath);
      }
    );

    return () => {
      unsubClients();
      unsubClasses();
      unsubPayments();
      unsubWorkouts();
    };
  }, [user]);

  // Client handlers
  const handleSaveClient = async (
    clientData: Omit<Client, 'id' | 'userId'>,
    existingId?: string
  ) => {
    if (!user) return;
    const userId = user.uid;

    try {
      if (existingId) {
        const clientDocPath = `users/${userId}/clients/${existingId}`;
        try {
          await updateDoc(doc(db, 'users', userId, 'clients', existingId), {
            ...clientData,
            userId,
            updatedAt: new Date().toISOString(),
          });
          showNotification('Cliente atualizado com sucesso!');
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, clientDocPath);
        }
      } else {
        const clientsPath = `users/${userId}/clients`;
        try {
          await addDoc(collection(db, 'users', userId, 'clients'), {
            ...clientData,
            userId,
            createdAt: new Date().toISOString(),
          });
          showNotification('Cliente cadastrado com sucesso!');
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, clientsPath);
        }
      }
    } catch (err) {
      console.error(err);
      showNotification('Erro ao salvar cliente. Verifique sua conexão.', 'error');
      throw err;
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!user) return;
    const userId = user.uid;
    const clientDocPath = `users/${userId}/clients/${clientId}`;

    try {
      // Delete client document
      await deleteDoc(doc(db, 'users', userId, 'clients', clientId));

      // Clean up classes belonging to this client
      const classesQuery = query(
        collection(db, 'users', userId, 'classes'),
        where('clientId', '==', clientId)
      );
      const querySnap = await getDocs(classesQuery);
      querySnap.forEach(async (docSnap) => {
        await deleteDoc(doc(db, 'users', userId, 'classes', docSnap.id));
      });

      showNotification('Cliente removido com sucesso.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, clientDocPath);
    }
  };

  // Class logging handlers
  const handleAddClass = async (clientId: string, date: string) => {
    if (!user) return;
    const userId = user.uid;
    const monthKey = date.substring(0, 7); // e.g. "2026-11"
    const classesPath = `users/${userId}/classes`;

    try {
      await addDoc(collection(db, 'users', userId, 'classes'), {
        userId,
        clientId,
        date,
        monthKey,
        createdAt: new Date().toISOString(),
      });
      showNotification('Aula registrada com sucesso!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, classesPath);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!user) return;
    const userId = user.uid;
    const classDocPath = `users/${userId}/classes/${classId}`;

    try {
      await deleteDoc(doc(db, 'users', userId, 'classes', classId));
      showNotification('Aula removida com sucesso.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, classDocPath);
    }
  };

  // Workout handlers
  const handleSaveWorkout = async (
    workoutData: Omit<Workout, 'id' | 'userId'>,
    existingId?: string
  ) => {
    if (!user) return;
    const userId = user.uid;

    try {
      if (existingId) {
        const workoutDocPath = `users/${userId}/workouts/${existingId}`;
        try {
          await updateDoc(doc(db, 'users', userId, 'workouts', existingId), {
            ...workoutData,
            userId,
            updatedAt: new Date().toISOString(),
          });
          showNotification('Treino atualizado com sucesso!');
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, workoutDocPath);
        }
      } else {
        const workoutsPath = `users/${userId}/workouts`;
        try {
          await addDoc(collection(db, 'users', userId, 'workouts'), {
            ...workoutData,
            userId,
            createdAt: new Date().toISOString(),
          });
          showNotification('Treino criado com sucesso!');
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, workoutsPath);
        }
      }
    } catch (err) {
      console.error(err);
      showNotification('Erro ao salvar treino.', 'error');
      throw err;
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!user) return;
    const userId = user.uid;
    const workoutDocPath = `users/${userId}/workouts/${workoutId}`;

    try {
      await deleteDoc(doc(db, 'users', userId, 'workouts', workoutId));
      showNotification('Treino excluído com sucesso.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, workoutDocPath);
    }
  };

  // Payment status toggle
  const handleTogglePaymentStatus = async (
    clientId: string,
    currentStatus: 'pendente' | 'pago'
  ) => {
    if (!user) return;
    const userId = user.uid;
    const newStatus: 'pendente' | 'pago' = currentStatus === 'pago' ? 'pendente' : 'pago';
    const paymentId = `${clientId}_${currentMonthKey}`;
    const paymentDocPath = `users/${userId}/monthly_payments/${paymentId}`;

    try {
      await setDoc(
        doc(db, 'users', userId, 'monthly_payments', paymentId),
        {
          userId,
          clientId,
          monthKey: currentMonthKey,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      showNotification(
        newStatus === 'pago' ? 'Marcado como Pago!' : 'Marcado como Pendente.'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, paymentDocPath);
    }
  };

  // Loading screen while checking initial Firebase auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Carregando...</span>
        </div>
      </div>
    );
  }

  // Not authenticated screen
  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-28">
      {/* Top Header */}
      <Header user={user} onLogout={logoutUser} />

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-4 pt-4">
        {/* Friendly Notification Banner */}
        {notification && (
          <div
            className={`mb-4 p-3 rounded-2xl text-xs font-semibold shadow-xs flex items-center justify-between transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{notification.text}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab 1: Clientes */}
        {activeTab === 'clientes' && (
          <ClientsTab
            clients={clients}
            onSaveClient={handleSaveClient}
            onDeleteClient={handleDeleteClient}
          />
        )}

        {/* Tab 2: Aulas do Mês */}
        {activeTab === 'aulas' && (
          <ClassesTab
            clients={clients}
            classes={classes}
            currentMonthKey={currentMonthKey}
            onChangeMonth={setCurrentMonthKey}
            onAddClass={handleAddClass}
            onDeleteClass={handleDeleteClass}
            onNavigateToClients={() => setActiveTab('clientes')}
          />
        )}

        {/* Tab 3: Treinos (Fichas & Rotinas) */}
        {activeTab === 'treinos' && (
          <WorkoutsTab
            clients={clients}
            workouts={workouts}
            onSaveWorkout={handleSaveWorkout}
            onDeleteWorkout={handleDeleteWorkout}
          />
        )}

        {/* Tab 4: Financeiro */}
        {activeTab === 'financeiro' && (
          <FinanceTab
            clients={clients}
            classes={classes}
            payments={payments}
            currentMonthKey={currentMonthKey}
            onChangeMonth={setCurrentMonthKey}
            onTogglePaymentStatus={handleTogglePaymentStatus}
            onNavigateToClients={() => setActiveTab('clientes')}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}

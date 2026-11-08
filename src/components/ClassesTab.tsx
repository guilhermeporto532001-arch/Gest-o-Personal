import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  Cake,
  Users,
} from 'lucide-react';
import { Client, ClassRecord } from '../types';
import { MonthSelector } from './MonthSelector';
import {
  formatDateBR,
  getTodayISO,
  isBirthdayInMonth,
} from '../utils/formatters';

interface ClassesTabProps {
  clients: Client[];
  classes: ClassRecord[];
  currentMonthKey: string;
  onChangeMonth: (monthKey: string) => void;
  onAddClass: (clientId: string, date: string) => Promise<void>;
  onDeleteClass: (classId: string) => Promise<void>;
  onNavigateToClients: () => void;
}

export const ClassesTab: React.FC<ClassesTabProps> = ({
  clients,
  classes,
  currentMonthKey,
  onChangeMonth,
  onAddClass,
  onDeleteClass,
  onNavigateToClients,
}) => {
  // Modal state for adding a class
  const [modalClient, setModalClient] = useState<Client | null>(null);
  const [classDate, setClassDate] = useState<string>(getTodayISO());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expanded client details to show registered sessions
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter classes belonging to this month
  const monthClasses = classes.filter((c) => c.monthKey === currentMonthKey);

  // Group classes by clientId
  const classesByClient = new Map<string, ClassRecord[]>();
  monthClasses.forEach((record) => {
    const list = classesByClient.get(record.clientId) || [];
    list.push(record);
    classesByClient.set(record.clientId, list);
  });

  const openAddClassModal = (client: Client) => {
    setModalClient(client);
    setClassDate(getTodayISO());
  };

  const handleConfirmAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalClient || !classDate) return;

    setIsSubmitting(true);
    try {
      await onAddClass(modalClient.id, classDate);
      setModalClient(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar aula. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClassRecord = async (classId: string) => {
    setDeletingId(classId);
    try {
      await onDeleteClass(classId);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir aula.');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpand = (clientId: string) => {
    setExpandedClientId((prev) => (prev === clientId ? null : clientId));
  };

  // Sort clients alphabetically
  const sortedClients = [...clients].sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );

  return (
    <div className="space-y-4">
      {/* Month Selector */}
      <MonthSelector
        currentMonthKey={currentMonthKey}
        onChangeMonth={onChangeMonth}
      />

      {/* Header Info */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Registro de Aulas
          </h2>
          <p className="text-xs text-slate-500">
            {monthClasses.length === 1
              ? '1 aula realizada no mês'
              : `${monthClasses.length} aulas realizadas no mês`}
          </p>
        </div>
      </div>

      {/* Empty State: No clients */}
      {sortedClients.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-700">
              Nenhum cliente cadastrado
            </p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Cadastre seus clientes na aba "Clientes" para poder registrar aulas e acompanhar o progresso.
            </p>
          </div>
          <button
            onClick={onNavigateToClients}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Ir para Clientes
          </button>
        </div>
      ) : (
        /* Client Classes List */
        <div className="space-y-3">
          {sortedClients.map((client) => {
            const clientClasses = classesByClient.get(client.id) || [];
            // Sort classes newest to oldest
            clientClasses.sort((a, b) => b.date.localeCompare(a.date));

            const totalDone = clientClasses.length;
            const estimatedGoal = client.timesPerWeek * 4;
            const isBirthday = isBirthdayInMonth(client.birthDate, currentMonthKey);
            const isExpanded = expandedClientId === client.id;

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 hover:border-slate-300 transition-all"
              >
                {/* Client summary row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                        {client.name}
                      </h3>
                      {isBirthday && (
                        <span
                          title="Aniversariante do mês!"
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200"
                        >
                          <Cake className="w-3 h-3 text-pink-600" />
                          <span>Aniversário!</span>
                        </span>
                      )}
                    </div>

                    {/* Counts and Visual Goal */}
                    <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {totalDone} {totalDone === 1 ? 'aula realizada' : 'aulas realizadas'}
                        </span>
                      </span>

                      <span className="text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        Meta estimada: {estimatedGoal} aulas ({client.timesPerWeek}x/sem)
                      </span>
                    </div>
                  </div>

                  {/* Big "+ Aula" Button */}
                  <button
                    onClick={() => openAddClassModal(client)}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+ Aula</span>
                  </button>
                </div>

                {/* History toggle */}
                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => toggleExpand(client.id)}
                    className="w-full py-1 text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>
                      {totalDone === 0
                        ? 'Nenhuma aula registrada neste mês'
                        : `Ver registros do mês (${totalDone})`}
                    </span>
                    {totalDone > 0 && (
                      <span className="flex items-center gap-1 text-slate-400">
                        {isExpanded ? (
                          <>
                            Ocultar <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            Ver datas <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </span>
                    )}
                  </button>

                  {/* Expanded class history */}
                  {isExpanded && totalDone > 0 && (
                    <div className="mt-2 space-y-1.5 pl-1 pr-1">
                      {clientClasses.map((rec) => (
                        <div
                          key={rec.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs text-slate-700 border border-slate-100"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-semibold text-slate-800">
                              {formatDateBR(rec.date)}
                            </span>
                          </div>

                          <button
                            onClick={() => handleDeleteClassRecord(rec.id)}
                            disabled={deletingId === rec.id}
                            title="Remover aula"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Class Modal */}
      {modalClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Registrar Aula
                </h3>
                <p className="text-xs text-slate-500">{modalClient.name}</p>
              </div>
              <button
                onClick={() => setModalClient(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAddClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data da aula realizada
                </label>
                <input
                  type="date"
                  required
                  value={classDate}
                  onChange={(e) => setClassDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Data padrão: hoje ({formatDateBR(getTodayISO())}).
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalClient(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Salvando...' : 'Confirmar aula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Dumbbell,
  Plus,
  Trash2,
  Edit2,
  User,
  X,
  Check,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { Client, Workout } from '../types';

interface WorkoutsTabProps {
  clients: Client[];
  workouts: Workout[];
  onSaveWorkout: (workoutData: Omit<Workout, 'id' | 'userId'>, existingId?: string) => Promise<void>;
  onDeleteWorkout: (workoutId: string) => Promise<void>;
}

export const WorkoutsTab: React.FC<WorkoutsTabProps> = ({
  clients,
  workouts,
  onSaveWorkout,
  onDeleteWorkout,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [filterClientId, setFilterClientId] = useState<string>('all');

  // Delete state
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openNewModal = () => {
    setEditingWorkout(null);
    setTitle('');
    setSelectedClientId(clients.length > 0 ? clients[0].id : '');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (workout: Workout) => {
    setEditingWorkout(workout);
    setTitle(workout.title);
    setSelectedClientId(workout.clientId || '');
    setDescription(workout.description || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWorkout(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const client = clients.find((c) => c.id === selectedClientId);

    try {
      await onSaveWorkout(
        {
          title: title.trim(),
          clientId: selectedClientId || undefined,
          clientName: client ? client.name : undefined,
          description: description.trim() || undefined,
        },
        editingWorkout ? editingWorkout.id : undefined
      );
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar treino.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!workoutToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteWorkout(workoutToDelete.id);
      setWorkoutToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir treino.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter workouts
  const filteredWorkouts = workouts.filter((w) => {
    if (filterClientId === 'all') return true;
    return w.clientId === filterClientId;
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>Treinos & Fichas</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              Novo
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {workouts.length === 0
              ? 'Pronto para começarmos a estruturar'
              : `${workouts.length} ${workouts.length === 1 ? 'treino cadastrado' : 'treinos cadastrados'}`}
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo treino</span>
        </button>
      </div>

      {/* Filter by client if we have workouts and clients */}
      {workouts.length > 0 && clients.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterClientId('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              filterClientId === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos ({workouts.length})
          </button>
          {clients.map((c) => {
            const count = workouts.filter((w) => w.clientId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setFilterClientId(c.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  filterClientId === c.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {c.name.split(' ')[0]} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      )}

      {/* Workouts List or Initial Empty State */}
      {filteredWorkouts.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <Dumbbell className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              Aba de Treinos Pronta!
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Esta área está limpa e sem nenhum dado fictício, exatamente como você pediu.
              Podemos construir juntos a estrutura perfeita para os seus treinos (ex: divisões A/B/C, lista de exercícios, séries, repetições, cargas ou metas).
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={openNewModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Criar primeiro treino</span>
            </button>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>O que podemos adicionar juntos aqui:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500 text-[11px] pl-1">
              <li>Fichas divididas por letras (Treino A, B, C)</li>
              <li>Lista de exercícios com séries, repetições e carga</li>
              <li>Histórico de evolução e anotações do aluno</li>
              <li>Envio do treino formatado direto no WhatsApp</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base leading-tight">
                      {workout.title}
                    </h3>
                    {workout.clientName && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{workout.clientName}</span>
                      </span>
                    )}
                  </div>

                  {workout.description && (
                    <p className="text-xs text-slate-600 whitespace-pre-line bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                      {workout.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(workout)}
                    title="Editar treino"
                    className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setWorkoutToDelete(workout)}
                    title="Excluir treino"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingWorkout ? 'Editar Treino' : 'Novo Treino'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título do treino *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Treino A - Peito e Tríceps"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {clients.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vincular a um cliente (opcional)
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer"
                  >
                    <option value="">Geral / Modelo para qualquer aluno</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exercícios e Anotações
                </label>
                <textarea
                  rows={4}
                  placeholder="Ex:&#10;1. Supino reto - 4x10&#10;2. Crucifixo inclinado - 3x12&#10;3. Tríceps corda - 4x12"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingWorkout ? 'Salvar' : 'Criar treino'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {workoutToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                Excluir treino?
              </h3>
              <p className="text-xs text-slate-500">
                Tem certeza que deseja excluir o treino <strong>{workoutToDelete.title}</strong>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWorkoutToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

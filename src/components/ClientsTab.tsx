import React, { useState } from 'react';
import {
  Plus,
  Cake,
  Edit2,
  Trash2,
  Phone,
  Calendar,
  Repeat,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { Client } from '../types';
import {
  formatBRL,
  formatDateBR,
  isBirthdayInMonth,
} from '../utils/formatters';

interface ClientsTabProps {
  clients: Client[];
  onSaveClient: (clientData: Omit<Client, 'id' | 'userId'>, existingId?: string) => Promise<void>;
  onDeleteClient: (clientId: string) => Promise<void>;
}

export const ClientsTab: React.FC<ClientsTabProps> = ({
  clients,
  onSaveClient,
  onDeleteClient,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [timesPerWeek, setTimesPerWeek] = useState('2');
  const [birthDate, setBirthDate] = useState('');
  const [pricePerClass, setPricePerClass] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openNewModal = () => {
    setEditingClient(null);
    setName('');
    setTimesPerWeek('2');
    setBirthDate('');
    setPricePerClass('');
    setWhatsapp('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setTimesPerWeek(String(client.timesPerWeek));
    setBirthDate(client.birthDate);
    setPricePerClass(String(client.pricePerClass));
    setWhatsapp(client.whatsapp || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Por favor, informe o nome do cliente.');
      return;
    }

    const timesNum = parseInt(timesPerWeek, 10);
    if (isNaN(timesNum) || timesNum < 1) {
      setFormError('Informe quantas vezes por semana o cliente treina (mínimo 1).');
      return;
    }

    if (!birthDate) {
      setFormError('Informe a data de nascimento.');
      return;
    }

    const priceNum = parseFloat(pricePerClass.replace(',', '.'));
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Informe um valor por aula válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveClient(
        {
          name: trimmedName,
          timesPerWeek: timesNum,
          birthDate,
          pricePerClass: priceNum,
          whatsapp: whatsapp.trim() || undefined,
        },
        editingClient ? editingClient.id : undefined
      );
      closeModal();
    } catch (err: unknown) {
      console.error(err);
      setFormError('Ocorreu um erro ao salvar o cliente. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteClient(clientToDelete.id);
      setClientToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir cliente. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Sort clients alphabetically by name
  const sortedClients = [...clients].sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Clientes</h2>
          <p className="text-xs text-slate-500">
            {clients.length === 1
              ? '1 cliente cadastrado'
              : `${clients.length} clientes cadastrados`}
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo cliente</span>
        </button>
      </div>

      {/* Clients List */}
      {sortedClients.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Plus className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-700">
              Nenhum cliente cadastrado ainda
            </p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Adicione seus alunos para começar a registrar aulas e controlar o financeiro.
            </p>
          </div>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar primeiro cliente
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedClients.map((client) => {
            const isBirthday = isBirthdayInMonth(client.birthDate);

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base leading-snug truncate">
                        {client.name}
                      </h3>
                      {isBirthday && (
                        <span
                          title="Aniversariante deste mês!"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-100 text-pink-700 border border-pink-200"
                        >
                          <Cake className="w-3.5 h-3.5 text-pink-600" />
                          <span>Aniversário no mês!</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {formatBRL(client.pricePerClass)} / aula
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Repeat className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{client.timesPerWeek}x por semana</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Nasc: {formatDateBR(client.birthDate)}</span>
                      </div>

                      {client.whatsapp ? (
                        <div className="flex items-center gap-1.5 text-slate-500 truncate">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{client.whatsapp}</span>
                        </div>
                      ) : (
                        <div className="text-slate-400 italic">Sem WhatsApp</div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 self-start">
                    <button
                      onClick={() => openEditModal(client)}
                      title="Editar cliente"
                      className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setClientToDelete(client)}
                      title="Excluir cliente"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal (Create / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingClient ? 'Editar cliente' : 'Novo cliente'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Vezes por semana */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vezes por semana que treina *
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  required
                  placeholder="Ex: 2"
                  value={timesPerWeek}
                  onChange={(e) => setTimesPerWeek(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Usado para estimar a meta mensal (vezes × 4).
                </span>
              </div>

              {/* Data de nascimento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de nascimento *
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Destaque automático de aniversariantes no mês.
                </span>
              </div>

              {/* Valor por aula */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor por aula (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="80,00"
                    value={pricePerClass}
                    onChange={(e) => setPricePerClass(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* WhatsApp com DDD */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp com DDD (opcional)
                </label>
                <input
                  type="tel"
                  placeholder="Ex: (11) 99999-8888"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Permite enviar o resumo de cobrança direto no WhatsApp.
                </span>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
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
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    'Salvando...'
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingClient ? 'Salvar alterações' : 'Cadastrar cliente'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                Excluir cliente?
              </h3>
              <p className="text-xs text-slate-500">
                Tem certeza que deseja excluir <strong>{clientToDelete.name}</strong>?
                Os registros e dados vinculados serão removidos.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
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

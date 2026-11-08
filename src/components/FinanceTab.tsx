import React, { useState } from 'react';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  MessageSquare,
  Users,
  Repeat,
} from 'lucide-react';
import { Client, ClassRecord, MonthlyPayment } from '../types';
import { MonthSelector } from './MonthSelector';
import { BillingModal } from './BillingModal';
import { formatBRL } from '../utils/formatters';

interface FinanceTabProps {
  clients: Client[];
  classes: ClassRecord[];
  payments: MonthlyPayment[];
  currentMonthKey: string;
  onChangeMonth: (monthKey: string) => void;
  onTogglePaymentStatus: (clientId: string, currentStatus: 'pendente' | 'pago') => Promise<void>;
  onNavigateToClients: () => void;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({
  clients,
  classes,
  payments,
  currentMonthKey,
  onChangeMonth,
  onTogglePaymentStatus,
  onNavigateToClients,
}) => {
  const [billingClient, setBillingClient] = useState<{
    client: Client;
    count: number;
  } | null>(null);

  const [togglingClientId, setTogglingClientId] = useState<string | null>(null);

  // Filter classes for the current month
  const monthClasses = classes.filter((c) => c.monthKey === currentMonthKey);

  // Count classes per client
  const classCountByClient = new Map<string, number>();
  monthClasses.forEach((c) => {
    classCountByClient.set(c.clientId, (classCountByClient.get(c.clientId) || 0) + 1);
  });

  // Map payment status for current month: clientId -> 'pendente' | 'pago'
  const paymentStatusMap = new Map<string, 'pendente' | 'pago'>();
  payments
    .filter((p) => p.monthKey === currentMonthKey)
    .forEach((p) => {
      paymentStatusMap.set(p.clientId, p.status);
    });

  // Financial aggregates
  let totalAReceber = 0;
  let totalJaRecebido = 0;
  let totalPendente = 0;
  let totalAulasDadas = monthClasses.length;

  clients.forEach((client) => {
    const count = classCountByClient.get(client.id) || 0;
    const clientTotal = count * client.pricePerClass;
    const status = paymentStatusMap.get(client.id) || 'pendente';

    totalAReceber += clientTotal;
    if (status === 'pago') {
      totalJaRecebido += clientTotal;
    } else {
      totalPendente += clientTotal;
    }
  });

  const handleToggle = async (client: Client) => {
    const currentStatus = paymentStatusMap.get(client.id) || 'pendente';
    setTogglingClientId(client.id);
    try {
      await onTogglePaymentStatus(client.id, currentStatus);
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar status de pagamento.');
    } finally {
      setTogglingClientId(null);
    }
  };

  // Sort clients: ones with classes first, then alphabetically
  const sortedClients = [...clients].sort((a, b) => {
    const countA = classCountByClient.get(a.id) || 0;
    const countB = classCountByClient.get(b.id) || 0;
    if (countB !== countA) return countB - countA;
    return a.name.localeCompare(b.name, 'pt-BR');
  });

  return (
    <div className="space-y-4">
      {/* Month Selector */}
      <MonthSelector
        currentMonthKey={currentMonthKey}
        onChangeMonth={onChangeMonth}
      />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Total a Receber */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total a receber
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            {formatBRL(totalAReceber)}
          </div>
          <span className="text-[10px] text-slate-400 block">
            Aulas dadas × valor/aula
          </span>
        </div>

        {/* Total Já Recebido */}
        <div className="bg-emerald-50/70 rounded-2xl p-3.5 border border-emerald-100 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
            Já recebido
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-700 tracking-tight">
            {formatBRL(totalJaRecebido)}
          </div>
          <span className="text-[10px] text-emerald-600/80 block">
            Pagamentos confirmados
          </span>
        </div>

        {/* Total Pendente */}
        <div className="bg-amber-50/70 rounded-2xl p-3.5 border border-amber-100 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            Pendente
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-amber-700 tracking-tight">
            {formatBRL(totalPendente)}
          </div>
          <span className="text-[10px] text-amber-600/80 block">
            Aguardando pagamento
          </span>
        </div>

        {/* Total Aulas Dadas */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Aulas no mês
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            {totalAulasDadas} {totalAulasDadas === 1 ? 'aula' : 'aulas'}
          </div>
          <span className="text-[10px] text-slate-400 block">
            Total realizadas
          </span>
        </div>
      </div>

      {/* Client Financial List */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-800 px-1">
          Detalhamento por Cliente
        </h3>

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
                Cadastre seus clientes para gerenciar pagamentos e cobranças do mês.
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
          <div className="space-y-2.5">
            {sortedClients.map((client) => {
              const count = classCountByClient.get(client.id) || 0;
              const totalClientMonth = count * client.pricePerClass;
              const status = paymentStatusMap.get(client.id) || 'pendente';
              const isPaid = status === 'pago';
              const isToggling = togglingClientId === client.id;

              return (
                <div
                  key={client.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 hover:border-slate-300 transition-all"
                >
                  {/* Client title and monthly total */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-base leading-snug truncate">
                        {client.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>
                          {count} {count === 1 ? 'aula' : 'aulas'} × {formatBRL(client.pricePerClass)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-extrabold text-slate-900">
                        {formatBRL(totalClientMonth)}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold mt-0.5 ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isPaid ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Pago
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pendente
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Toggle Status & Gerar Mensagem de Cobrança */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      onClick={() => handleToggle(client)}
                      disabled={isToggling}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isPaid
                          ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Marcar como Pendente</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Marcar como Pago</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() =>
                        setBillingClient({
                          client,
                          count,
                        })
                      }
                      className="text-xs font-semibold px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Gerar cobrança</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Billing Modal */}
      {billingClient && (
        <BillingModal
          client={billingClient.client}
          classesCount={billingClient.count}
          monthKey={currentMonthKey}
          onClose={() => setBillingClient(null)}
        />
      )}
    </div>
  );
};

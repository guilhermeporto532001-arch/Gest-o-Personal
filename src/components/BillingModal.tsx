import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, ExternalLink } from 'lucide-react';
import { Client } from '../types';
import {
  formatBRL,
  formatMonthYearLabel,
  getFirstName,
  cleanWhatsAppNumber,
} from '../utils/formatters';

interface BillingModalProps {
  client: Client;
  classesCount: number;
  monthKey: string;
  onClose: () => void;
}

export const BillingModal: React.FC<BillingModalProps> = ({
  client,
  classesCount,
  monthKey,
  onClose,
}) => {
  const firstName = getFirstName(client.name);
  const monthLabel = formatMonthYearLabel(monthKey);
  const totalAmount = classesCount * client.pricePerClass;

  // Initial template
  const initialText = `Olá, ${firstName}! Tudo bem? Passando para enviar o resumo de ${monthLabel}: tivemos ${classesCount} aulas realizadas, com valor de ${formatBRL(
    client.pricePerClass
  )} cada. O total do mês ficou em ${formatBRL(
    totalAmount
  )}. Qualquer dúvida é só me chamar. Obrigado!`;

  const [message, setMessage] = useState(initialText);
  const [copied, setCopied] = useState(false);

  const cleanPhone = cleanWhatsAppNumber(client.whatsapp);
  const hasValidPhone = Boolean(cleanPhone && cleanPhone.length >= 10);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!hasValidPhone) return;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Mensagem de Cobrança
              </h3>
              <p className="text-xs text-slate-500">{client.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Editor */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Texto pronto (editável)
          </label>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-y"
          />
          <p className="text-[11px] text-slate-400">
            Você pode personalizar ou adicionar informações antes de enviar.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={handleCopy}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Texto copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copiar texto</span>
                </>
              )}
            </button>

            {hasValidPhone && (
              <button
                onClick={handleOpenWhatsApp}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir no WhatsApp</span>
              </button>
            )}
          </div>

          {!hasValidPhone && (
            <p className="text-[11px] text-amber-600 text-center">
              Cliente sem WhatsApp cadastrado. Use o botão de copiar texto.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

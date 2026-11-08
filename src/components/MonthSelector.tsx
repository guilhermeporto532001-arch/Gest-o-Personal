import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  changeMonth,
  formatMonthYearLabel,
  getCurrentMonthKey,
} from '../utils/formatters';

interface MonthSelectorProps {
  currentMonthKey: string;
  onChangeMonth: (newMonthKey: string) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentMonthKey,
  onChangeMonth,
}) => {
  const isCurrentMonth = currentMonthKey === getCurrentMonthKey();

  const handlePrev = () => {
    onChangeMonth(changeMonth(currentMonthKey, -1));
  };

  const handleNext = () => {
    onChangeMonth(changeMonth(currentMonthKey, 1));
  };

  const handleResetToCurrent = () => {
    onChangeMonth(getCurrentMonthKey());
  };

  return (
    <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
      <button
        onClick={handlePrev}
        title="Mês anterior"
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center flex-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-base">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>{formatMonthYearLabel(currentMonthKey)}</span>
        </div>
        {!isCurrentMonth && (
          <button
            onClick={handleResetToCurrent}
            className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 underline mt-0.5 cursor-pointer"
          >
            Voltar ao mês atual
          </button>
        )}
      </div>

      <button
        onClick={handleNext}
        title="Próximo mês"
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

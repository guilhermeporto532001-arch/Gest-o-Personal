import React from 'react';
import { Users, CalendarCheck, Dumbbell, DollarSign } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    {
      id: 'clientes' as TabType,
      label: 'Clientes',
      icon: Users,
    },
    {
      id: 'aulas' as TabType,
      label: 'Aulas',
      icon: CalendarCheck,
    },
    {
      id: 'treinos' as TabType,
      label: 'Treinos',
      icon: Dumbbell,
    },
    {
      id: 'financeiro' as TabType,
      label: 'Financeiro',
      icon: DollarSign,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 shadow-lg">
      <div className="max-w-xl mx-auto px-4 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 py-2.5 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                isActive
                  ? 'text-emerald-600 font-semibold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-50' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

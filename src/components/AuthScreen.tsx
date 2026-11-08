import React, { useState } from 'react';
import { Dumbbell, ShieldCheck, Check, Calendar, DollarSign, Users } from 'lucide-react';
import { loginWithGoogle } from '../firebase';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Não foi possível entrar com o Google. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 text-center space-y-6">
        {/* App Icon / Logo */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-200">
            <Dumbbell className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Treinos & Aulas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Controle de aulas e financeiro mensal para profissionais autônomos.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2.5 border border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Users className="w-3 h-3" />
            </div>
            <span>Cadastro de alunos e aniversariantes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Calendar className="w-3 h-3" />
            </div>
            <span>Registro rápido de aulas com 1 clique</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <DollarSign className="w-3 h-3" />
            </div>
            <span>Controle financeiro e cobrança no WhatsApp</span>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Google Login Button */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 text-sm font-bold rounded-2xl border-2 border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex items-center justify-center gap-3"
          >
            {/* Google SVG Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoading ? 'Conectando...' : 'Entrar com Google'}</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Acesso seguro e exclusivo com seus dados privados</span>
          </div>
        </div>
      </div>
    </div>
  );
};

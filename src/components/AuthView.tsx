import React from 'react';
import { User } from 'lucide-react';

interface AuthViewProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, isLoggingIn }) => {
  return (
    <div className="flex flex-col h-full bg-black text-white p-8 items-center justify-center relative overflow-hidden">
      {/* Ambient background ornament */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.03)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center">
        <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 rotate-12 group hover:rotate-0 transition-transform duration-500 shadow-2xl shadow-lime-500/5">
           <User className="w-12 h-12 text-lime-400 group-hover:scale-110 transition-transform" />
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Beatrice</h1>
        <p className="text-zinc-500 text-sm font-medium uppercase tracking-[0.3em] mb-12">Universal Assistant</p>

        <div className="w-full space-y-4">
          <button 
            onClick={onLogin}
            disabled={isLoggingIn}
            className="w-full bg-lime-400 hover:bg-lime-300 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-lime-400/10"
          >
            {isLoggingIn ? (
               <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.15-.45-.2-.93-.2-1.4c0-.73.13-1.43.35-2.09z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
          
          <p className="text-[10px] text-center text-zinc-600 px-4 leading-relaxed">
            By continuing, you agree to Beatrice's Terms of Service and data integration protocols.
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-12 text-zinc-900 font-black text-6xl select-none opacity-20 pointer-events-none tracking-tighter italic">
        EBURON CORE
      </div>
    </div>
  );
};

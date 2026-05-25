import React from 'react';
import { BeatriceOrb } from './BeatriceOrb';
import { LogOut } from 'lucide-react';
import { User, ViewState } from '../types';

interface HubViewProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  isActive: boolean;
  onToggleActive: () => void;
  transcript: string;
  agentResponse: string;
}

export const HubView: React.FC<HubViewProps> = ({ 
  user, onNavigate, onLogout, isActive, onToggleActive, transcript, agentResponse 
}) => {
  return (
    <div className="flex flex-col h-full bg-black text-white p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-lime-500/30" />}
          <div>
            <h2 className="text-sm font-medium text-zinc-400">Welcome</h2>
            <p className="text-lime-400 font-bold">{user.displayName || 'Beatrice User'}</p>
          </div>
        </div>
        <button onClick={onLogout} className="p-2 rounded-full hover:bg-zinc-900 transition-colors">
          <LogOut className="w-5 h-5 text-zinc-500" />
        </button>
      </div>

      {/* Main Assistant Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <BeatriceOrb isActive={isActive} onClick={onToggleActive} />
        
        <div className="mt-12 text-center w-full max-w-sm">
          <p className={`text-xs font-mono uppercase tracking-widest transition-colors duration-500 ${isActive ? 'text-lime-400' : 'text-zinc-600'}`}>
            {isActive ? 'Beatrice is listening...' : 'Tap Beatrice to begin'}
          </p>
          
          <div className="mt-8 min-h-[100px] flex flex-col gap-4">
             {transcript && (
               <div className="animate-in fade-in slide-in-from-bottom-2">
                 <p className="text-zinc-500 text-xs uppercase tracking-tighter mb-1">You</p>
                 <p className="text-white text-lg font-medium leading-tight">{transcript}</p>
               </div>
             )}
             {agentResponse && (
               <div className="animate-in fade-in slide-in-from-bottom-2 delay-150">
                 <p className="text-lime-500 text-xs uppercase tracking-tighter mb-1">Beatrice</p>
                 <p className="text-lime-400 text-lg font-medium leading-tight">{agentResponse}</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Persistent Navigation */}
      <div className="grid grid-cols-2 gap-4 mt-auto pt-8">
        <button 
          onClick={() => onNavigate('video')}
          className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl flex flex-col items-center gap-2 hover:border-lime-500/30 transition-all active:scale-95"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Video Call</span>
        </button>
        <button 
          onClick={() => onNavigate('computer')}
          className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl flex flex-col items-center gap-2 hover:border-lime-500/30 transition-all active:scale-95"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Operator</span>
        </button>
      </div>
    </div>
  );
};

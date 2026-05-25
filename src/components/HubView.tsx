import React from 'react';
import { Menu, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { BeatriceOrb } from './BeatriceOrb';
import { User, ViewState } from '../types';

interface HubViewProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  isActive: boolean;
  onToggleActive: () => void;
  transcript: string;
  agentResponse: string;
  inputVolume: number;
  outputVolume: number;
}

export const HubView: React.FC<HubViewProps> = ({ 
  user, onNavigate, isActive, onToggleActive, transcript, agentResponse, inputVolume, outputVolume
}) => {
  return (
    <div className="flex flex-col h-full bg-black text-white relative">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 flex justify-between items-center p-6 bg-black/80 backdrop-blur-md">
        <button onClick={() => onNavigate('history')} className="p-2 text-zinc-400 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
        <button onClick={() => onNavigate('profile')} className="p-2 text-zinc-400 hover:text-white">
          {user.photoURL ? <img src={user.photoURL} className="w-8 h-8 rounded-full" /> : <UserIcon className="w-6 h-6" />}
        </button>
      </header>

      {/* Main Assistant Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <BeatriceOrb isActive={isActive} onClick={onToggleActive} volume={outputVolume} />
        
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

      {/* Footer Navigation */}
      <footer className="sticky bottom-0 z-20 grid grid-cols-2 gap-4 p-6 bg-black/80 backdrop-blur-md border-t border-zinc-900">
        <button 
          onClick={onToggleActive}
          className={`py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${isActive ? 'bg-red-500' : 'bg-lime-400 text-black'}`}
        >
          {isActive && (
            <div className="flex items-center gap-0.5 h-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-black/60 rounded-sm"
                  animate={{ height: [4, 12, 4] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          )}
          {isActive ? 'Stop' : 'Start'}
        </button>
        <button 
          onClick={() => onNavigate('video')}
          className="bg-zinc-800 py-4 rounded-full font-bold text-sm"
        >
          Video
        </button>
      </footer>
    </div>
  );
};

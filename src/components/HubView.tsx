import React, { useEffect, useState } from 'react';
import { Menu, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BeatriceOrb } from './BeatriceOrb';
import { User, ViewState } from '../types';

interface HubViewProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  isActive: boolean;
  isProcessing: boolean;
  onToggleActive: () => void;
  transcript: string;
  agentResponse: string;
  inputVolume: number;
  outputVolume: number;
}

export const HubView: React.FC<HubViewProps> = ({ 
  user, onNavigate, isActive, isProcessing, onToggleActive, transcript, agentResponse, inputVolume, outputVolume
}) => {
  const [displayTranscript, setDisplayTranscript] = useState('');

  useEffect(() => {
    if (transcript) {
      setDisplayTranscript(transcript);
      const timer = setTimeout(() => {
        setDisplayTranscript('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [transcript]);

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
        
        {/* Real-time horizontal transcription */}
        <div className="h-12 mt-6 w-full flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {displayTranscript && (
              <motion.p
                key={displayTranscript}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="text-white text-base md:text-lg font-medium text-center whitespace-nowrap px-4"
              >
                {displayTranscript}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center w-full max-w-sm">
          <p className={`text-xs font-mono uppercase tracking-widest transition-colors duration-500 ${isActive ? 'text-lime-400' : 'text-zinc-600'}`}>
            {isProcessing ? (
                <div className="flex gap-1 justify-center items-center">
                    <motion.div className="w-1.5 h-1.5 rounded-full bg-lime-400" animate={{ scale: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} />
                    <motion.div className="w-1.5 h-1.5 rounded-full bg-lime-400" animate={{ scale: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 rounded-full bg-lime-400" animate={{ scale: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
                </div>
            ) : isActive ? 'Beatrice is listening...' : 'Tap Beatrice to begin'}
          </p>
          
          <div className="mt-8 h-[140px] flex flex-col gap-4 border-t border-zinc-900 pt-4 overflow-y-auto scroll-smooth" ref={(el) => {
            if (el) el.scrollTop = el.scrollHeight;
          }}>
             {agentResponse && (
               <div className="animate-in fade-in slide-in-from-bottom-1">
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
          className={`py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-lime-400 text-black hover:bg-lime-300'}`}
        >
          {isActive && (
            <div className="flex items-center gap-0.5 h-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-1 rounded-sm ${isActive ? 'bg-white' : 'bg-black'}`}
                  animate={{ height: Math.max(4, 4 + inputVolume * 0.5) }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              ))}
            </div>
          )}
          {isActive ? 'Stop' : 'Start'}
        </button>
        <button 
          onClick={() => onNavigate('video')}
          className="bg-lime-400 text-black py-4 px-6 rounded-xl font-bold text-sm hover:bg-lime-300 transition-colors"
        >
          Video
        </button>
      </footer>
    </div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BeatriceOrbProps {
  isActive: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  volume?: number;
}

export const BeatriceOrb: React.FC<BeatriceOrbProps> = ({ isActive, onClick, size = 'md', volume = 0 }) => {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-56 h-56',
    lg: 'w-72 h-72'
  };

  return (
    <button 
      onClick={onClick}
      className={`relative rounded-full flex items-center justify-center group focus:outline-none ${sizeClasses[size]}`}
    >
      {/* Background Glows */}
      <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-100 ${isActive ? 'bg-lime-500/40 opacity-100' : 'bg-lime-500/10 opacity-50'}`} 
      />
      
      {/* Audio Visualizer Bars */}
      {isActive && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 bg-lime-400 rounded-full"
              style={{
                height: 4,
                transformOrigin: '50% 50%',
                transform: `rotate(${i * (360 / 16)}deg) translateY(-60px)`, // Within the orb
              }}
              animate={{
                height: Math.max(4, 4 + volume / 2),
                opacity: 0.4 + (volume / 200),
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
          ))}
        </motion.div>
      )}
      
      {/* Central Orb */}
      <div className={`relative w-full h-full rounded-full border-4 overflow-hidden shadow-2xl transition-all duration-50 flex items-center justify-center ${isActive ? 'border-lime-400 bg-black/40' : 'border-zinc-800 bg-zinc-950/80 group-hover:border-zinc-700'}`}>
        <div className="absolute inset-0 backdrop-blur-md" />
        
        {/* Animated Blobs */}
        <AnimatePresence>
          {isActive && (
            <>
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 0.9, 1.1],
                  rotate: [0, 90, 180, 270],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute w-4/5 h-4/5 rounded-full bg-[radial-gradient(circle,rgba(163,230,53,0.6)_0%,transparent_70%)] filter blur-xl"
                style={{ opacity: 0.5 + volume / 100 }}
              />
              <motion.div 
                animate={{ 
                  scale: [1.1, 0.8, 1.2, 1],
                  rotate: [0, -120, -240, -360],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute w-3/4 h-3/4 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.4)_0%,transparent_70%)] filter blur-xl"
                style={{ opacity: 0.3 + volume / 150 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Core Dot */}
        <div className={`relative w-2 h-2 rounded-full transition-all duration-50 ${isActive ? 'bg-lime-400 shadow-[0_0_15px_rgba(163,230,53,1)]' : 'bg-zinc-700 shadow-none'}`} 
             style={{ transform: `scale(${1 + volume / 50})` }}
        />
      </div>
    </button>
  );
};

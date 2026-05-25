import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, Video, VideoOff, RefreshCw } from 'lucide-react';
import { ViewState } from '../types';
import { motion } from 'motion/react';

interface VideoViewProps {
  onNavigate: (view: ViewState) => void;
  isActive: boolean;
  onToggleActive: () => void;
}

export const VideoView: React.FC<VideoViewProps> = ({ onNavigate, isActive, onToggleActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  useEffect(() => {
    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: true });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.error("Camera access failed:", err);
      }
    };

    startCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="flex flex-col h-full bg-black text-zinc-100 font-sans selection-none">
      {/* HEADER */}
      <header className="sticky top-0 w-full bg-black/95 backdrop-blur-md border-b border-zinc-900/80 px-6 py-4 flex items-center justify-between z-30">
        <button onClick={toggleCamera} className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-lime-400 hover:bg-zinc-900/40 transition-all">
          <RefreshCw className="w-6 h-6" />
        </button>
        <div className="text-center">
            <h1 className="text-xl font-semibold tracking-wide text-lime-400">Video Call</h1>
        </div>
        <button onClick={() => onNavigate('hub')} className="p-2 -mr-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-zinc-900/40 transition-all">
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* MAIN CAMERA */}
      <main className="flex-1 w-full relative bg-zinc-950 overflow-hidden flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transition-transform duration-500 ${facingMode === 'user' ? 'scale-x-[-1]' : 'scale-x-1'} ${isCameraOff ? 'hidden' : ''}`} 
        />
        {isCameraOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <motion.div
                className="absolute w-full h-full rounded-full border border-lime-500/30 bg-lime-500/5"
                animate={{ scale: [0.6, 1.6], opacity: [0.8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute w-full h-full rounded-full border border-lime-500/20 bg-lime-500/5"
                animate={{ scale: [0.6, 1.6], opacity: [0.8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
              />
              <div className="relative w-16 h-16 rounded-full bg-zinc-900 border border-lime-500/40 flex items-center justify-center shadow-lg shadow-lime-500/10">
                <VideoOff className="w-8 h-8 text-lime-400/80" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER CONTROLS */}
      <footer className="sticky bottom-0 w-full bg-black/95 backdrop-blur-md border-t border-zinc-900/80 py-6 px-4 flex justify-center items-center gap-4 z-20">
        <button 
          onClick={onToggleActive}
          className={`flex-1 max-w-[160px] py-3.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${isActive ? 'bg-zinc-900 text-rose-500 border border-rose-500/50 hover:bg-zinc-850' : 'bg-lime-400 text-black hover:bg-lime-300 shadow-lime-400/10'}`}
        >
          {isActive ? (
            <>
              <div className="flex items-center gap-0.5 h-5 overflow-hidden">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        className="w-1 bg-rose-500 rounded-sm"
                        animate={{ height: [4, 16, 4] }}
                        transition={{ duration: 0.5 + i * 0.1, repeat: Infinity }}
                    />
                ))}
              </div>
              <span>Stop</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Start</span>
            </>
          )}
        </button>
        <button 
          onClick={() => setIsCameraOff(prev => !prev)}
          className={`flex-1 max-w-[160px] py-3.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${isCameraOff ? 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-lime-400' : 'bg-lime-400 text-black hover:bg-lime-300'}`}
        >
          <Video className="w-5 h-5" />
          <span>{isCameraOff ? 'Video Off' : 'Video On'}</span>
        </button>
      </footer>
    </div>
  );
};

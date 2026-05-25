import React, { useEffect, useRef, useState } from 'react';
import { BeatriceOrb } from './BeatriceOrb';
import { X, Camera, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { ViewState } from '../types';

interface VideoViewProps {
  onNavigate: (view: ViewState) => void;
  isActive: boolean;
  onToggleActive: () => void;
}

export const VideoView: React.FC<VideoViewProps> = ({ onNavigate, isActive, onToggleActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
  }, []);

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  return (
    <div className="relative h-full bg-black overflow-hidden flex flex-col">
      {/* Camera View */}
      <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transition-opacity duration-500 ${isCameraOff ? 'opacity-0' : 'opacity-60'}`} 
        />
        {isCameraOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
             <VideoOff className="w-16 h-16 text-zinc-800" />
          </div>
        )}
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 flex flex-col h-full p-6">
        <div className="flex justify-between items-center">
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-lime-400">Live Video Session</p>
          </div>
          <button 
            onClick={() => onNavigate('hub')}
            className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="mt-auto mb-12 flex flex-col items-center">
            <div className="mb-4">
              <BeatriceOrb isActive={isActive} onClick={onToggleActive} size="sm" />
            </div>
            <p className="text-xs font-medium text-white/70 mb-8">Beatrice is analyzing the feed...</p>
            
            {/* Call Controls */}
            <div className="flex gap-6 items-center">
              <button 
                onClick={toggleMic}
                className={`p-4 rounded-full border backdrop-blur-xl transition-all ${isMicMuted ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-white/10 border-white/20 text-white'}`}
              >
                {isMicMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              
              <button 
                 onClick={onToggleActive}
                 className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-red-500 shadow-lg shadow-red-500/30' : 'bg-lime-500 shadow-lg shadow-lime-500/30'}`}
              >
                {isActive ? <X className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-black" />}
              </button>

              <button 
                onClick={toggleCamera}
                className={`p-4 rounded-full border backdrop-blur-xl transition-all ${isCameraOff ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-white/10 border-white/20 text-white'}`}
              >
                {isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

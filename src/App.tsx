import { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { AuthView } from './components/AuthView';
import { HubView } from './components/HubView';
import { VideoView } from './components/VideoView';
import { ComputerView } from './components/ComputerView';
import { ProfileView } from './components/ProfileView';
import { HistoryView } from './components/HistoryView';
import { ConversationDetailsView } from './components/ConversationDetailsView';
import { initAuth, signIn, logout } from './lib/firebase';
import { ViewState, User } from './types';
import { pcmToBase64, base64ToPcm, AudioQueue } from './lib/audio';

export default function App() {
  const [view, setView] = useState<ViewState>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [agentResponse, setAgentResponse] = useState('');
  const [inputVolume, setInputVolume] = useState(0);
  const [outputVolume, setOutputVolume] = useState(0);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const updateVolumes = () => {
      if (inputAnalyserRef.current) {
        const dataArray = new Uint8Array(inputAnalyserRef.current.frequencyBinCount);
        inputAnalyserRef.current.getByteFrequencyData(dataArray);
        setInputVolume(dataArray.reduce((a, b) => a + b) / dataArray.length);
      }
      if (outputAnalyserRef.current) {
        const dataArray = new Uint8Array(outputAnalyserRef.current.frequencyBinCount);
        outputAnalyserRef.current.getByteFrequencyData(dataArray);
        setOutputVolume(dataArray.reduce((a, b) => a + b) / dataArray.length);
      }
      animationFrameRef.current = requestAnimationFrame(updateVolumes);
    };
    if (isActive) {
      animationFrameRef.current = requestAnimationFrame(updateVolumes);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setInputVolume(0);
      setOutputVolume(0);
    }
    return () => {
       if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  }, [isActive]);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u) => {
        setUser(u);
        setView('hub');
      },
      () => {
        setUser(null);
        setView('auth');
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await signIn();
      if (result) {
        setUser(result.user);
        setView('hub');
      }
    } catch (err) {
      console.error("Login Error:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setView('auth');
  };

  const handleOpenConversation = (id: string) => {
    setSelectedConversationId(id);
    setView('details');
  };

  // Live Assistant Logic
  useEffect(() => {
    if (isActive) {
      startAssistant();
    } else {
      stopAssistant();
    }
    return () => stopAssistant();
  }, [isActive]);

  const startAssistant = async () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/live`;
      wsRef.current = new WebSocket(wsUrl);

      audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      await audioCtxRef.current.audioWorklet.addModule('/src/lib/beatrice-processor.js');
      audioQueueRef.current = new AudioQueue(audioCtxRef.current);
      outputAnalyserRef.current = audioCtxRef.current.createAnalyser();
      outputAnalyserRef.current.connect(audioCtxRef.current.destination);

      wsRef.current.onopen = () => {
        wsRef.current?.send(JSON.stringify({ type: 'start' }));
      };

      wsRef.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'audio' && audioQueueRef.current) {
          audioQueueRef.current.enqueue(base64ToPcm(msg.data), outputAnalyserRef.current!);
        }
        if (msg.type === 'text') {
           setAgentResponse(msg.data);
        }
        if (msg.type === 'transcript') {
           setTranscript(msg.data);
        }
        if (msg.type === 'interrupted') {
          audioQueueRef.current?.clear();
          setAgentResponse('');
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      inputAnalyserRef.current = audioCtxRef.current.createAnalyser();
      source.connect(inputAnalyserRef.current);
      
      const workletNode = new AudioWorkletNode(audioCtxRef.current, 'beatrice-processor');
      processorRef.current = workletNode;
      
      workletNode.port.onmessage = (event) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const pcm = pcmToBase64(event.data);
          wsRef.current.send(JSON.stringify({ audio: pcm }));
        }
      };
      
      inputAnalyserRef.current.connect(workletNode);

    } catch (err) {
      console.error("Assistant Error:", err);
      setIsActive(false);
    }
  };

  const stopAssistant = () => {
    wsRef.current?.close();
    processorRef.current?.disconnect();
    audioCtxRef.current?.close();
    wsRef.current = null;
    audioCtxRef.current = null;
    processorRef.current = null;
  };

  const renderView = () => {
    if (!user && view !== 'auth') return <AuthView onLogin={handleLogin} isLoggingIn={isLoggingIn} />;
    
    switch (view) {
      case 'auth':
        return <AuthView onLogin={handleLogin} isLoggingIn={isLoggingIn} />;
      case 'hub':
        return (
          <HubView 
            user={user!} 
            onNavigate={setView} 
            isActive={isActive} 
            onToggleActive={() => setIsActive(!isActive)}
            transcript={transcript}
            agentResponse={agentResponse}
            inputVolume={inputVolume}
            outputVolume={outputVolume}
          />
        );
      case 'video':
        return (
          <VideoView 
            onNavigate={setView} 
            isActive={isActive} 
            onToggleActive={() => setIsActive(!isActive)} 
          />
        );
      case 'computer':
        return <ComputerView user={user!} onNavigate={setView} />;
      case 'profile':
        return <ProfileView user={user!} onNavigate={setView} onLogout={handleLogout} />;
      case 'history':
        return <HistoryView user={user!} onNavigate={setView} onOpenConversation={handleOpenConversation} />;
      case 'details':
        return <ConversationDetailsView user={user!} conversationId={selectedConversationId!} onNavigate={setView} />;
      default:
        return <AuthView onLogin={handleLogin} isLoggingIn={isLoggingIn} />;
    }
  };

  return (
    <Layout>
      {renderView()}
    </Layout>
  );
}

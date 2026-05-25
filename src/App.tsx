import { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { AuthView } from './components/AuthView';
import { HubView } from './components/HubView';
import { VideoView } from './components/VideoView';
import { ComputerView } from './components/ComputerView';
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
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

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

      audioCtxRef.current = new AudioContext({ sampleRate: 16000 });
      audioQueueRef.current = new AudioQueue(audioCtxRef.current);

      wsRef.current.onopen = () => {
        wsRef.current?.send(JSON.stringify({ type: 'start' }));
      };

      wsRef.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'audio' && audioQueueRef.current) {
          audioQueueRef.current.enqueue(base64ToPcm(msg.data));
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
      processorRef.current = audioCtxRef.current.createScriptProcessor(4096, 1, 1);
      
      source.connect(processorRef.current);
      processorRef.current.connect(audioCtxRef.current.destination);

      processorRef.current.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const pcm = pcmToBase64(e.inputBuffer.getChannelData(0));
          wsRef.current.send(JSON.stringify({ audio: pcm }));
        }
      };

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
            onLogout={handleLogout} 
            isActive={isActive} 
            onToggleActive={() => setIsActive(!isActive)}
            transcript={transcript}
            agentResponse={agentResponse}
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

import React, { useState, useEffect } from 'react';
import { Terminal, Database, Cloud, FileText, Calendar as CalendarIcon, Mail, CheckCircle, Smartphone } from 'lucide-react';
import { User, ViewState, WorkspaceFile, CalendarEvent } from '../types';
import { fetchDriveFiles, fetchCalendarEvents, fetchGmailList, fetchTasks } from '../lib/workspace';

interface ComputerViewProps {
  user: User;
  onNavigate: (view: ViewState) => void;
}

export const ComputerView: React.FC<ComputerViewProps> = ({ user, onNavigate }) => {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2000);
    
    if (user.accessToken) {
      Promise.all([
        fetchDriveFiles(user.accessToken),
        fetchCalendarEvents(user.accessToken)
      ]).then(([f, e]) => {
        setFiles(f);
        setEvents(e);
        setLoading(false);
      }).catch(err => {
        console.error("Workspace load failed:", err);
        setLoading(false);
      });
    }

    return () => clearTimeout(timer);
  }, [user.accessToken]);

  if (booting) {
    return (
      <div className="h-full bg-black flex flex-col items-center justify-center p-8 font-mono">
        <div className="w-full max-w-xs">
          <p className="text-lime-500 text-xs mb-4 animate-pulse">BOOTING BEATRICE OS v5.1...</p>
          <div className="h-1 w-full bg-zinc-900 overflow-hidden">
             <div className="h-full bg-lime-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
          </div>
          <p className="text-zinc-600 text-[10px] mt-4 uppercase tracking-widest text-center">Neural Pipeline Stabilization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-zinc-950 flex flex-col overflow-hidden text-zinc-300">
      {/* Header Bar */}
      <div className="bg-zinc-900 px-6 py-4 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-lime-400" />
          <h1 className="text-xs font-bold uppercase tracking-widest text-lime-400">Beatrice Terminal</h1>
        </div>
        <button onClick={() => onNavigate('hub')} className="p-2 -mr-2 text-zinc-500 hover:text-white transition-colors">
          <Smartphone className="w-5 h-5" />
        </button>
      </div>

      {/* Grid Dashboard */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-4">
        {/* Drive Storage */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Cloud className="w-4 h-4 text-blue-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400">Google Drive</h3>
          </div>
          <div className="space-y-2">
            {files.map(file => (
              <div key={file.id} className="flex items-center gap-3 p-2 hover:bg-zinc-800/50 rounded-lg transition-colors group cursor-pointer">
                <FileText className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                <span className="text-xs truncate flex-1">{file.name}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-lime-500 shadow-sm" />
              </div>
            ))}
            {files.length === 0 && !loading && <p className="text-[10px] text-zinc-600 italic">No files found.</p>}
          </div>
        </div>

        {/* Calendar Feed */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-4 h-4 text-rose-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400">Recent Events</h3>
          </div>
          <div className="space-y-3">
             {events.map(event => (
               <div key={event.id} className="border-l-2 border-rose-500/30 pl-3 py-1">
                 <p className="text-xs font-medium text-zinc-200">{event.summary}</p>
                 <p className="text-[9px] text-zinc-600 mt-1">{event.start.dateTime ? new Date(event.start.dateTime).toLocaleString() : 'All day'}</p>
               </div>
             ))}
             {events.length === 0 && !loading && <p className="text-[10px] text-zinc-600 italic">No upcoming events.</p>}
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 font-mono">
           <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-amber-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400">System Logs</h3>
          </div>
          <div className="text-[9px] text-zinc-500 space-y-1">
             <p className="text-lime-500/70">SYNC: Drive pipelines established</p>
             <p>AUTH: Token validation successful</p>
             <p>CORE: Beatrice instance #3257 ready</p>
             <p className="animate-pulse">_</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

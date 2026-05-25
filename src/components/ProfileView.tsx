import React, { useState } from 'react';
import { User as UserIcon, LogOut, ArrowLeft, Settings, Play } from 'lucide-react';
import { User, ViewState } from '../types';
import { superheroVoices, languages } from '../data';
import { storage } from '../lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

interface ProfileViewProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onNavigate, onLogout }) => {
  const [name, setName] = useState(localStorage.getItem('beatrice-name') || 'Beatrice');
  const [voice, setVoice] = useState(localStorage.getItem('beatrice-voice') || superheroVoices[0]);
  const [language, setLanguage] = useState(localStorage.getItem('beatrice-language') || languages[0]);
  const [bossFirstName, setBossFirstName] = useState(localStorage.getItem('beatrice-boss-name') || 'Jo');
  const [behavior, setBehavior] = useState(localStorage.getItem('beatrice-behavior') || 'Helpful and professional');
  const [enabledTools, setEnabledTools] = useState<string[]>(JSON.parse(localStorage.getItem('beatrice-tools') || '["Google Calendar", "Drive", "Gmail"]'));

  React.useEffect(() => {
    localStorage.setItem('beatrice-name', name);
    localStorage.setItem('beatrice-voice', voice);
    localStorage.setItem('beatrice-language', language);
    localStorage.setItem('beatrice-boss-name', bossFirstName);
    localStorage.setItem('beatrice-behavior', behavior);
    localStorage.setItem('beatrice-tools', JSON.stringify(enabledTools));
  }, [name, voice, language, bossFirstName, behavior, enabledTools]);

  const playVoiceSample = async () => {
    try {
      const storageRef = ref(storage, `voices/${voice.toLowerCase()}.mp3`);
      const url = await getDownloadURL(storageRef);
      const audio = new Audio(url);
      await audio.play();
    } catch (error) {
      console.error('Error playing voice sample:', error);
      alert('Voice sample not available.');
    }
  };

  const toggleTool = (tool: string) => {
    setEnabledTools(prev => prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white p-6 overflow-y-auto">
      <header className="flex justify-between items-center mb-8">
        <button onClick={() => onNavigate('hub')} className="p-2 text-zinc-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Profile & Settings</span>
        <button onClick={onLogout} className="p-2 text-rose-500 hover:text-rose-400">
          <LogOut className="w-6 h-6" />
        </button>
      </header>

      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
           {user.photoURL ? <img src={user.photoURL} className="rounded-full" /> : <UserIcon className="w-10 h-10 text-zinc-600" />}
        </div>
        <h2 className="text-lg font-bold">Boss {bossFirstName}</h2>
        <p className="text-zinc-500 text-xs">{user.email}</p>
      </div>
        
      <div className="w-full bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 space-y-6">
         <div className="space-y-2">
           <label className="text-xs text-zinc-500 uppercase tracking-widest">Assistant Name</label>
           <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm text-white" />
         </div>

         <div className="space-y-2">
           <label className="text-xs text-zinc-500 uppercase tracking-widest">Voice</label>
           <div className="flex gap-2">
             <select value={voice} onChange={e => setVoice(e.target.value)} className="flex-1 bg-black border border-zinc-800 p-3 rounded-xl text-sm text-white focus:outline-none">
               {superheroVoices.map(v => <option key={v} value={v}>{v}</option>)}
             </select>
             <button className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl" onClick={playVoiceSample}>
               <Play className="w-5 h-5 text-white" />
             </button>
           </div>
         </div>

         <div className="space-y-2">
           <label className="text-xs text-zinc-500 uppercase tracking-widest">Language</label>
           <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm text-white focus:outline-none">
             {languages.map(l => <option key={l} value={l}>{l}</option>)}
           </select>
         </div>

         <div className="space-y-2">
           <label className="text-xs text-zinc-500 uppercase tracking-widest">Boss First Name</label>
           <input value={bossFirstName} onChange={e => setBossFirstName(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm text-white" />
         </div>

         <div className="space-y-2">
            <label className="text-xs text-zinc-500 uppercase tracking-widest">Behavior</label>
            <textarea value={behavior} onChange={e => setBehavior(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm text-white" rows={3}/>
         </div>

         <div className="space-y-2">
            <label className="text-xs text-zinc-500 uppercase tracking-widest">Enabled Tools</label>
            <div className="grid grid-cols-2 gap-2">
                {['Google Calendar', 'Drive', 'Gmail', 'Tasks'].map(tool => (
                    <button key={tool} onClick={() => toggleTool(tool)} className={`p-2 rounded-lg text-xs ${enabledTools.includes(tool) ? 'bg-lime-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                        {tool}
                    </button>
                ))}
            </div>
         </div>

         <button className="w-full py-3 rounded-xl bg-lime-400 text-black font-semibold text-sm hover:bg-lime-300">
           Re-authenticate Workspace
         </button>
      </div>
    </div>
  );
};


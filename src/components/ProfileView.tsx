import React from 'react';
import { User as UserIcon, LogOut, ArrowLeft } from 'lucide-react';
import { User, ViewState } from '../types';

interface ProfileViewProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onNavigate, onLogout }) => {
  return (
    <div className="flex flex-col h-full bg-black text-white p-6">
      <header className="flex justify-between items-center mb-12">
        <button onClick={() => onNavigate('hub')} className="p-2 text-zinc-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Profile</span>
        <button onClick={onLogout} className="p-2 text-rose-500 hover:text-rose-400">
          <LogOut className="w-6 h-6" />
        </button>
      </header>

      <div className="flex flex-col items-center flex-1">
        <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
           {user.photoURL ? <img src={user.photoURL} className="rounded-full" /> : <UserIcon className="w-12 h-12 text-zinc-600" />}
        </div>
        <h2 className="text-xl font-bold">{user.displayName}</h2>
        <p className="text-zinc-500 text-sm">{user.email}</p>
        
        <div className="w-full mt-12 bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
           <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Account Stats</p>
           <div className="flex justify-between text-xs">
             <span>Role:</span>
             <span className="text-lime-400">Eburon Operator</span>
           </div>
        </div>
      </div>
    </div>
  );
};

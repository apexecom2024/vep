import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, MessageSquare } from 'lucide-react';
import { User, ViewState } from '../types';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface HistoryViewProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  onOpenConversation: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ user, onNavigate, onOpenConversation }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, `users/${user.uid}/conversations`),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setConversations(convs);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user.uid]);

  return (
    <div className="flex flex-col h-full bg-black text-white relative">
      <header className="sticky top-0 z-20 flex items-center gap-4 p-6 bg-black/80 backdrop-blur-md border-b border-zinc-900">
        <button onClick={() => onNavigate('hub')} className="p-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">History</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <p className="text-zinc-600">Loading...</p>
        ) : conversations.length === 0 ? (
          <p className="text-zinc-600">No past conversations.</p>
        ) : (
          conversations.map((conv: any) => (
            <div 
              key={conv.id} 
              onClick={() => onOpenConversation(conv.id)}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-lime-500/30 transition-all"
            >
              <div className="flex items-center gap-2 text-lime-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest">{new Date(conv.createdAt?.toDate()).toLocaleDateString()}</span>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-zinc-500 mt-1" />
                <p className="text-sm text-zinc-300">{conv.summary || 'Conversation session'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { User, ViewState } from '../types';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ConversationDetailsViewProps {
  user: User;
  conversationId: string;
  onNavigate: (view: ViewState) => void;
}

export const ConversationDetailsView: React.FC<ConversationDetailsViewProps> = ({ 
    user, conversationId, onNavigate 
}) => {
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const convDoc = await getDoc(doc(db, `users/${user.uid}/conversations/${conversationId}`));
        if (convDoc.exists()) {
            setConversation({ id: convDoc.id, ...convDoc.data() });
            
            const msgsQuery = query(
              collection(db, `users/${user.uid}/conversations/${conversationId}/messages`),
              orderBy('createdAt', 'asc')
            );
            const msgsSnap = await getDocs(msgsQuery);
            setMessages(msgsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (err) {
        console.error('Failed to load conversation details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.uid, conversationId]);

  return (
    <div className="flex flex-col h-full bg-black text-white p-6">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => onNavigate('history')} className="p-2 text-zinc-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">Conversation</h2>
      </header>

      {loading ? (
        <p className="text-zinc-600">Loading...</p>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((msg: any) => (
            <div key={msg.id} className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-zinc-800 self-end' : 'bg-lime-900/20'}`}>
              <p className="text-sm text-zinc-200">{msg.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

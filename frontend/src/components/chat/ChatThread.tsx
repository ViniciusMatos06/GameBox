import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/States';
import type { ConversationSummary } from '../../types/chat';

export default function ChatThread({ conversation }: { conversation: ConversationSummary }) {
  const { user } = useAuth();
  const { activeMessages, sendMessage, closeConversation } = useChat();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [activeMessages.length]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    const content = draft.trim();
    setDraft('');
    setSending(true);
    try {
      await sendMessage(content);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-thread">
      <div className="chat-thread-header">
        <button className="chat-icon-btn" onClick={closeConversation} aria-label="Voltar">
          <ArrowLeft size={18} />
        </button>
        <UserAvatar src={conversation.otherUser.avatarUrl} alt={conversation.otherUser.username} size={30} />
        <div className="chat-thread-title">
          <strong>{conversation.otherUser.name}</strong>
          <span>@{conversation.otherUser.username}</span>
        </div>
      </div>

      <div className="chat-thread-messages">
        {activeMessages.length === 0 ? (
          <p className="chat-empty-hint">Diga oi para @{conversation.otherUser.username} 👋</p>
        ) : (
          activeMessages.map((m) => {
            const mine = m.senderUsername === user?.username;
            return (
              <div key={m.id} className={`chat-bubble-row ${mine ? 'mine' : ''}`}>
                <div className="chat-bubble">{m.content}</div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-thread-input" onSubmit={handleSubmit}>
        <input
          placeholder="Escreva uma mensagem..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={!draft.trim() || sending} aria-label="Enviar">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

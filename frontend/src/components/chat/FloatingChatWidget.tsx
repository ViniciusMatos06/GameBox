import { useEffect, useState } from 'react';
import { MessageCircle, X, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useDebounce } from '../../hooks/useDebounce';
import { searchUsers } from '../../services/userService';
import { UserAvatar } from '../common/States';
import ChatThread from './ChatThread';
import type { UserSummary } from '../../types/gamebox';
import './ChatWidget.css';

export default function FloatingChatWidget() {
  const { isAuthenticated, user } = useAuth();
  const {
    isPanelOpen,
    togglePanel,
    closePanel,
    conversations,
    totalUnread,
    activeConversationId,
    openConversation,
    openConversationWithUser,
  } = useChat();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSummary[]>([]);
  const [searching, setSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    let active = true;
    setSearching(true);
    searchUsers(debouncedQuery)
      .then((r) => active && setResults(r))
      .catch(() => active && setResults([]))
      .finally(() => active && setSearching(false));
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  if (!isAuthenticated) return null;

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  function handleStartChat(username: string) {
    setQuery('');
    setResults([]);
    openConversationWithUser(username);
  }

  return (
    <>
      <button className="chat-fab" onClick={togglePanel} aria-label="Mensagens">
        <MessageCircle size={22} />
        {totalUnread > 0 && <span className="chat-fab-badge">{totalUnread > 9 ? '9+' : totalUnread}</span>}
      </button>

      {isPanelOpen && (
        <div className="chat-panel">
          {activeConversation ? (
            <ChatThread conversation={activeConversation} />
          ) : (
            <>
              <div className="chat-panel-header">
                <strong>Conversas</strong>
                <button className="chat-icon-btn" onClick={closePanel} aria-label="Fechar">
                  <X size={18} />
                </button>
              </div>

              <div className="chat-search">
                <Search size={15} />
                <input
                  placeholder="Pesquisar pessoas..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="chat-list">
                {query.trim() ? (
                  searching ? (
                    <p className="chat-empty-hint">Buscando...</p>
                  ) : results.length === 0 ? (
                    <p className="chat-empty-hint">Nenhuma pessoa encontrada.</p>
                  ) : (
                    results
                      .filter((r) => r.username !== user?.username)
                      .map((r) => (
                        <button key={r.username} className="chat-list-item" onClick={() => handleStartChat(r.username)}>
                          <UserAvatar src={r.avatarUrl} alt={r.username} size={38} />
                          <div className="chat-list-item-info">
                            <strong>{r.name}</strong>
                            <span>@{r.username}</span>
                          </div>
                        </button>
                      ))
                  )
                ) : conversations.length === 0 ? (
                  <p className="chat-empty-hint">
                    Nenhuma conversa ainda. Pesquise alguém acima pra começar a conversar.
                  </p>
                ) : (
                  conversations.map((c) => (
                    <button key={c.id} className="chat-list-item" onClick={() => openConversation(c.id)}>
                      <UserAvatar src={c.otherUser.avatarUrl} alt={c.otherUser.username} size={38} />
                      <div className="chat-list-item-info">
                        <strong>{c.otherUser.name}</strong>
                        {c.lastMessage ? (
                          <span className="chat-list-preview">
                            {c.lastMessage.senderUsername === 'me' ? 'Você: ' : ''}
                            {c.lastMessage.content}
                          </span>
                        ) : (
                          <span className="chat-list-preview">Nenhuma mensagem ainda</span>
                        )}
                      </div>
                      {c.unreadCount > 0 && <span className="chat-list-unread-dot" />}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

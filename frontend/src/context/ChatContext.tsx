import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import * as chatService from '../services/chatService';
import type { ChatMessage, ConversationSummary } from '../types/chat';

const CONVERSATIONS_POLL_MS = 8000;
const MESSAGES_POLL_MS = 3000;

interface ChatContextValue {
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;

  conversations: ConversationSummary[];
  totalUnread: number;

  activeConversationId: string | null;
  activeMessages: ChatMessage[];
  openConversation: (conversationId: string) => void;
  openConversationWithUser: (username: string) => Promise<void>;
  closeConversation: () => void;
  sendMessage: (content: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const refreshConversations = useCallback(() => {
    if (!isAuthenticated) return;
    chatService.getConversations().then(setConversations).catch(() => {});
  }, [isAuthenticated]);

  // Poll the conversation list (for the badge + list) whenever logged in.
  useEffect(() => {
    if (!isAuthenticated) {
      setConversations([]);
      return;
    }
    refreshConversations();
    const timer = setInterval(refreshConversations, CONVERSATIONS_POLL_MS);
    return () => clearInterval(timer);
  }, [isAuthenticated, refreshConversations]);

  const refreshActiveMessages = useCallback((conversationId: string) => {
    chatService
      .getMessages(conversationId)
      .then((msgs) => {
        if (activeIdRef.current === conversationId) setActiveMessages(msgs);
      })
      .catch(() => {});
  }, []);

  // Poll messages for whichever conversation is currently open.
  useEffect(() => {
    if (!activeConversationId) return;
    refreshActiveMessages(activeConversationId);
    chatService.markConversationRead(activeConversationId).then(refreshConversations).catch(() => {});

    const timer = setInterval(() => refreshActiveMessages(activeConversationId), MESSAGES_POLL_MS);
    return () => clearInterval(timer);
  }, [activeConversationId, refreshActiveMessages, refreshConversations]);

  const openConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
  }, []);

  const openConversationWithUser = useCallback(
    async (username: string) => {
      const conv = await chatService.getOrCreateConversationWith(username);
      setConversations((prev) => (prev.some((c) => c.id === conv.id) ? prev : [conv, ...prev]));
      setActiveConversationId(conv.id);
      setIsPanelOpen(true);
    },
    []
  );

  const closeConversation = useCallback(() => {
    setActiveConversationId(null);
    setActiveMessages([]);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeConversationId || !content.trim()) return;
      const msg = await chatService.sendMessage(activeConversationId, content.trim());
      setActiveMessages((prev) => [...prev, msg]);
      refreshConversations();
    },
    [activeConversationId, refreshConversations]
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <ChatContext.Provider
      value={{
        isPanelOpen,
        openPanel: () => setIsPanelOpen(true),
        closePanel: () => {
          setIsPanelOpen(false);
          closeConversation();
        },
        togglePanel: () => setIsPanelOpen((v) => !v),
        conversations,
        totalUnread,
        activeConversationId,
        activeMessages,
        openConversation,
        openConversationWithUser,
        closeConversation,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat deve ser usado dentro de um ChatProvider');
  return ctx;
}

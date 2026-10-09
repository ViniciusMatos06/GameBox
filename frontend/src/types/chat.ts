import type { UserSummary } from './gamebox';

export interface LastMessagePreview {
  content: string;
  /** The literal string "me" when the logged-in user sent it, otherwise the sender's username. */
  senderUsername: string;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  otherUser: UserSummary;
  lastMessage: LastMessagePreview | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  senderUsername: string;
  content: string;
  createdAt: string;
  read: boolean;
}

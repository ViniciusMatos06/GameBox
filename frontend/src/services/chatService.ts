import type { ChatMessage, ConversationSummary } from '../types/chat';
import { api } from './apiClient';

export async function getConversations(): Promise<ConversationSummary[]> {
  return api.get<ConversationSummary[]>('/conversations');
}

export async function getOrCreateConversationWith(username: string): Promise<ConversationSummary> {
  return api.post<ConversationSummary>(`/conversations/with/${username}`);
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  return api.get<ChatMessage[]>(`/conversations/${conversationId}/messages`);
}

export async function sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
  return api.post<ChatMessage>(`/conversations/${conversationId}/messages`, { content });
}

export async function markConversationRead(conversationId: string): Promise<void> {
  return api.post<void>(`/conversations/${conversationId}/read`);
}

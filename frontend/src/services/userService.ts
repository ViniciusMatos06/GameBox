import type { PublicProfile, User, UserSummary } from '../types/gamebox';
import { api } from './apiClient';
import { updateCachedUser } from './authService';

export async function getPublicProfile(username: string): Promise<PublicProfile> {
  return api.get<PublicProfile>(`/users/${username}`);
}

export async function searchUsers(query: string): Promise<UserSummary[]> {
  if (!query.trim()) return [];
  return api.get<UserSummary[]>(`/users/search?q=${encodeURIComponent(query.trim())}`);
}

export async function updateProfile(patch: {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  email?: string;
}): Promise<User> {
  const user = await api.patch<User>('/users/me', patch);
  updateCachedUser(user);
  return user;
}

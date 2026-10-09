import type { UserSummary } from '../types/gamebox';
import { api } from './apiClient';

export async function follow(username: string): Promise<void> {
  return api.post<void>(`/users/${username}/follow`);
}

export async function unfollow(username: string): Promise<void> {
  return api.delete<void>(`/users/${username}/follow`);
}

export async function getFollowers(username: string): Promise<UserSummary[]> {
  return api.get<UserSummary[]>(`/users/${username}/followers`);
}

export async function getFollowing(username: string): Promise<UserSummary[]> {
  return api.get<UserSummary[]>(`/users/${username}/following`);
}

export async function getSuggestions(): Promise<UserSummary[]> {
  return api.get<UserSummary[]>('/users/suggestions');
}

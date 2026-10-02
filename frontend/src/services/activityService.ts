import type { Activity } from '../types/gamebox';
import { api } from './apiClient';

export async function getUserActivities(username: string): Promise<Activity[]> {
  return api.get<Activity[]>(`/activities/${username}`);
}

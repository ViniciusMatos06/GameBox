import type { Activity, FeedActivity } from '../types/gamebox';
import { api } from './apiClient';

export async function getUserActivities(username: string): Promise<Activity[]> {
  return api.get<Activity[]>(`/activities/${username}`);
}

/** Activity from people the logged-in user follows. */
export async function getActivityFeed(): Promise<FeedActivity[]> {
  return api.get<FeedActivity[]>('/activities/feed');
}

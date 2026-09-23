import type { Activity, ActivityType } from '../types/gamebox';
import { readAll, writeAll, genId } from './storage';

const KEY = 'activities';

export function getAllActivities(): Activity[] {
  return readAll<Activity>(KEY).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getUserActivities(username: string): Activity[] {
  return getAllActivities().filter((a) => a.username === username);
}

export function logActivity(input: {
  username: string;
  type: ActivityType;
  listId?: string;
  listName?: string;
  gameId?: number;
  gameName?: string;
  stars?: number;
}): Activity {
  const activity: Activity = {
    id: genId('act'),
    createdAt: new Date().toISOString(),
    ...input,
  };
  const all = readAll<Activity>(KEY);
  writeAll(KEY, [...all, activity]);
  return activity;
}

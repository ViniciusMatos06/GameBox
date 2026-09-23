// Thin wrapper around localStorage. Every GameBox-native service (auth, lists,
// ratings, users, activity) reads/writes through here, never touching
// localStorage directly. Swapping this module for real HTTP calls to a
// backend later should be enough to migrate the app off localStorage.

const PREFIX = 'gamebox:';

export function readAll<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function writeAll<T>(key: string, value: T[]): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function readOne<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeOne<T>(key: string, value: T): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function removeKey(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

export function genId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

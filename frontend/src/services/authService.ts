import type { User } from '../types/gamebox';
import { api, setToken, clearToken, getToken } from './apiClient';

const USER_CACHE_KEY = 'gamebox:user';

interface AuthResponse {
  token: string;
  user: User;
}

function cacheUser(user: User): void {
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
}

export async function register(input: {
  name: string;
  username: string;
  email: string;
  password: string;
}): Promise<User> {
  const res = await api.post<AuthResponse>('/auth/register', input);
  setToken(res.token);
  cacheUser(res.user);
  return res.user;
}

export async function login(identifier: string, password: string): Promise<User> {
  const res = await api.post<AuthResponse>('/auth/login', { identifier, password });
  setToken(res.token);
  cacheUser(res.user);
  return res.user;
}

export function logout(): void {
  clearToken();
  localStorage.removeItem(USER_CACHE_KEY);
}

/** Synchronous read of the last-known logged-in user (cached at login/refresh time). */
export function getCurrentUser(): User | null {
  if (!getToken()) return null;
  const raw = localStorage.getItem(USER_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

/** Re-fetches the current user from the backend and refreshes the cache. Logs out if the token is no longer valid. */
export async function refreshCurrentUser(): Promise<User | null> {
  if (!getToken()) return null;
  try {
    const user = await api.get<User>('/users/me');
    cacheUser(user);
    return user;
  } catch {
    logout();
    return null;
  }
}

export function updateCachedUser(user: User): void {
  cacheUser(user);
}

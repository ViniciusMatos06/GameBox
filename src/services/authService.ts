import type { User, PublicUser } from '../types/gamebox';
import { readAll, writeAll, readOne, writeOne, removeKey, genId } from './storage';

const USERS_KEY = 'users';
const SESSION_KEY = 'session';

// NOTE: this is a client-only simulation for a frontend-only prototype.
// Passwords are hashed with a trivial non-cryptographic hash purely so we
// never store plaintext in localStorage; this is NOT secure and must be
// replaced by real backend auth before this app handles real users.
function fakeHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `h${hash}`;
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, email, ...rest } = user;
  void passwordHash;
  void email;
  return rest;
}

export function getAllUsers(): User[] {
  return readAll<User>(USERS_KEY);
}

export function findByUsername(username: string): User | undefined {
  return getAllUsers().find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export function register(input: {
  name: string;
  username: string;
  email: string;
  password: string;
  avatarUrl?: string;
}): User {
  const users = getAllUsers();
  if (users.some((u) => u.username.toLowerCase() === input.username.toLowerCase())) {
    throw new Error('Este nome de usuário já está em uso.');
  }
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error('Este email já está cadastrado.');
  }
  const user: User = {
    id: genId('user'),
    name: input.name,
    username: input.username,
    email: input.email,
    passwordHash: fakeHash(input.password),
    bio: '',
    avatarUrl:
      input.avatarUrl ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(input.username)}`,
    createdAt: new Date().toISOString(),
  };
  writeAll(USERS_KEY, [...users, user]);
  setSession(user.username);
  return user;
}

export function login(usernameOrEmail: string, password: string): User {
  const users = getAllUsers();
  const user = users.find(
    (u) =>
      u.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
      u.email.toLowerCase() === usernameOrEmail.toLowerCase()
  );
  if (!user || user.passwordHash !== fakeHash(password)) {
    throw new Error('Email/usuário ou senha inválidos.');
  }
  setSession(user.username);
  return user;
}

export function logout(): void {
  removeKey(SESSION_KEY);
}

export function setSession(username: string): void {
  writeOne(SESSION_KEY, { username });
}

export function getCurrentUser(): User | null {
  const session = readOne<{ username: string }>(SESSION_KEY);
  if (!session) return null;
  return findByUsername(session.username) ?? null;
}

export function updateUser(username: string, patch: Partial<User>): User {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) throw new Error('Usuário não encontrado.');
  users[idx] = { ...users[idx], ...patch };
  writeAll(USERS_KEY, users);
  return users[idx];
}

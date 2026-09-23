import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types/gamebox';
import * as authService from '../services/authService';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => void;
  register: (input: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());

  const login = useCallback((usernameOrEmail: string, password: string) => {
    const u = authService.login(usernameOrEmail, password);
    setUser(u);
  }, []);

  const register = useCallback(
    (input: { name: string; username: string; email: string; password: string }) => {
      const u = authService.register(input);
      setUser(u);
    },
    []
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    setUser(authService.getCurrentUser());
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: Boolean(user), login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return ctx;
}

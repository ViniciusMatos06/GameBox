import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null; // avoid flashing a redirect while the token is being validated
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Explore from './pages/Explore';
import GameDetails from './pages/GameDetails';
import Lists from './pages/Lists';
import ComingSoon from './pages/ComingSoon';

function PublicOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/home" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
      <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
      <Route path="/games/:id" element={<GameDetails />} />

      <Route path="/lists" element={<ProtectedRoute><Lists /></ProtectedRoute>} />
      <Route path="/lists/create" element={<ProtectedRoute><ComingSoon title="Criar lista" /></ProtectedRoute>} />
      <Route path="/lists/:id" element={<ProtectedRoute><ComingSoon title="Página da lista" /></ProtectedRoute>} />

      <Route path="/profile/:username" element={<ProtectedRoute><ComingSoon title="Perfil" /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><ComingSoon title="Editar perfil" /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><ComingSoon title="Configurações" /></ProtectedRoute>} />
      <Route path="/invite/:inviteCode" element={<ProtectedRoute><ComingSoon title="Convite" /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Navbar />
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

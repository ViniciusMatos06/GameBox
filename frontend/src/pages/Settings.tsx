import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Bell, Palette, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import './Settings.css';

export default function Settings() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [activityVisible, setActivityVisible] = useState(true);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="settings-page">
      <h1>Configurações</h1>

      <section className="settings-section">
        <h3><User size={16} /> Conta</h3>
        <div className="settings-row">
          <span>Email</span>
          <span className="settings-value">{user?.email}</span>
        </div>
        <div className="settings-row">
          <span>Username</span>
          <span className="settings-value">@{user?.username}</span>
        </div>
      </section>

      <section className="settings-section">
        <h3><Lock size={16} /> Privacidade</h3>
        <label className="settings-toggle-row">
          <span>Mostrar minha atividade no perfil público</span>
          <input
            type="checkbox"
            checked={activityVisible}
            onChange={(e) => {
              setActivityVisible(e.target.checked);
              showToast('Preferência de privacidade atualizada.');
            }}
          />
        </label>
      </section>

      <section className="settings-section">
        <h3><Bell size={16} /> Notificações</h3>
        <label className="settings-toggle-row">
          <span>Receber notificações por email</span>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => {
              setEmailNotifications(e.target.checked);
              showToast('Preferência de notificações atualizada.');
            }}
          />
        </label>
      </section>

      <section className="settings-section">
        <h3><Palette size={16} /> Aparência</h3>
        <div className="settings-row">
          <span>Tema</span>
          <span className="settings-value">Dark (padrão)</span>
        </div>
      </section>

      <section className="settings-section">
        <h3>Sessão</h3>
        <Button variant="danger" icon={<LogOut size={16} />} onClick={handleLogout}>
          Sair da conta
        </Button>
      </section>
    </div>
  );
}

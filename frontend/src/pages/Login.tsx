import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { Input } from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!identifier || !password) {
      setError('Preencha email/usuário e senha.');
      return;
    }
    setLoading(true);
    try {
      await login(identifier, password);
      showToast('Login realizado com sucesso!');
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Gamepad2 size={26} />
          <span>GameBox</span>
        </div>
        <h2>Bem-vindo de volta</h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email ou usuário"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="voce@email.com"
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {error && <p className="auth-error">{error}</p>}
          <Button type="submit" fullWidth disabled={loading}>
            Entrar
          </Button>
        </form>
        <div className="auth-links">
          <Link to="/forgot-password">Esqueci minha senha</Link>
          <Link to="/register">Criar conta</Link>
        </div>
      </div>
    </div>
  );
}

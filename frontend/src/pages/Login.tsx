import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
    if (!identifier || !password) { setError('Preencha email/usuário e senha.'); return; }
    setLoading(true);
    try {
      await login(identifier, password);
      showToast('Login realizado com sucesso!');
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.');
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-split">
      <div className="auth-art">
        <Link to="/" className="auth-logo">+ GAME<span>BOX</span></Link>
        <h2>Jogue.<br />Avalie.<em>Lembre.</em></h2>
        <p>Seu diário de jogos: notas, listas e descobertas em um só lugar.</p>
      </div>
      <div className="auth-form-side">
        <div className="auth-switch">Não tem conta? <Link to="/register">Criar conta →</Link></div>
        <span className="eyebrow">01 — Acesso</span>
        <h1>Bem-vindo<br />de volta</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Email ou usuário</label>
            <input className="field-input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="voce@email.com" />
          </div>
          <div className="field">
            <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Senha <Link to="/forgot-password" style={{ color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>Esqueci minha senha</Link>
            </label>
            <input className="field-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ justifyContent: 'space-between' }}>
            Entrar <ArrowRight size={16} />
          </button>
        </form>
        <span className="auth-credit">Game data provided by RAWG</span>
      </div>
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Informe seu nome.';
    if (!username.trim()) errs.username = 'Informe um nome de usuário.';
    else if (!/^[a-z0-9_.]{3,20}$/i.test(username)) errs.username = 'Use de 3 a 20 letras, números, "_" ou ".".';
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Informe um email válido.';
    if (password.length < 6) errs.password = 'Mínimo de 6 caracteres.';
    if (confirm !== password) errs.confirm = 'As senhas não coincidem.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ name, username, email, password });
      showToast('Conta criada com sucesso! Bem-vindo ao GameBox.');
      navigate('/home');
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Erro ao criar conta.' });
    } finally { setLoading(false); }
  }

  const field = (label: string, value: string, set: (v: string) => void, key: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="field">
      <label className="field-label">{label}</label>
      <input className={`field-input ${errors[key] ? 'field-input-error' : ''}`} value={value} onChange={(e) => set(e.target.value)} {...props} />
      {errors[key] && <span className="field-error">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="auth-split">
      <div className="auth-art">
        <Link to="/" className="auth-logo">+ GAME<span>BOX</span></Link>
        <h2>Comece<br />sua<em>coleção.</em></h2>
        <p>Crie sua conta para avaliar jogos, montar listas e acompanhar tudo o que você joga.</p>
      </div>
      <div className="auth-form-side">
        <div className="auth-switch">Já tem conta? <Link to="/login">Entrar →</Link></div>
        <span className="eyebrow">02 — Nova conta</span>
        <h1>Crie sua<br />conta</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          {field('Nome', name, setName, 'name')}
          {field('Username', username, setUsername, 'username', { placeholder: '@seunome' })}
          {field('Email', email, setEmail, 'email', { type: 'email' })}
          <div className="auth-row">
            {field('Senha', password, setPassword, 'password', { type: 'password' })}
            {field('Confirmar senha', confirm, setConfirm, 'confirm', { type: 'password' })}
          </div>
          {errors.form && <p className="auth-error">{errors.form}</p>}
          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ justifyContent: 'space-between' }}>
            Criar conta <ArrowRight size={16} />
          </button>
        </form>
        <span className="auth-credit">Game data provided by RAWG</span>
      </div>
    </div>
  );
}

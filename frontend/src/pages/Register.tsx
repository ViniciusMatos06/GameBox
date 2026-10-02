import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { Input } from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (password.length < 6) errs.password = 'A senha deve ter ao menos 6 caracteres.';
    if (confirmPassword !== password) errs.confirmPassword = 'As senhas não coincidem.';
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
        <h2>Crie sua conta</h2>
        <form onSubmit={handleSubmit}>
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            placeholder="vinicius"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <div className="auth-row">
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <Input
              label="Confirmar senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />
          </div>
          {errors.form && <p className="auth-error">{errors.form}</p>}
          <Button type="submit" fullWidth disabled={loading}>
            Criar conta
          </Button>
        </form>
        <div className="auth-links">
          <span />
          <Link to="/login">Já tenho conta</Link>
        </div>
      </div>
    </div>
  );
}

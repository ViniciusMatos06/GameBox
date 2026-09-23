import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { Input } from '../components/common/Input';
import Button from '../components/common/Button';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Gamepad2 size={26} />
          <span>GameBox</span>
        </div>
        <h2>Recuperar senha</h2>
        {sent ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Se {email} estiver cadastrado, enviaremos instruções de recuperação em breve.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" fullWidth>
              Enviar instruções
            </Button>
          </form>
        )}
        <div className="auth-links">
          <Link to="/login">Voltar ao login</Link>
          <span />
        </div>
      </div>
    </div>
  );
}

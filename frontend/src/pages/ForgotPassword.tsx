import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) { e.preventDefault(); setSent(true); }

  return (
    <div className="auth-split">
      <div className="auth-art">
        <Link to="/" className="auth-logo">+ GAME<span>BOX</span></Link><h2>Sem<em>problemas.</em></h2><p>Vamos te ajudar a voltar para o seu diário de jogos.</p></div>
      <div className="auth-form-side">
        <div className="auth-switch"><Link to="/login">← Voltar ao login</Link></div>
        <span className="eyebrow">Recuperação</span>
        <h1>Recuperar<br />senha</h1>
        {sent ? (
          <p style={{ color: 'var(--text-muted)' }}>Se {email} estiver cadastrado, enviaremos instruções de recuperação em breve.</p>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">Email</label>
              <input className="field-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-full" type="submit">Enviar instruções</button>
          </form>
        )}
      </div>
    </div>
  );
}

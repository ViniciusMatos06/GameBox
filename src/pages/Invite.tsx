import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users2, Gamepad2 } from 'lucide-react';
import { getListByInviteCode, joinListByInviteCode } from '../services/listService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import { EmptyState } from '../components/common/States';
import './Invite.css';

export default function Invite() {
  const { inviteCode } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);

  const list = inviteCode ? getListByInviteCode(inviteCode) : undefined;

  if (!list) {
    return (
      <div className="invite-page">
        <EmptyState title="Convite inválido" description="Este link de convite não existe ou expirou." />
      </div>
    );
  }

  const alreadyMember = user ? list.memberUsernames.includes(user.username) : false;

  function handleJoin() {
    if (!user || !inviteCode) return;
    setJoining(true);
    try {
      const joined = joinListByInviteCode(inviteCode, user.username);
      showToast('✓ Você entrou no grupo!');
      navigate(`/lists/${joined.id}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao entrar no grupo.', 'error');
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="invite-page">
      <div className="invite-card">
        <Gamepad2 size={30} className="invite-icon" />
        <h2>Você foi convidado para participar de uma lista!</h2>
        <div className="invite-list-name">
          <Users2 size={16} /> {list.name}
        </div>
        <p className="invite-meta">
          Criada por @{list.ownerUsername} · {list.games.length} jogos · {list.memberUsernames.length} participantes
        </p>

        {!isAuthenticated ? (
          <div className="invite-actions">
            <p className="invite-hint">Entre na sua conta para participar deste grupo.</p>
            <Link to="/login">
              <Button fullWidth>Entrar</Button>
            </Link>
            <Link to="/register">
              <Button fullWidth variant="secondary">
                Criar conta
              </Button>
            </Link>
          </div>
        ) : alreadyMember ? (
          <Link to={`/lists/${list.id}`}>
            <Button fullWidth>Ir para a lista</Button>
          </Link>
        ) : (
          <Button fullWidth onClick={handleJoin} disabled={joining}>
            Entrar no grupo
          </Button>
        )}
      </div>
    </div>
  );
}

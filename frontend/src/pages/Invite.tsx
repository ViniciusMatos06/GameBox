import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users2, Gamepad2 } from 'lucide-react';
import { getInvitePreview, joinListByInviteCode } from '../services/listService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import { EmptyState } from '../components/common/States';
import type { InvitePreview } from '../types/gamebox';
import './Invite.css';

export default function Invite() {
  const { inviteCode } = useParams();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!inviteCode) return;
    getInvitePreview(inviteCode)
      .then(setPreview)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [inviteCode]);

  if (loading) return null;

  if (notFound || !preview) {
    return (
      <div className="invite-page">
        <EmptyState title="Convite inválido" description="Este link de convite não existe ou expirou." />
      </div>
    );
  }

  async function handleJoin() {
    if (!inviteCode) return;
    setJoining(true);
    try {
      const joined = await joinListByInviteCode(inviteCode);
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
          <Users2 size={16} /> {preview.name}
        </div>
        <p className="invite-meta">
          Criada por @{preview.ownerUsername} · {preview.gameCount} jogos · {preview.memberCount} participantes
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
        ) : (
          <Button fullWidth onClick={handleJoin} disabled={joining}>
            Entrar no grupo
          </Button>
        )}
      </div>
    </div>
  );
}

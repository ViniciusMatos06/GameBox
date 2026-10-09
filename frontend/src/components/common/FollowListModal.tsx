import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import { UserAvatar } from './States';
import { getFollowers, getFollowing } from '../../services/followService';
import type { UserSummary } from '../../types/gamebox';

export default function FollowListModal({
  username,
  mode,
  onClose,
}: {
  username: string;
  mode: 'followers' | 'following';
  onClose: () => void;
}) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetcher = mode === 'followers' ? getFollowers : getFollowing;
    fetcher(username)
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [username, mode]);

  return (
    <Modal title={mode === 'followers' ? 'Seguidores' : 'Seguindo'} onClose={onClose}>
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Carregando...</p>
      ) : users.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {mode === 'followers' ? 'Ninguém segue este usuário ainda.' : 'Ainda não segue ninguém.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {users.map((u) => (
            <Link
              key={u.username}
              to={`/profile/${u.username}`}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 8,
                borderRadius: 10,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <UserAvatar src={u.avatarUrl} alt={u.username} size={38} />
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>@{u.username}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Modal>
  );
}

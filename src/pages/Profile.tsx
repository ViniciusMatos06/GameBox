import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Settings, Users2, User as UserIcon } from 'lucide-react';
import { getPublicProfile, getProfileStats } from '../services/userService';
import { getListsForUser } from '../services/listService';
import { getUserActivities } from '../services/activityService';
import { getUserRatingsAcrossLists } from '../services/ratingService';
import { getGamesByIds, hasApiKey } from '../services/rawgApi';
import type { RawgGameDetails } from '../types/rawg';
import { useAuth } from '../context/AuthContext';
import { UserAvatar, EmptyState, Badge } from '../components/common/States';
import Button from '../components/common/Button';
import './Profile.css';

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuth();
  const [gamesById, setGamesById] = useState<Record<number, RawgGameDetails>>({});

  const profile = username ? getPublicProfile(username) : undefined;
  const stats = username ? getProfileStats(username) : null;
  const lists = username ? getListsForUser(username).filter((l) => l.type === 'personal' ? l.ownerUsername === username : true) : [];
  const activities = username ? getUserActivities(username).slice(0, 8) : [];
  const recentRatings = username ? getUserRatingsAcrossLists(username).slice(-8).reverse() : [];

  useEffect(() => {
    if (!hasApiKey() || recentRatings.length === 0) return;
    getGamesByIds(recentRatings.map((r) => r.gameId)).then(setGamesById);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  if (!profile || !stats) {
    return (
      <div className="profile-page">
        <EmptyState title="Usuário não encontrado." />
      </div>
    );
  }

  const isOwnProfile = user?.username === profile.username;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <UserAvatar src={profile.avatarUrl} alt={profile.username} size={84} />
        <div className="profile-header-info">
          <h1>{profile.name}</h1>
          <p className="profile-username">@{profile.username}</p>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          <p className="profile-joined">
            Entrou em {new Date(profile.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        {isOwnProfile && (
          <Link to="/profile/edit">
            <Button variant="secondary" icon={<Settings size={15} />}>
              Editar perfil
            </Button>
          </Link>
        )}
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <strong>{stats.gamesRated}</strong>
          <span>jogos avaliados</span>
        </div>
        <div className="profile-stat">
          <strong>{stats.listsCreated}</strong>
          <span>listas criadas</span>
        </div>
        <div className="profile-stat">
          <strong>{stats.gamesAdded}</strong>
          <span>jogos adicionados</span>
        </div>
        <div className="profile-stat">
          <strong>{stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}</strong>
          <span>média das avaliações</span>
        </div>
      </div>

      <section className="profile-section">
        <h3>Listas</h3>
        {lists.length === 0 ? (
          <p className="profile-empty-text">Nenhuma lista ainda.</p>
        ) : (
          <div className="profile-lists">
            {lists.map((l) => (
              <Link to={`/lists/${l.id}`} key={l.id} className="profile-list-chip">
                {l.type === 'group' ? <Users2 size={13} /> : <UserIcon size={13} />}
                {l.name}
                <Badge>{l.games.length}</Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="profile-section">
        <h3>Jogos avaliados recentemente</h3>
        {recentRatings.length === 0 ? (
          <p className="profile-empty-text">Nenhuma avaliação ainda.</p>
        ) : (
          <div className="profile-recent-games">
            {recentRatings.map((r) => {
              const game = gamesById[r.gameId];
              return (
                <Link to={`/games/${r.gameId}`} key={r.id} className="profile-recent-game">
                  {game?.background_image ? (
                    <img src={game.background_image} alt={game.name} />
                  ) : (
                    <div className="profile-recent-placeholder" />
                  )}
                  <span className="profile-recent-stars">{'★'.repeat(r.stars)}</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="profile-section">
        <h3>Atividade</h3>
        {activities.length === 0 ? (
          <p className="profile-empty-text">Nenhuma atividade ainda.</p>
        ) : (
          <div className="profile-activity-list">
            {activities.map((a) => (
              <div key={a.id} className="profile-activity-item">
                {describeActivity(a, profile.username)}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function describeActivity(a: ReturnType<typeof getUserActivities>[number], username: string): string {
  switch (a.type) {
    case 'rated_game':
      return `avaliou ${a.gameName ?? 'um jogo'} com ${'★'.repeat(a.stars ?? 0)}`;
    case 'added_game':
      return `adicionou ${a.gameName ?? 'um jogo'} à lista ${a.listName ?? ''}`;
    case 'joined_list':
      return `entrou na lista ${a.listName ?? ''}`;
    case 'created_list':
      return `criou a lista ${a.listName ?? ''}`;
    default:
      return `${username} teve uma atividade`;
  }
}

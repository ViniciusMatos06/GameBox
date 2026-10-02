import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Settings, Users2, User as UserIcon } from 'lucide-react';
import { getPublicProfile } from '../services/userService';
import { getListsByUsername } from '../services/listService';
import { getUserActivities } from '../services/activityService';
import { getGamesByIds } from '../services/rawgApi';
import type { RawgGameDetails } from '../types/rawg';
import type { Activity, GameList, PublicProfile } from '../types/gamebox';
import { useAuth } from '../context/AuthContext';
import { UserAvatar, EmptyState, ErrorState, Badge } from '../components/common/States';
import Button from '../components/common/Button';
import './Profile.css';

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [lists, setLists] = useState<GameList[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [gamesById, setGamesById] = useState<Record<number, RawgGameDetails>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getPublicProfile(username),
      getListsByUsername(username),
      getUserActivities(username),
    ])
      .then(([p, l, a]) => {
        setProfile(p);
        setLists(l.filter((list) => (list.type === 'personal' ? list.ownerUsername === username : true)));
        setActivities(a.slice(0, 8));

        const recentGameIds = a
          .filter((act) => act.type === 'rated_game' && act.gameId != null)
          .slice(0, 8)
          .map((act) => act.gameId as number);
        if (recentGameIds.length > 0) {
          getGamesByIds(recentGameIds).then(setGamesById);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return null;

  if (error || !profile) {
    return (
      <div className="profile-page">
        {error ? <ErrorState message={error} /> : <EmptyState title="Usuário não encontrado." />}
      </div>
    );
  }

  const isOwnProfile = user?.username === profile.username;
  const recentRatedActivities = activities.filter((a) => a.type === 'rated_game' && a.gameId != null).slice(0, 8);

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
          <strong>{profile.stats.gamesRated}</strong>
          <span>jogos avaliados</span>
        </div>
        <div className="profile-stat">
          <strong>{profile.stats.listsCreated}</strong>
          <span>listas criadas</span>
        </div>
        <div className="profile-stat">
          <strong>{profile.stats.gamesAdded}</strong>
          <span>jogos adicionados</span>
        </div>
        <div className="profile-stat">
          <strong>{profile.stats.avgRating > 0 ? profile.stats.avgRating.toFixed(1) : '—'}</strong>
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
        {recentRatedActivities.length === 0 ? (
          <p className="profile-empty-text">Nenhuma avaliação ainda.</p>
        ) : (
          <div className="profile-recent-games">
            {recentRatedActivities.map((a) => {
              const game = a.gameId != null ? gamesById[a.gameId] : undefined;
              return (
                <Link to={`/games/${a.gameId}`} key={a.id} className="profile-recent-game">
                  {game?.background_image ? (
                    <img src={game.background_image} alt={game.name} />
                  ) : (
                    <div className="profile-recent-placeholder" />
                  )}
                  <span className="profile-recent-stars">{'★'.repeat(a.stars ?? 0)}</span>
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
                {describeActivity(a)}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function describeActivity(a: Activity): string {
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
      return 'teve uma atividade';
  }
}

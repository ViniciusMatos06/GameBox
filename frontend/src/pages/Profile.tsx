import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pencil, MessageCircle, ArrowRight } from 'lucide-react';
import { getPublicProfile } from '../services/userService';
import { getListsByUsername } from '../services/listService';
import { getUserActivities } from '../services/activityService';
import { getGamesByIds } from '../services/rawgApi';
import { follow, unfollow } from '../services/followService';
import type { RawgGameDetails } from '../types/rawg';
import type { Activity, GameList, PublicProfile } from '../types/gamebox';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useToast } from '../context/ToastContext';
import { UserAvatar, EmptyState, ErrorState } from '../components/common/States';
import FollowListModal from '../components/common/FollowListModal';
import StarRating from '../components/common/StarRating';
import './Profile.css';

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuth();
  const { openConversationWithUser } = useChat();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [lists, setLists] = useState<GameList[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [games, setGames] = useState<Record<number, RawgGameDetails>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<'followers' | 'following' | null>(null);

  function load() {
    if (!username) return;
    setLoading(true);
    setError(null);
    Promise.all([getPublicProfile(username), getListsByUsername(username), getUserActivities(username)])
      .then(([p, l, a]) => {
        setProfile(p);
        setLists(l.filter((x) => (x.type === 'personal' ? x.ownerUsername === username : true)));
        setActivities(a);
        const ids = a.filter((x) => x.type === 'rated_game' && x.gameId != null).slice(0, 6).map((x) => x.gameId as number);
        if (ids.length) getGamesByIds(ids).then(setGames);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }
  useEffect(load, [username]);

  if (loading) return null;
  if (error || !profile) {
    return <div className="profile-page">{error ? <ErrorState message={error} /> : <EmptyState title="Usuário não encontrado." />}</div>;
  }

  const isOwn = user?.username === profile.username;
  const rated = activities.filter((a) => a.type === 'rated_game' && a.gameId != null).slice(0, 6);

  async function toggleFollow() {
    if (!username) return;
    setBusy(true);
    try {
      if (profile!.isFollowing) await unfollow(username); else await follow(username);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao seguir.', 'error');
    } finally { setBusy(false); }
  }

  async function message() {
    if (!username) return;
    try { await openConversationWithUser(username); }
    catch (err) { showToast(err instanceof Error ? err.message : 'Erro ao abrir conversa.', 'error'); }
  }

  return (
    <div className="profile-page">
      {!isOwn && <div className="profile-crumb">Amigos / <b>@{profile.username}</b></div>}

      <header className="profile-head">
        <div className="profile-avatar"><UserAvatar src={profile.avatarUrl} alt={profile.username} size={150} /></div>
        <div className="profile-head-info">
          <span className="eyebrow mono">@{profile.username}</span>
          <h1>{profile.name}</h1>
          <p className="profile-meta">
            {profile.bio || `Entrou em ${new Date(profile.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}
          </p>
          <div className="profile-follow-row">
            <button onClick={() => setModal('followers')}><b>{profile.followersCount}</b> seguidores</button>
            <button onClick={() => setModal('following')}><b>{profile.followingCount}</b> seguindo</button>
          </div>
        </div>
        <div className="profile-actions">
          {isOwn ? (
            <Link to="/profile/edit" className="btn btn-secondary"><Pencil size={14} /> Editar perfil</Link>
          ) : (
            <>
              <button className={`btn ${profile.isFollowing ? 'btn-secondary' : 'btn-primary'}`} onClick={toggleFollow} disabled={busy}>
                {profile.isFollowing ? 'Seguindo' : '+ Seguir'}
              </button>
              <button className="btn btn-secondary" onClick={message}><MessageCircle size={14} /> Mensagem</button>
            </>
          )}
        </div>
      </header>

      <div className="profile-stats">
        <div><strong>{profile.stats.gamesRated}</strong><small>Jogos avaliados</small></div>
        <div><strong>{profile.stats.listsCreated}</strong><small>Listas criadas</small></div>
        <div><strong className="red">{profile.stats.gamesAdded}</strong><small>Jogos adicionados</small></div>
        <div><strong>{profile.stats.avgRating > 0 ? profile.stats.avgRating.toFixed(1) : '—'}</strong><small>Média das avaliações</small></div>
      </div>

      <div className="profile-cols">
        <section>
          <h2 className="display-heading">{isOwn ? 'Atividade' : 'Avaliações recentes'}</h2>
          {isOwn || rated.length === 0 ? (
            activities.length === 0 ? <p className="profile-empty">Nenhuma atividade ainda.</p> : (
              <ul className="profile-timeline">
                {activities.slice(0, 10).map((a) => (
                  <li key={a.id}>{describe(a)}</li>
                ))}
              </ul>
            )
          ) : (
            <div className="profile-rated">
              {rated.map((a) => (
                <Link key={a.id} to={`/games/${a.gameId}`} className="profile-rated-row">
                  {games[a.gameId as number]?.background_image ? <img src={games[a.gameId as number].background_image as string} alt="" /> : <i />}
                  <div><strong>{a.gameName}</strong></div>
                  <StarRating value={a.stars ?? 0} readOnly size={14} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside>
          <h2 className="display-heading">{isOwn ? 'Listas' : 'Listas públicas'}</h2>
          {lists.length === 0 ? <p className="profile-empty">Nenhuma lista ainda.</p> : lists.map((l) => (
            <Link to={`/lists/${l.id}`} key={l.id} className="profile-list-row"><span>{l.name}</span><b>{l.games.length}</b></Link>
          ))}

          {isOwn && (
            <>
              <h2 className="display-heading" style={{ marginTop: 32 }}>Amigos</h2>
              <Link to="/people" className="profile-list-row">
                <span>Você segue {profile.followingCount} {profile.followingCount === 1 ? 'pessoa' : 'pessoas'}<small>Veja atividade e encontre amigos</small></span>
                <ArrowRight size={16} />
              </Link>
              <h2 className="display-heading" style={{ marginTop: 32 }}>Avaliados recentemente</h2>
              {rated.length === 0 ? (
                <div className="profile-empty-box">Nenhuma avaliação ainda.<Link to="/explore" className="btn btn-secondary">Explorar jogos →</Link></div>
              ) : (
                <div className="profile-thumbs">
                  {rated.map((a) => (
                    <Link key={a.id} to={`/games/${a.gameId}`}>
                      {games[a.gameId as number]?.background_image ? <img src={games[a.gameId as number].background_image as string} alt="" /> : <i />}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </aside>
      </div>

      {modal && username && <FollowListModal username={username} mode={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

function describe(a: Activity): React.ReactNode {
  switch (a.type) {
    case 'rated_game': return <>avaliou <b>{a.gameName}</b> com {'★'.repeat(a.stars ?? 0)}</>;
    case 'added_game': return <>adicionou <b>{a.gameName}</b> à lista {a.listName}</>;
    case 'joined_list': return <>entrou na lista <b>{a.listName}</b></>;
    case 'created_list': return <>criou a lista <b>{a.listName}</b></>;
    default: return 'teve uma atividade';
  }
}

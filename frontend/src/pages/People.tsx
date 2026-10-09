import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import { getActivityFeed } from '../services/activityService';
import { getFollowing, getSuggestions, follow } from '../services/followService';
import { searchUsers } from '../services/userService';
import type { FeedActivity, UserSummary } from '../types/gamebox';
import { UserAvatar, EmptyState } from '../components/common/States';
import StarRating from '../components/common/StarRating';
import './People.css';

type Tab = 'activity' | 'following' | 'discover';

export default function People() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('activity');
  const [feed, setFeed] = useState<FeedActivity[]>([]);
  const [following, setFollowing] = useState<UserSummary[]>([]);
  const [suggestions, setSuggestions] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSummary[]>([]);
  const [searching, setSearching] = useState(false);
  const debounced = useDebounce(query, 350);

  function loadAll() {
    if (!user) return;
    setLoading(true);
    Promise.all([getActivityFeed(), getFollowing(user.username), getSuggestions()])
      .then(([f, flw, sug]) => { setFeed(f); setFollowing(flw); setSuggestions(sug); })
      .finally(() => setLoading(false));
  }
  useEffect(loadAll, [user]);

  useEffect(() => {
    if (!debounced.trim()) { setResults([]); return; }
    let active = true;
    setSearching(true);
    searchUsers(debounced).then((r) => active && setResults(r)).finally(() => active && setSearching(false));
    return () => { active = false; };
  }, [debounced]);

  async function handleFollow(username: string) {
    try {
      await follow(username);
      showToast(`Você está seguindo @${username}`);
      loadAll();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao seguir.', 'error');
    }
  }

  const followingSet = new Set(following.map((f) => f.username));

  const row = (u: UserSummary, size = 38) => (
    <div key={u.username} className="people-row">
      <Link to={`/profile/${u.username}`} className="people-row-info">
        <UserAvatar src={u.avatarUrl} alt={u.username} size={size} />
        <div><strong>{u.name}</strong><span>@{u.username}</span></div>
      </Link>
      {followingSet.has(u.username)
        ? <span className="people-following-tag">Seguindo</span>
        : <button className="people-follow-btn" onClick={() => handleFollow(u.username)}>+ Seguir</button>}
    </div>
  );

  const list = (title: string, users: UserSummary[], isLoading: boolean) => (
    <div>
      <h3 className="people-list-title">{title}</h3>
      {isLoading ? null : users.length === 0 ? <EmptyState title="Ninguém por aqui ainda." /> : <div className="people-col">{users.map((u) => row(u))}</div>}
    </div>
  );

  return (
    <div className="people-page">
      <div className="people-header">
        <div>
          <span className="eyebrow">Rede social</span>
          <h1 className="display-heading">Amigos</h1>
        </div>
        <div className="people-search">
          <Search size={16} />
          <input placeholder="Buscar pessoas por nome ou @username" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="people-tabs">
        <button className={tab === 'activity' ? 'active' : ''} onClick={() => setTab('activity')}>Atividade</button>
        <button className={tab === 'following' ? 'active' : ''} onClick={() => setTab('following')}>Seguindo ({following.length})</button>
        <button className={tab === 'discover' ? 'active' : ''} onClick={() => setTab('discover')}>Descobrir</button>
      </div>

      <div className="people-layout">
        <div>
          {query.trim() ? list(`Resultados para "${query}"`, results, searching)
            : tab === 'activity' ? (
              loading ? null : feed.length === 0 ? (
                <EmptyState title="Nenhuma atividade ainda." description="Siga pessoas para ver o que elas estão jogando e avaliando aqui." />
              ) : (
                <div>
                  {feed.map((a) => (
                    <div className="people-feed-item" key={a.id}>
                      <Link to={`/profile/${a.author.username}`}><UserAvatar src={a.author.avatarUrl} alt={a.author.username} size={38} /></Link>
                      <div className="people-feed-body">
                        <p>
                          <Link to={`/profile/${a.author.username}`} className="people-feed-author">{a.author.name}</Link>{' '}
                          {describe(a)}
                        </p>
                        {a.type === 'rated_game' && a.stars != null && <StarRating value={a.stars} readOnly size={13} />}
                        <span className="people-feed-time">{timeAgo(a.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )
            : tab === 'following' ? list('Pessoas que você segue', following, loading)
            : list('Sugestões pra você', suggestions, loading)}
        </div>

        <aside className="people-sidebar">
          <h3 className="people-list-title">Sugestões para seguir</h3>
          {suggestions.length === 0 ? <p className="people-empty">Sem sugestões por agora.</p> : <div className="people-col">{suggestions.map((s) => row(s, 34))}</div>}
        </aside>
      </div>
    </div>
  );
}

function describe(a: FeedActivity): string {
  switch (a.type) {
    case 'rated_game': return `avaliou ${a.gameName ?? 'um jogo'}`;
    case 'added_game': return `adicionou ${a.gameName ?? 'um jogo'} à lista ${a.listName ?? ''}`;
    case 'joined_list': return `entrou na lista ${a.listName ?? ''}`;
    case 'created_list': return `criou a lista ${a.listName ?? ''}`;
    default: return 'teve uma atividade';
  }
}

export function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `há ${days} d`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyLists } from '../services/listService';
import { getPopularGames, getUpcomingGames, getGamesByIds } from '../services/rawgApi';
import { getUserActivities } from '../services/activityService';
import type { RawgGame, RawgGameDetails } from '../types/rawg';
import type { Activity, GameList } from '../types/gamebox';
import GameGrid from '../components/game/GameGrid';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const [popular, setPopular] = useState<RawgGame[]>([]);
  const [upcoming, setUpcoming] = useState<RawgGame[]>([]);
  const [lists, setLists] = useState<GameList[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [covers, setCovers] = useState<Record<number, RawgGameDetails>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getMyLists().then((l) => {
      setLists(l);
      const ids = l[0]?.games.slice(0, 3).map((g) => g.gameId) ?? [];
      if (ids.length) getGamesByIds(ids).then(setCovers);
    }).catch(() => {});
    getUserActivities(user.username).then(setActivities).catch(() => {});
  }, [user]);

  useEffect(() => {
    Promise.all([getPopularGames(), getUpcomingGames()])
      .then(([p, u]) => { setPopular(p.results); setUpcoming(u.results); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '').toUpperCase();
  const savedGames = lists.reduce((n, l) => n + l.games.length, 0);
  const rated = activities.filter((a) => a.type === 'rated_game').length;
  const featured = popular[0];
  const ranking = popular.slice(0, 6);
  const mostSearched = popular.slice(6, 12);
  const firstList = lists[0];

  return (
    <div className="home-page">
      <header className="home-hero">
        <div>
          <span className="eyebrow">{today} — Início</span>
          <h1>Olá,<span>{user?.name.split(' ')[0]}</span></h1>
        </div>
        <div className="home-stats">
          <div><strong>{lists.length}</strong><small>Listas</small></div>
          <div><strong>{savedGames}</strong><small>Jogos salvos</small></div>
          <div><strong>{rated}</strong><small>Avaliados</small></div>
        </div>
      </header>

      <div className="home-top">
        {featured && (
          <Link to={`/games/${featured.id}`} className="home-featured" style={featured.background_image ? { backgroundImage: `linear-gradient(180deg, rgba(12,12,12,0.15), rgba(12,12,12,0.95)), url(${featured.background_image})` } : undefined}>
            <span className="home-featured-tag">Em destaque</span>
            <h2 className="display-heading">{featured.name}</h2>
            <div className="home-featured-meta">
              <b>★ {featured.rating.toFixed(1)}</b>
              <span>{featured.released ? new Date(featured.released).getFullYear() : ''}</span>
              <span>{featured.genres?.[0]?.name}</span>
            </div>
            <span className="home-featured-btn">Ver jogo <ArrowRight size={15} /></span>
          </Link>
        )}
        <aside className="home-ranking">
          <header><h3 className="display-heading">Jogos populares</h3><Link to="/explore">Explorar →</Link></header>
          {ranking.map((g, i) => (
            <Link to={`/games/${g.id}`} key={g.id} className="home-rank-row">
              <b className={i === 0 ? 'first' : ''}>{String(i + 1).padStart(2, '0')}</b>
              <div><strong>{g.name}</strong><small>{g.released ? new Date(g.released).getFullYear() : ''} · {g.genres?.[0]?.name}</small></div>
              <em>★ {g.rating.toFixed(1)}</em>
            </Link>
          ))}
        </aside>
      </div>

      <section className="home-section">
        <header><h2 className="display-heading">Próximos lançamentos</h2><Link to="/explore">Explorar →</Link></header>
        <GameGrid games={upcoming.slice(0, 6)} loading={loading} skeletonCount={6} />
      </section>

      {mostSearched.length > 0 && (
        <section className="home-section">
          <header><h2 className="display-heading">Os mais buscados</h2><Link to="/explore">Explorar →</Link></header>
          <GameGrid games={mostSearched} loading={false} />
        </section>
      )}

      <section className="home-list-strip">
        {firstList ? (
          <>
            <div className="home-strip-covers">
              {firstList.games.slice(0, 3).map((g) => covers[g.gameId]?.background_image
                ? <img key={g.gameId} src={covers[g.gameId].background_image as string} alt="" /> : <i key={g.gameId} />)}
            </div>
            <div>
              <span className="eyebrow">Suas listas</span>
              <h2 className="display-heading">{firstList.name}</h2>
              <small>{firstList.games.length} jogos · {firstList.type === 'group' ? 'Grupo' : 'Pessoal'}</small>
            </div>
            <Link to="/lists" className="btn btn-secondary">Ver todas <ArrowRight size={15} /></Link>
          </>
        ) : (
          <>
            <div><span className="eyebrow">Suas listas</span><h2 className="display-heading">Crie sua primeira lista</h2></div>
            <Link to="/lists/create" className="btn btn-primary"><Plus size={15} /> Criar lista</Link>
          </>
        )}
      </section>
    </div>
  );
}

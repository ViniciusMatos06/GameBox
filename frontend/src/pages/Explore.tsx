import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { searchGames, getGenres } from '../services/rawgApi';
import type { RawgGame, GameOrdering } from '../types/rawg';
import GameGrid from '../components/game/GameGrid';
import { ErrorState, EmptyState } from '../components/common/States';
import Button from '../components/common/Button';
import './Explore.css';

const ORDER: { value: GameOrdering; label: string }[] = [
  { value: '-added', label: 'Mais populares' },
  { value: '-rating', label: 'Mais bem avaliados' },
  { value: '-released', label: 'Lançamentos recentes' },
  { value: '-metacritic', label: 'Melhor Metacritic' },
];

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const debounced = useDebounce(query, 400);
  const [genre, setGenre] = useState('');
  const [ordering, setOrdering] = useState<GameOrdering>('-added');
  const [genres, setGenres] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [games, setGames] = useState<RawgGame[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { getGenres().then(setGenres).catch(() => {}); }, []);

  function load(target: number) {
    setLoading(true);
    setError(null);
    searchGames({ search: debounced || undefined, page: target, genres: genre || undefined, ordering })
      .then((res) => {
        setGames((prev) => (target === 1 ? res.results : [...prev, ...res.results]));
        setCount(res.count);
        setHasNext(Boolean(res.next));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setParams(debounced ? { q: debounced } : {}, { replace: true });
    setPage(1);
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, genre, ordering]);

  return (
    <div className="explore-page">
      <header className="explore-head">
        <div>
          <span className="eyebrow">{count.toLocaleString('pt-BR')} jogos no catálogo</span>
          <h1>Explorar</h1>
        </div>
        <div className="explore-search">
          <Search size={16} />
          <input placeholder="Pesquisar no catálogo" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </header>

      <div className="explore-layout">
        <aside className="explore-filters">
          <small>Gênero</small>
          <div className="explore-group">
            <button className={genre === '' ? 'active' : ''} onClick={() => setGenre('')}>Todos</button>
            {genres.slice(0, 12).map((g) => (
              <button key={g.id} className={genre === g.slug ? 'active' : ''} onClick={() => setGenre(g.slug)}>{g.name}</button>
            ))}
          </div>
          <small>Ordenar por</small>
          <div className="explore-group">
            {ORDER.map((o) => (
              <button key={o.value} className={ordering === o.value ? 'active' : ''} onClick={() => setOrdering(o.value)}>{o.label}</button>
            ))}
          </div>
        </aside>

        <div>
          {error ? <ErrorState message={error} onRetry={() => load(1)} />
            : games.length === 0 && !loading ? <EmptyState title="Nenhum jogo encontrado." />
            : (
              <>
                <GameGrid games={games} loading={loading && page === 1} />
                {hasNext && !loading && (
                  <div className="explore-more"><Button variant="secondary" onClick={() => { const n = page + 1; setPage(n); load(n); }}>Carregar mais</Button></div>
                )}
              </>
            )}
        </div>
      </div>
    </div>
  );
}

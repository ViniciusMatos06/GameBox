import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { searchGames, getGenres, getPlatforms, hasApiKey } from '../services/rawgApi';
import type { RawgGame, GameOrdering } from '../types/rawg';
import GameGrid from '../components/game/GameGrid';
import { ErrorState, EmptyState } from '../components/common/States';
import Button from '../components/common/Button';
import './Explore.css';

const ORDER_OPTIONS: { value: GameOrdering; label: string }[] = [
  { value: '-added', label: 'Mais populares' },
  { value: '-rating', label: 'Mais bem avaliados' },
  { value: '-released', label: 'Lançamentos recentes' },
  { value: '-metacritic', label: 'Melhor Metacritic' },
];

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const debouncedQuery = useDebounce(query, 400);

  const [genre, setGenre] = useState('');
  const [platform, setPlatform] = useState('');
  const [ordering, setOrdering] = useState<GameOrdering>('-added');
  const [showFilters, setShowFilters] = useState(false);

  const [genres, setGenres] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [platforms, setPlatforms] = useState<{ id: number; name: string; slug: string }[]>([]);

  const [games, setGames] = useState<RawgGame[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasApiKey()) return;
    getGenres().then(setGenres).catch(() => {});
    getPlatforms().then((p) => setPlatforms(p.slice(0, 20))).catch(() => {});
  }, []);

  useEffect(() => {
    setParams(debouncedQuery ? { q: debouncedQuery } : {}, { replace: true });
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, genre, platform, ordering]);

  function load(targetPage: number) {
    if (!hasApiKey()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    searchGames({
      search: debouncedQuery || undefined,
      page: targetPage,
      genres: genre || undefined,
      platforms: platform || undefined,
      ordering,
    })
      .then((res) => {
        if (targetPage === 1) {
          setGames(res.results);
        } else {
          setGames((prev) => [...prev, ...res.results]);
        }
        setHasNext(Boolean(res.next));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, genre, platform, ordering]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    load(next);
  }

  return (
    <div className="explore-page">
      <h1>Explorar jogos</h1>

      <div className="explore-search-row">
        <div className="explore-search">
          <Search size={16} />
          <input
            placeholder="Pesquisar jogos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="explore-filter-toggle" onClick={() => setShowFilters((s) => !s)}>
          <SlidersHorizontal size={16} /> Filtros
        </button>
      </div>

      {showFilters && (
        <div className="explore-filters">
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">Todos os gêneros</option>
            {genres.map((g) => (
              <option key={g.id} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="">Todas as plataformas</option>
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select value={ordering} onChange={(e) => setOrdering(e.target.value as GameOrdering)}>
            {ORDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {!hasApiKey() ? (
        <EmptyState
          title="Chave da RAWG não configurada"
          description="Copie .env.example para .env e adicione sua VITE_RAWG_API_KEY para pesquisar o catálogo real."
        />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(1)} />
      ) : games.length === 0 && !loading ? (
        <EmptyState title="Nenhum jogo encontrado." />
      ) : (
        <>
          <GameGrid games={games} loading={loading && page === 1} />
          {hasNext && !loading && (
            <div className="explore-load-more">
              <Button variant="secondary" onClick={loadMore}>
                Carregar mais
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

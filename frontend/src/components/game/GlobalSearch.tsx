import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { searchGames } from '../../services/rawgApi';
import type { RawgGame } from '../../types/rawg';
import './GlobalSearch.css';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RawgGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 400);
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    let active = true;
    setLoading(true);
    searchGames({ search: debounced, page_size: 6 })
      .then((res) => {
        if (active) setResults(res.results);
      })
      .catch(() => {
        if (active) setResults([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debounced]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function goToExplore() {
    if (query.trim()) {
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  return (
    <div className="global-search" ref={boxRef}>
      <div className="global-search-input">
        <Search size={16} />
        <input
          placeholder="Pesquisar jogos..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && goToExplore()}
        />
        {loading && <Loader2 size={14} className="spin" />}
      </div>
      {open && query.trim() && (
        <div className="global-search-dropdown">
          {loading ? (
            <div className="global-search-empty">Buscando...</div>
          ) : results.length === 0 ? (
            <div className="global-search-empty">Nenhum jogo encontrado.</div>
          ) : (
            <>
              {results.map((g) => (
                <button
                  key={g.id}
                  className="global-search-item"
                  onClick={() => {
                    navigate(`/games/${g.id}`);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  {g.background_image ? (
                    <img src={g.background_image} alt="" />
                  ) : (
                    <div className="global-search-item-placeholder" />
                  )}
                  <div>
                    <div className="global-search-item-name">{g.name}</div>
                    <div className="global-search-item-year">
                      {g.released ? new Date(g.released).getFullYear() : '—'}
                    </div>
                  </div>
                </button>
              ))}
              <button className="global-search-seeall" onClick={goToExplore}>
                Ver todos os resultados para "{query}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import Modal from '../common/Modal';
import { useDebounce } from '../../hooks/useDebounce';
import { searchGames } from '../../services/rawgApi';
import type { RawgGame } from '../../types/rawg';
import { useToast } from '../../context/ToastContext';
import './AddGameModal.css';

export default function AddGameModal({
  existingGameIds,
  onAdd,
  onClose,
}: {
  existingGameIds: number[];
  onAdd: (game: RawgGame) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RawgGame[]>([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query, 400);
  const { showToast } = useToast();

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    let active = true;
    setLoading(true);
    searchGames({ search: debounced, page_size: 10 })
      .then((res) => active && setResults(res.results))
      .catch(() => active && setResults([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [debounced]);

  function handleAdd(game: RawgGame) {
    if (existingGameIds.includes(game.id)) {
      showToast('Este jogo já está nesta lista.', 'info');
      return;
    }
    onAdd(game);
  }

  return (
    <Modal title="Adicionar jogo" onClose={onClose}>
      <div className="add-game-search">
        <Search size={16} />
        <input
          autoFocus
          placeholder="Pesquisar um jogo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="add-game-hint">Buscando...</p>
      ) : results.length === 0 && debounced.trim() ? (
        <p className="add-game-hint">Nenhum jogo encontrado.</p>
      ) : null}

      <div className="add-game-results">
        {results.map((g) => {
          const already = existingGameIds.includes(g.id);
          return (
            <div key={g.id} className="add-game-row">
              {g.background_image ? (
                <img src={g.background_image} alt="" />
              ) : (
                <div className="add-game-row-placeholder" />
              )}
              <div className="add-game-row-info">
                <div className="add-game-row-name">{g.name}</div>
                <div className="add-game-row-meta">
                  {g.released ? new Date(g.released).getFullYear() : '—'} ·{' '}
                  {g.genres?.[0]?.name ?? 'Sem gênero'} ·{' '}
                  {g.platforms?.[0]?.platform.name ?? 'Multi-plataforma'}
                </div>
              </div>
              <button
                className="add-game-row-btn"
                disabled={already}
                onClick={() => handleAdd(g)}
                title={already ? 'Já está na lista' : 'Adicionar'}
              >
                <Plus size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

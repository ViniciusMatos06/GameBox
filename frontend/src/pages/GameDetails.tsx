import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ExternalLink, Plus, Users2 } from 'lucide-react';
import { getGameDetails, getGameScreenshots } from '../services/rawgApi';
import type { RawgGameDetails, RawgScreenshot } from '../types/rawg';
import { ErrorState, Badge, Skeleton } from '../components/common/States';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getMyLists, addGameToList } from '../services/listService';
import type { GameList } from '../types/gamebox';
import './GameDetails.css';

export default function GameDetails() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [game, setGame] = useState<RawgGameDetails | null>(null);
  const [screenshots, setScreenshots] = useState<RawgScreenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [myLists, setMyLists] = useState<GameList[]>([]);

  function load() {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([getGameDetails(id), getGameScreenshots(id)])
      .then(([g, s]) => {
        setGame(g);
        setScreenshots(s.slice(0, 6));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    getMyLists().then(setMyLists).catch(() => {});
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="game-details-page">
        <Skeleton className="gd-hero-skeleton" />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="game-details-page">
        <ErrorState message={error ?? 'Jogo não encontrado.'} onRetry={load} />
      </div>
    );
  }

  async function handleAddToList(listId: string) {
    if (!game) return;
    try {
      const updated = await addGameToList(listId, game.id, game.name);
      setMyLists((prev) => prev.map((l) => (l.id === listId ? updated : l)));
      showToast(`✓ ${game.name} foi adicionado à lista.`);
      setAddOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao adicionar jogo.', 'error');
    }
  }

  return (
    <div className="game-details-page">
      <div
        className="gd-hero"
        style={{ backgroundImage: game.background_image ? `url(${game.background_image})` : undefined }}
      >
        <div className="gd-hero-overlay" />
      </div>

      <div className="gd-content">
        <div className="gd-main">
          <h1>{game.name}</h1>
          <div className="gd-meta-row">
            {game.released && <span>{new Date(game.released).getFullYear()}</span>}
            {game.developers?.[0] && <span>{game.developers[0].name}</span>}
            {game.genres.map((g) => (
              <Badge key={g.id}>{g.name}</Badge>
            ))}
          </div>

          <div className="gd-ratings">
            <div className="gd-rating-box">
              <span className="gd-rating-label">RAWG</span>
              <span className="gd-rating-value gd-rating-rawg">
                <Star size={16} fill="currentColor" /> {game.rating.toFixed(1)} / 5
              </span>
              <span className="gd-rating-sub">{game.ratings_count} avaliações</span>
            </div>
            {game.metacritic != null && (
              <div className="gd-rating-box">
                <span className="gd-rating-label">Metacritic</span>
                <span className="gd-rating-value">{game.metacritic}</span>
              </div>
            )}
          </div>

          {game.description_raw && (
            <p className="gd-description">{game.description_raw.slice(0, 900)}</p>
          )}

          {screenshots.length > 0 && (
            <>
              <h3>Screenshots</h3>
              <div className="gd-screenshots">
                {screenshots.map((s) => (
                  <img key={s.id} src={s.image} alt={game.name} loading="lazy" />
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="gd-sidebar">
          <div className="gd-sidebar-card">
            <h4>Adicionar à lista</h4>
            {isAuthenticated ? (
              <Button fullWidth icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
                Adicionar à lista
              </Button>
            ) : (
              <p className="gd-sidebar-hint">Entre na sua conta para adicionar este jogo a uma lista.</p>
            )}
          </div>

          <div className="gd-sidebar-card">
            <h4>Informações</h4>
            <dl className="gd-info-list">
              <dt>Plataformas</dt>
              <dd>{game.platforms?.map((p) => p.platform.name).join(', ') || '—'}</dd>
              <dt>Publisher</dt>
              <dd>{game.publishers?.[0]?.name ?? '—'}</dd>
              {game.esrb_rating && (
                <>
                  <dt>Classificação</dt>
                  <dd>{game.esrb_rating.name}</dd>
                </>
              )}
              {game.website && (
                <>
                  <dt>Site oficial</dt>
                  <dd>
                    <a href={game.website} target="_blank" rel="noreferrer" className="gd-website-link">
                      Visitar <ExternalLink size={12} />
                    </a>
                  </dd>
                </>
              )}
            </dl>
          </div>
        </aside>
      </div>

      {addOpen && (
        <Modal title="Adicionar à lista" onClose={() => setAddOpen(false)}>
          {myLists.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Você ainda não tem nenhuma lista. Crie uma na página de listas primeiro.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myLists.map((l) => (
                <button
                  key={l.id}
                  className="gd-list-option"
                  onClick={() => handleAddToList(l.id)}
                  disabled={l.games.some((g) => g.gameId === game.id)}
                >
                  <span>{l.name}</span>
                  <span className="gd-list-option-meta">
                    {l.type === 'group' ? <Users2 size={13} /> : null}
                    {l.games.length} jogos
                    {l.games.some((g) => g.gameId === game.id) ? ' · já adicionado' : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

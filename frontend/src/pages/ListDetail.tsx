import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Share2, Users2, User as UserIcon, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getListById,
  canEditList,
  addGameToList,
  removeGameFromList,
  participantStats,
} from '../services/listService';
import { getGamesByIds } from '../services/rawgApi';
import { getRatingsSummary, rateGame } from '../services/ratingService';
import type { RawgGame, RawgGameDetails } from '../types/rawg';
import type { GameList, RatingsSummary } from '../types/gamebox';
import AddGameModal from '../components/list/AddGameModal';
import ShareModal from '../components/list/ShareModal';
import GameRatingModal from '../components/list/GameRatingModal';
import { UserAvatar, EmptyState, ErrorState, Badge, GameCardSkeleton } from '../components/common/States';
import StarRating from '../components/common/StarRating';
import Button from '../components/common/Button';
import './ListDetail.css';

export default function ListDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [list, setList] = useState<GameList | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [gamesById, setGamesById] = useState<Record<number, RawgGameDetails>>({});
  const [ratingsByGame, setRatingsByGame] = useState<Record<number, RatingsSummary>>({});
  const [loadingGames, setLoadingGames] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [ratingGameId, setRatingGameId] = useState<number | null>(null);

  const refresh = useCallback(() => {
    if (!id) return;
    setListError(null);
    getListById(id)
      .then(setList)
      .catch((e) => setListError(e.message));
  }, [id]);

  useEffect(refresh, [refresh]);

  const gameIdsKey = list ? list.games.map((g) => g.gameId).sort((a, b) => a - b).join(',') : '';

  useEffect(() => {
    if (!list || list.games.length === 0) {
      setLoadingGames(false);
      return;
    }
    setLoadingGames(true);
    const ids = list.games.map((g) => g.gameId);
    Promise.all([
      getGamesByIds(ids),
      Promise.all(ids.map((gid) => getRatingsSummary(list.id, gid).then((r) => [gid, r] as const))),
    ])
      .then(([games, ratingsEntries]) => {
        setGamesById(games);
        setRatingsByGame(Object.fromEntries(ratingsEntries));
      })
      .finally(() => setLoadingGames(false));
  }, [list?.id, gameIdsKey]);

  if (listError) {
    return (
      <div className="list-detail-page">
        <ErrorState message={listError} onRetry={refresh} />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="list-detail-page">
        <EmptyState title="Carregando lista..." />
      </div>
    );
  }

  const canEdit = canEditList(list, user?.username);
  const isGroup = list.type === 'group';

  async function handleAddGame(game: RawgGame) {
    if (!list) return;
    try {
      const updated = await addGameToList(list.id, game.id, game.name);
      setList(updated);
      setGamesById((prev) => ({
        ...prev,
        [game.id]: { ...game, description_raw: '', website: null, developers: [], publishers: [], esrb_rating: null } as RawgGameDetails,
      }));
      showToast(`✓ ${game.name} foi adicionado à lista.`);
      setAddOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao adicionar jogo.', 'error');
    }
  }

  async function handleRemove(gameId: number, gameName: string) {
    if (!list) return;
    if (!window.confirm(`Remover "${gameName}" desta lista?`)) return;
    try {
      await removeGameFromList(list.id, gameId);
      showToast('Jogo removido da lista.', 'info');
      refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao remover jogo.', 'error');
    }
  }

  async function handleRatePersonal(gameId: number, gameName: string, stars: number) {
    if (!list) return;
    try {
      const summary = await rateGame({ listId: list.id, gameId, gameName, stars });
      setRatingsByGame((prev) => ({ ...prev, [gameId]: summary }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao avaliar jogo.', 'error');
    }
  }

  const stats = isGroup ? participantStats(list) : [];

  return (
    <div className="list-detail-page">
      <div className="ld-header">
        <div>
          <div className="ld-header-top">
            <h1>{list.name}</h1>
            {isGroup ? <Badge tone="accent"><Users2 size={12} /> Grupo</Badge> : <Badge><UserIcon size={12} /> Pessoal</Badge>}
          </div>
          {list.description && <p className="ld-description">{list.description}</p>}
          <div className="ld-meta">
            <span>Criada por @{list.ownerUsername}</span>
            <span><Calendar size={12} /> {new Date(list.createdAt).toLocaleDateString('pt-BR')}</span>
            <span>{list.games.length} jogos</span>
            {isGroup && <span>{list.memberUsernames.length} participantes</span>}
          </div>
        </div>
        <div className="ld-actions">
          {canEdit && (
            <Button icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
              Adicionar jogo
            </Button>
          )}
          {isGroup && (
            <Button variant="secondary" icon={<Share2 size={16} />} onClick={() => setShareOpen(true)}>
              Compartilhar
            </Button>
          )}
        </div>
      </div>

      {isGroup && stats.length > 0 && (
        <div className="ld-participants">
          <h3>Participantes</h3>
          <div className="ld-participants-list">
            {stats.map((s) => (
              <Link to={`/profile/${s.username}`} key={s.username} className="ld-participant">
                <UserAvatar src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(s.username)}`} alt={s.username} size={34} />
                <div>
                  <div className="ld-participant-name">@{s.username}</div>
                  <div className="ld-participant-meta">{s.gamesAdded} jogos adicionados</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="ld-games-section">
        <h3>Jogos</h3>
        {list.games.length === 0 ? (
          <EmptyState
            title="Nenhum jogo nesta lista ainda."
            description={canEdit ? 'Adicione o primeiro jogo real da RAWG.' : 'O dono ainda não adicionou jogos.'}
            action={
              canEdit ? (
                <Button onClick={() => setAddOpen(true)} icon={<Plus size={16} />}>
                  Adicionar jogo
                </Button>
              ) : undefined
            }
          />
        ) : loadingGames ? (
          <div className="ld-games-grid">
            {list.games.map((g) => (
              <GameCardSkeleton key={g.gameId} />
            ))}
          </div>
        ) : (
          <div className="ld-games-grid">
            {list.games.map((entry) => {
              const game = gamesById[entry.gameId];
              if (!game) return null;
              const year = game.released ? new Date(game.released).getFullYear() : '—';
              const summary = ratingsByGame[game.id];
              const myRating = user ? summary?.ratings.find((r) => r.username === user.username) : undefined;

              return (
                <div key={entry.gameId} className="ld-game-card">
                  <div
                    className="ld-game-cover"
                    onClick={() => (isGroup ? setRatingGameId(game.id) : navigate(`/games/${game.id}`))}
                  >
                    {game.background_image ? (
                      <img src={game.background_image} alt={game.name} loading="lazy" />
                    ) : (
                      <div className="ld-game-cover-placeholder">Sem capa</div>
                    )}
                  </div>
                  <div className="ld-game-info">
                    <Link to={`/games/${game.id}`} className="ld-game-name">
                      {game.name}
                    </Link>
                    <div className="ld-game-meta">
                      <span>{year}</span>
                      {game.genres?.[0] && <span>{game.genres[0].name}</span>}
                    </div>

                    {isGroup ? (
                      <button className="ld-game-rating-summary" onClick={() => setRatingGameId(game.id)}>
                        {summary?.average != null ? (
                          <>
                            <span className="ld-avg-stars">★ {summary.average.toFixed(1)}</span>
                            <span className="ld-rating-count">
                              {summary.count} avaliaç{summary.count === 1 ? 'ão' : 'ões'}
                            </span>
                          </>
                        ) : (
                          <span className="ld-rating-count">Nenhuma avaliação ainda</span>
                        )}
                        <span className="ld-added-by">Adicionado por @{entry.addedByUsername}</span>
                      </button>
                    ) : (
                      <div className="ld-game-rate-row">
                        <StarRating
                          value={myRating?.stars ?? 0}
                          size={16}
                          readOnly={!canEdit}
                          onChange={(stars) => handleRatePersonal(game.id, game.name, stars)}
                        />
                        {canEdit && (
                          <button
                            className="ld-remove-btn"
                            onClick={() => handleRemove(game.id, game.name)}
                            title="Remover"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {addOpen && (
        <AddGameModal
          existingGameIds={list.games.map((g) => g.gameId)}
          onAdd={handleAddGame}
          onClose={() => setAddOpen(false)}
        />
      )}
      {shareOpen && <ShareModal inviteCode={list.inviteCode} onClose={() => setShareOpen(false)} />}
      {ratingGameId != null && gamesById[ratingGameId] && user && (
        <GameRatingModal
          listId={list.id}
          game={gamesById[ratingGameId]}
          currentUsername={user.username}
          initialSummary={ratingsByGame[ratingGameId]}
          onClose={(updatedSummary) => {
            if (updatedSummary) {
              setRatingsByGame((prev) => ({ ...prev, [ratingGameId]: updatedSummary }));
            }
            setRatingGameId(null);
          }}
        />
      )}
    </div>
  );
}

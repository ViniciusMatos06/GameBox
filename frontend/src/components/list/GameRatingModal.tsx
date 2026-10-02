import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import StarRating from '../common/StarRating';
import { UserAvatar } from '../common/States';
import type { RawgGameDetails } from '../../types/rawg';
import type { RatingsSummary } from '../../types/gamebox';
import { getRatingsSummary, rateGame } from '../../services/ratingService';
import { useToast } from '../../context/ToastContext';
import './GameRatingModal.css';

export default function GameRatingModal({
  listId,
  game,
  currentUsername,
  initialSummary,
  onClose,
}: {
  listId: string;
  game: RawgGameDetails;
  currentUsername: string;
  initialSummary?: RatingsSummary;
  onClose: (updatedSummary?: RatingsSummary) => void;
}) {
  const { showToast } = useToast();
  const [summary, setSummary] = useState<RatingsSummary | undefined>(initialSummary);
  const [loading, setLoading] = useState(!initialSummary);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialSummary) return;
    setLoading(true);
    getRatingsSummary(listId, game.id)
      .then(setSummary)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId, game.id]);

  const myRating = summary?.ratings.find((r) => r.username === currentUsername);
  const others = summary?.ratings.filter((r) => r.username !== currentUsername) ?? [];

  async function handleRate(stars: number) {
    setSubmitting(true);
    try {
      const updated = await rateGame({ listId, gameId: game.id, gameName: game.name, stars });
      setSummary(updated);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao avaliar jogo.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={game.name} onClose={() => onClose(summary)}>
      <div className="grm-your-rating">
        <span>{myRating ? 'Sua avaliação' : 'Você ainda não avaliou este jogo.'}</span>
        <StarRating value={myRating?.stars ?? 0} onChange={handleRate} size={24} readOnly={submitting} />
      </div>

      <h4 className="grm-heading">Avaliações dos participantes</h4>
      {loading ? (
        <p className="grm-empty">Carregando avaliações...</p>
      ) : (
        <div className="grm-list">
          {myRating && (
            <div className="grm-row">
              <UserAvatar
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(currentUsername)}`}
                alt={currentUsername}
                size={30}
              />
              <span className="grm-username">@{currentUsername} (você)</span>
              <StarRating value={myRating.stars} readOnly size={15} />
            </div>
          )}
          {others.length === 0 && !myRating ? (
            <p className="grm-empty">Ninguém avaliou este jogo ainda.</p>
          ) : (
            others.map((r) => (
              <div className="grm-row" key={r.username}>
                <UserAvatar
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(r.username)}`}
                  alt={r.username}
                  size={30}
                />
                <span className="grm-username">@{r.username}</span>
                <StarRating value={r.stars} readOnly size={15} />
              </div>
            ))
          )}
        </div>
      )}

      {summary?.average != null && (
        <div className="grm-average">
          Média: <strong>{summary.average.toFixed(1)} ★</strong>
        </div>
      )}
    </Modal>
  );
}

import { useState } from 'react';
import Modal from '../common/Modal';
import StarRating from '../common/StarRating';
import { UserAvatar } from '../common/States';
import type { GameList } from '../../types/gamebox';
import type { RawgGameDetails } from '../../types/rawg';
import { getRatingsForGameInList, getUserRating, rateGame, averageForGameInList } from '../../services/ratingService';
import './GameRatingModal.css';

export default function GameRatingModal({
  list,
  game,
  currentUsername,
  onClose,
}: {
  list: GameList;
  game: RawgGameDetails;
  currentUsername: string;
  onClose: () => void;
}) {
  const [, forceTick] = useState(0);
  const ratings = getRatingsForGameInList(list.id, game.id);
  const myRating = getUserRating(list.id, game.id, currentUsername);
  const avg = averageForGameInList(list.id, game.id);

  function handleRate(stars: number) {
    rateGame({ listId: list.id, gameId: game.id, gameName: game.name, username: currentUsername, stars });
    forceTick((t) => t + 1);
  }

  const others = ratings.filter((r) => r.username !== currentUsername);

  return (
    <Modal title={game.name} onClose={onClose}>
      <div className="grm-your-rating">
        <span>{myRating ? 'Sua avaliação' : 'Você ainda não avaliou este jogo.'}</span>
        <StarRating value={myRating?.stars ?? 0} onChange={handleRate} size={24} />
      </div>

      <h4 className="grm-heading">Avaliações dos participantes</h4>
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
            <div className="grm-row" key={r.id}>
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

      {avg != null && (
        <div className="grm-average">
          Média: <strong>{avg.toFixed(1)} ★</strong>
        </div>
      )}
    </Modal>
  );
}

import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { RawgGame } from '../../types/rawg';
import { Badge } from '../common/States';
import './GameCard.css';

interface GameCardProps {
  game: RawgGame;
  gameboxRating?: number | null; // GameBox average, when shown inside a list context
  userStars?: number; // this viewer's own rating, when relevant
}

export default function GameCard({ game, gameboxRating, userStars }: GameCardProps) {
  const year = game.released ? new Date(game.released).getFullYear() : '—';
  const genre = game.genres?.[0]?.name;

  return (
    <Link to={`/games/${game.id}`} className="game-card">
      <div className="game-card-cover">
        {game.background_image ? (
          <img src={game.background_image} alt={game.name} loading="lazy" />
        ) : (
          <div className="game-card-placeholder">Sem capa</div>
        )}
        <div className="game-card-rawg-rating">
          <Star size={12} fill="currentColor" /> {game.rating.toFixed(1)}
        </div>
      </div>
      <div className="game-card-body">
        <h4 className="game-card-title" title={game.name}>
          {game.name}
        </h4>
        <div className="game-card-meta">
          <span>{year}</span>
          {genre && <Badge>{genre}</Badge>}
        </div>
        {(gameboxRating != null || userStars != null) && (
          <div className="game-card-gamebox">
            {userStars != null ? (
              <span className="game-card-stars">
                {'★'.repeat(userStars)}
                {'☆'.repeat(5 - userStars)}
              </span>
            ) : gameboxRating != null ? (
              <span className="game-card-stars">GameBox {gameboxRating.toFixed(1)} ★</span>
            ) : null}
          </div>
        )}
      </div>
    </Link>
  );
}

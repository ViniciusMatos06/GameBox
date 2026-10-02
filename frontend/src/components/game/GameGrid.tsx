import type { RawgGame } from '../../types/rawg';
import GameCard from './GameCard';
import { GameCardSkeleton } from '../common/States';
import './GameGrid.css';

export default function GameGrid({
  games,
  loading,
  skeletonCount = 10,
}: {
  games: RawgGame[];
  loading?: boolean;
  skeletonCount?: number;
}) {
  if (loading) {
    return (
      <div className="game-grid">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="game-grid">
      {games.map((g) => (
        <GameCard key={g.id} game={g} />
      ))}
    </div>
  );
}

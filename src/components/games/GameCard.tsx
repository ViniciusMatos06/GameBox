import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Monitor, Gamepad, Calendar } from 'lucide-react';
import { RawgGame } from '../../types/rawg';
import { getGameBoxRatingSummary } from '../../services/gameBoxService';

interface GameCardProps {
  game: RawgGame;
  onAddToList?: (game: RawgGame) => void;
  userGameBoxRating?: number; // Se o usuário logado avaliou
}

export const GameCard: React.FC<GameCardProps> = ({ game, onAddToList, userGameBoxRating }) => {
  const gameBoxSummary = getGameBoxRatingSummary(game.id);
  const releaseYear = game.released ? game.released.substring(0, 4) : 'TBA';

  // Helper para cor do Metacritic
  const getMetacriticColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (score >= 50) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  };

  const coverUrl =
    game.background_image ||
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="group relative flex flex-col bg-[#121622] rounded-2xl overflow-hidden border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50">
      {/* Imagem de Capa com Badges Flutuantes */}
      <Link to={`/games/${game.id}`} className="relative aspect-[16/10] overflow-hidden block bg-slate-900">
        <img
          src={coverUrl}
          alt={game.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-transparent to-black/30 opacity-80 group-hover:opacity-60 transition" />

        {/* Badges superiores: Metacritic e Plataformas */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {game.metacritic ? (
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-extrabold border font-mono ${getMetacriticColor(
                game.metacritic
              )}`}
              title={`Metacritic: ${game.metacritic}/100`}
            >
              {game.metacritic}
            </span>
          ) : (
            <span />
          )}

          {/* Miniatura de plataformas principais */}
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-slate-300">
            {game.platforms?.some((p) => p.platform?.slug?.includes('pc')) && (
              <Monitor className="w-3 h-3 text-slate-300" title="PC" />
            )}
            {game.platforms?.some((p) =>
              p.platform?.slug?.includes('playstation') || p.platform?.slug?.includes('xbox') || p.platform?.slug?.includes('nintendo')
            ) && <Gamepad className="w-3 h-3 text-slate-300" title="Console" />}
          </div>
        </div>
      </Link>

      {/* Conteúdo do Card */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Gêneros & Ano */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              {releaseYear}
            </span>
            <span className="truncate text-slate-400 text-[11px]">
              {game.genres?.slice(0, 2).map((g) => g.name).join(' • ') || 'Geral'}
            </span>
          </div>

          {/* Nome do Jogo */}
          <Link to={`/games/${game.id}`}>
            <h3
              className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1"
              title={game.name}
            >
              {game.name}
            </h3>
          </Link>
        </div>

        {/* NOTAS DIFERENCIADAS: RAWG vs GAMEBOX */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {/* Nota Oficial da RAWG */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">RAWG</span>
            <div className="flex items-center gap-1 text-slate-300 font-medium">
              <Star className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
              <span>{game.rating > 0 ? game.rating.toFixed(1) : '-'}/5</span>
            </div>
          </div>

          {/* Nota da Comunidade GameBox */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-500">GameBox</span>
            <div className="flex items-center gap-1 text-amber-300 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>
                {userGameBoxRating !== undefined
                  ? `${userGameBoxRating.toFixed(1)} ★`
                  : gameBoxSummary.count > 0
                  ? `${gameBoxSummary.average.toFixed(1)} ★`
                  : 'Sem nota'}
              </span>
              {gameBoxSummary.count > 0 && userGameBoxRating === undefined && (
                <span className="text-[10px] text-slate-400 font-normal">({gameBoxSummary.count})</span>
              )}
            </div>
          </div>
        </div>

        {/* Botão rápido opcional de adicionar à lista */}
        {onAddToList && (
          <button
            onClick={() => onAddToList(game)}
            className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 transition text-center"
          >
            + Adicionar à lista
          </button>
        )}
      </div>
    </div>
  );
};

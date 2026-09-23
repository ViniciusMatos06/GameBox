import React, { useState } from 'react';
import { X, Star, Check } from 'lucide-react';
import { StarRating } from '../common/StarRating';
import { useAuth } from '../../context/AuthContext';
import { addOrUpdateReview, getUserReviewForGame } from '../../services/gameBoxService';
import { RawgGame } from '../../types/rawg';

interface ReviewModalProps {
  game: RawgGame;
  isOpen: boolean;
  onClose: () => void;
  onReviewSaved?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  game,
  isOpen,
  onClose,
  onReviewSaved,
}) => {
  const { user } = useAuth();
  const existingReview = user ? getUserReviewForGame(game.id, user.id) : undefined;

  const [rating, setRating] = useState<number>(existingReview ? existingReview.rating : 5);
  const [comment, setComment] = useState<string>(existingReview?.comment || '');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    addOrUpdateReview({
      rawgGameId: game.id,
      gameTitle: game.name,
      gameCover: game.background_image,
      gameYear: game.released ? game.released.substring(0, 4) : 'TBA',
      user,
      rating,
      comment: comment.trim() || undefined,
    });

    setIsSuccess(true);
    if (onReviewSaved) onReviewSaved();

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-slate-700/70 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161b28]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <h2 className="text-base font-bold text-white">Avaliar no GameBox</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <img
              src={
                game.background_image ||
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80'
              }
              alt={game.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{game.name}</h4>
              <p className="text-xs text-slate-400">{game.released ? game.released.substring(0, 4) : 'TBA'}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sua Nota (1 a 5 estrelas):
            </label>
            <StarRating value={rating} onChange={setRating} size="xl" showLabel />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Sua Resenha / Comentário (opcional):
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="O que você achou da jogabilidade, gráficos ou história?"
              className="w-full px-3.5 py-2.5 bg-[#0b0e15] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none"
            />
          </div>

          {isSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              Avaliação salva com sucesso no GameBox!
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={rating === 0 || isSuccess}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {existingReview ? 'Atualizar Avaliação' : 'Publicar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

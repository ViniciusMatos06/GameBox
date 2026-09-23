import React, { useState } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';
import { StarRating } from '../common/StarRating';
import { useAuth } from '../../context/AuthContext';
import { addOrUpdateReview, getReviewsForGame } from '../../services/gameBoxService';
import { ListGame } from '../../types/gamebox';

interface GroupReviewsModalProps {
  game: ListGame;
  isOpen: boolean;
  onClose: () => void;
  onReviewUpdated?: () => void;
}

export const GroupReviewsModal: React.FC<GroupReviewsModalProps> = ({
  game,
  isOpen,
  onClose,
  onReviewUpdated,
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(() => getReviewsForGame(game.rawgId));
  const [userRating, setUserRating] = useState<number>(() => {
    const existing = reviews.find((r) => r.userId === user?.id);
    return existing ? existing.rating : 0;
  });
  const [userComment, setUserComment] = useState<string>(() => {
    const existing = reviews.find((r) => r.userId === user?.id);
    return existing?.comment || '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const userReview = reviews.find((r) => r.userId === user?.id);

  // Média GameBox dos participantes
  const averageRating =
    reviews.length > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
      : 0;

  const handleSaveReview = (ratingToSave: number) => {
    if (!user) return;
    setIsSubmitting(true);

    addOrUpdateReview({
      rawgGameId: game.rawgId,
      gameTitle: game.title,
      gameCover: game.coverUrl,
      gameYear: game.releaseYear,
      user,
      rating: ratingToSave,
      comment: userComment.trim() || undefined,
    });

    const updated = getReviewsForGame(game.rawgId);
    setReviews(updated);
    setUserRating(ratingToSave);
    setIsSubmitting(false);
    setSavedSuccess(true);
    if (onReviewUpdated) onReviewUpdated();

    setTimeout(() => {
      setSavedSuccess(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-slate-700/70 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header com miniatura do jogo */}
        <div className="relative p-6 border-b border-slate-800 bg-[#161b28] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={game.coverUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80'}
              alt={game.title}
              className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
            />
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{game.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {game.releaseYear} • Adicionado por <span className="text-emerald-400">@{game.addedByUsername}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo da Média GameBox */}
        <div className="px-6 py-4 bg-[#141924] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-300">Média GameBox:</span>
            <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-base">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>{averageRating > 0 ? `${averageRating} ★` : 'Sem notas'}</span>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'} no total
          </span>
        </div>

        {/* Corpo com Avaliações dos Participantes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Avaliações dos Participantes
            </h4>

            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl bg-[#161a26] border border-slate-800/80 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                          alt={rev.username}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-sm font-semibold text-white">@{rev.username}</span>
                        {rev.userId === user?.id && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                            Você
                          </span>
                        )}
                      </div>
                      <StarRating value={rev.rating} readonly size="sm" />
                    </div>

                    {rev.comment && (
                      <p className="text-xs text-slate-300 pl-9 italic leading-relaxed">
                        "{rev.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                Nenhum participante avaliou este jogo ainda.
              </div>
            )}
          </div>

          {/* Área de Avaliação do Usuário Atual */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Sua Avaliação
            </h4>

            {user ? (
              <div className="p-4 rounded-xl bg-[#0e121a] border border-slate-800 space-y-3">
                {!userReview && (
                  <p className="text-xs text-amber-300 font-medium">
                    Você ainda não avaliou este jogo. Escolha sua nota:
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <StarRating
                    value={userRating}
                    onChange={(r) => {
                      setUserRating(r);
                      handleSaveReview(r);
                    }}
                    size="lg"
                    showLabel
                  />
                  {savedSuccess && (
                    <span className="text-xs text-emerald-400 font-medium animate-in fade-in">
                      ✓ Avaliação salva!
                    </span>
                  )}
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Comentário breve (opcional):
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="O que achou do jogo?"
                      className="flex-1 px-3 py-2 bg-[#161a26] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      disabled={isSubmitting || userRating === 0}
                      onClick={() => handleSaveReview(userRating)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl disabled:opacity-50 transition"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Faça login para registrar sua avaliação neste jogo.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

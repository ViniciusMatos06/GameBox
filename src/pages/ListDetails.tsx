import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Users,
  User as UserIcon,
  Calendar,
  Share2,
  Plus,
  Trash2,
  Star,
  ArrowLeft,
  Eye,
  MessageSquare,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getListById,
  removeGameFromList,
  getGameBoxRatingSummary,
  getUserReviewForGame,
  deleteList,
} from '../services/gameBoxService';
import { GameList, ListGame } from '../types/gamebox';
import { StarRating } from '../components/common/StarRating';
import { AddGameModal } from '../components/lists/AddGameModal';
import { ShareListModal } from '../components/lists/ShareListModal';
import { GroupReviewsModal } from '../components/lists/GroupReviewsModal';
import { ReviewModal } from '../components/reviews/ReviewModal';
import { RawgGame } from '../types/rawg';

export const ListDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [list, setList] = useState<GameList | null>(null);
  const [selectedGroupGame, setSelectedGroupGame] = useState<ListGame | null>(null);
  const [selectedGameForPersonalReview, setSelectedGameForPersonalReview] = useState<RawgGame | null>(null);

  // Modais
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const refreshList = () => {
    if (id) {
      const found = getListById(id);
      setList(found ? { ...found } : null);
    }
  };

  useEffect(() => {
    refreshList();
  }, [id]);

  if (!list) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-[#121622] rounded-2xl border border-slate-800">
          <Bookmark className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <h2 className="text-xl font-bold text-white mb-2">Lista não encontrada</h2>
          <p className="text-xs text-slate-400 mb-6">A lista que você procura pode ter sido excluída ou não existe.</p>
          <Link
            to="/lists"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Minhas Listas
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === list.ownerId;
  const isMember = list.type === 'group' && list.members.some((m) => m.userId === user?.id);
  const canAddGames = isOwner || isMember;

  const handleRemoveGame = (rawgId: number) => {
    if (!user) return;
    if (confirm('Deseja realmente remover este jogo da lista?')) {
      const result = removeGameFromList(list.id, rawgId, user);
      if (result.success) {
        refreshList();
        setFeedbackMessage('Jogo removido da lista.');
        setTimeout(() => setFeedbackMessage(null), 2500);
      } else {
        alert(result.message);
      }
    }
  };

  const handleDeleteList = () => {
    if (!user || !isOwner) return;
    if (confirm('Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita.')) {
      deleteList(list.id, user.id);
      navigate('/lists');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Breadcrumb & Ações Rápidas */}
      <div className="flex items-center justify-between">
        <Link
          to="/lists"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar para Listas
        </Link>

        {isOwner && (
          <button
            onClick={handleDeleteList}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 p-1 hover:bg-rose-500/10 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Excluir Lista
          </button>
        )}
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl text-center animate-in fade-in">
          {feedbackMessage}
        </div>
      )}

      {/* Header da Lista (Requisitos 12, 13, 14) */}
      <div className="p-6 md:p-8 bg-[#121622] rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  list.type === 'group'
                    ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {list.type === 'group' ? 'Lista de Grupo' : 'Lista Pessoal'}
              </span>

              <span className="text-xs text-slate-400 font-medium">
                {list.games.length} {list.games.length === 1 ? 'jogo' : 'jogos'}
              </span>

              {list.type === 'group' && (
                <span className="text-xs text-cyan-300 font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {list.members.length} participantes
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {list.name}
            </h1>

            {list.description && (
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">{list.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <span>Criada por</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  {list.ownerAvatar && (
                    <img src={list.ownerAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                  )}
                  @{list.ownerUsername}
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(list.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {list.type === 'group' && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-semibold text-xs rounded-xl transition flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar / Convidar
              </button>
            )}

            {canAddGames ? (
              <button
                onClick={() => setIsAddGameOpen(true)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                + Adicionar Jogo
              </button>
            ) : (
              <p className="text-xs text-slate-500 italic">
                {list.type === 'personal'
                  ? 'Apenas o proprietário pode adicionar jogos.'
                  : 'Entre no grupo para adicionar jogos.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SEÇÃO DE PARTICIPANTES PARA LISTAS DE GRUPO (REQUISITO 16) */}
      {list.type === 'group' && (
        <section className="bg-[#121622] rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Participantes do Grupo ({list.members.length})</h2>
            </div>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="text-xs text-cyan-400 hover:underline font-semibold flex items-center gap-1"
            >
              + Convidar amigos
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {list.members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#161a26] border border-slate-800/80"
              >
                <img
                  src={
                    member.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'
                  }
                  alt={member.username}
                  className="w-10 h-10 rounded-full object-cover border border-cyan-500/30 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-white truncate">@{member.username}</p>
                    {member.userId === list.ownerId && (
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded font-mono">
                        Dono
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    <strong className="text-emerald-400">{member.addedGamesCount}</strong> jogos adicionados
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* GRADE DE JOGOS: LISTA PESSOAL VS LISTA DE GRUPO (REQUISITOS 13 & 14) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Jogos na Lista ({list.games.length})
          </h2>
          {canAddGames && list.games.length > 0 && (
            <button
              onClick={() => setIsAddGameOpen(true)}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              + Adicionar mais jogos
            </button>
          )}
        </div>

        {list.games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {list.games.map((game) => {
              const gameBoxSummary = getGameBoxRatingSummary(game.rawgId);
              const userReview = user ? getUserReviewForGame(game.rawgId, user.id) : undefined;
              const canRemove = isOwner || (list.type === 'group' && game.addedByUserId === user?.id);

              return (
                <div
                  key={game.rawgId}
                  className="group relative flex flex-col bg-[#121622] rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Capa Real da RAWG */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img
                      src={
                        game.coverUrl ||
                        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
                      }
                      alt={game.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-transparent to-transparent opacity-80" />

                    {/* Botão de remoção rápida */}
                    {canRemove && (
                      <button
                        onClick={() => handleRemoveGame(game.rawgId)}
                        title="Remover jogo desta lista"
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-slate-300 hover:text-white backdrop-blur-sm transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Ano e Gêneros */}
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>{game.releaseYear}</span>
                        <span className="truncate text-slate-500 text-[11px]">
                          {game.genres?.slice(0, 2).join(' • ') || 'Game'}
                        </span>
                      </div>

                      {/* Nome do Jogo */}
                      <Link to={`/games/${game.rawgId}`}>
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {game.title}
                        </h3>
                      </Link>

                      {/* No caso de Grupo: Quem adicionou */}
                      {list.type === 'group' && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          Adicionado por <strong className="text-cyan-400">@{game.addedByUsername}</strong>
                        </p>
                      )}
                    </div>

                    {/* SEÇÃO DE AVALIAÇÃO CONFORME O TIPO DE LISTA */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      {list.type === 'personal' ? (
                        /* REQUISITO 13: LISTA PESSOAL (Avaliação GameBox do usuário) */
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400">Sua avaliação:</span>
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{userReview ? `${userReview.rating} ★` : 'Não avaliado'}</span>
                          </div>
                        </div>
                      ) : (
                        /* REQUISITO 14: LISTA DE GRUPO (Média GameBox + quantidade de avaliações) */
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Média GameBox</span>
                            <div className="flex items-center gap-1 text-amber-300 font-extrabold text-sm">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span>{gameBoxSummary.count > 0 ? gameBoxSummary.average : '-'}</span>
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {gameBoxSummary.count} {gameBoxSummary.count === 1 ? 'avaliação' : 'avaliações'}
                          </span>
                        </div>
                      )}

                      {/* Botões de Ação do Card */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                        <Link
                          to={`/games/${game.rawgId}`}
                          className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Ver jogo
                        </Link>

                        {list.type === 'group' ? (
                          /* REQUISITO 15: Abre modal de avaliações do grupo */
                          <button
                            onClick={() => setSelectedGroupGame(game)}
                            className="py-1.5 px-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" /> Avaliações
                          </button>
                        ) : (
                          /* Avaliar em lista pessoal */
                          <button
                            onClick={() => {
                              setSelectedGameForPersonalReview({
                                id: game.rawgId,
                                name: game.title,
                                slug: '',
                                background_image: game.coverUrl,
                                released: game.releaseYear,
                                rating: 0,
                                rating_top: 5,
                                ratings_count: 0,
                                genres: [],
                                platforms: [],
                              });
                            }}
                            className="py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1"
                          >
                            <Star className="w-3 h-3 fill-emerald-300" /> Avaliar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-[#121622] rounded-3xl border border-dashed border-slate-800">
            <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white mb-1">Esta lista ainda está vazia</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              Adicione jogos da biblioteca oficial da RAWG para começar a preencher sua coleção.
            </p>
            {canAddGames && (
              <button
                onClick={() => setIsAddGameOpen(true)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
              >
                + Adicionar Primeiro Jogo
              </button>
            )}
          </div>
        )}
      </section>

      {/* Modal para Adicionar Jogo à Lista */}
      <AddGameModal
        isOpen={isAddGameOpen}
        onClose={() => setIsAddGameOpen(false)}
        targetListId={list.id}
        onGameAdded={() => refreshList()}
      />

      {/* Modal de Compartilhamento / Convite */}
      <ShareListModal
        list={list}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Modal de Avaliações do Grupo */}
      {selectedGroupGame && (
        <GroupReviewsModal
          game={selectedGroupGame}
          isOpen={Boolean(selectedGroupGame)}
          onClose={() => setSelectedGroupGame(null)}
          onReviewUpdated={() => refreshList()}
        />
      )}

      {/* Modal de Avaliação Pessoal */}
      {selectedGameForPersonalReview && (
        <ReviewModal
          game={selectedGameForPersonalReview}
          isOpen={Boolean(selectedGameForPersonalReview)}
          onClose={() => setSelectedGameForPersonalReview(null)}
          onReviewSaved={() => refreshList()}
        />
      )}
    </div>
  );
};

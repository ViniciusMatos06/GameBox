import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User as UserIcon,
  Calendar,
  Bookmark,
  Star,
  Plus,
  Edit,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  findUserByUsername,
  getUserStats,
  getUserLists,
  getUserActivities,
} from '../services/gameBoxService';
import { User, GameList, UserActivity, GameReview } from '../types/gamebox';
import { StarRating } from '../components/common/StarRating';

export const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userLists, setUserLists] = useState<GameList[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState({
    ratedGamesCount: 0,
    createdListsCount: 0,
    addedGamesCount: 0,
    averageRating: 0,
    recentReviews: [] as GameReview[],
  });

  const [activeTab, setActiveTab] = useState<'reviews' | 'lists' | 'activity'>('reviews');

  useEffect(() => {
    if (username) {
      const found = findUserByUsername(username);
      if (found) {
        setProfileUser(found);
        setStats(getUserStats(found.id));
        setUserLists(getUserLists(found.id));
        setActivities(getUserActivities(found.id));
      }
    }
  }, [username, currentUser]);

  if (!profileUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="p-8 bg-[#121622] rounded-3xl border border-slate-800">
          <UserIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Perfil não encontrado</h2>
          <p className="text-xs text-slate-400 mb-6">O usuário @{username} não existe.</p>
          <Link
            to="/"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Cabeçalho do Perfil (Avatar, Nome, Bio, Ações) */}
      <div className="p-6 sm:p-8 bg-[#121622] rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={profileUser.avatar}
            alt={profileUser.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-emerald-500/40 shadow-xl"
          />

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{profileUser.name}</h1>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                @{profileUser.username}
              </span>
            </div>

            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              {profileUser.bio || 'Membro do GameBox explorando universos de jogos.'}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 pt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Entrou em {new Date(profileUser.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/profile/edit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 border border-slate-700/80"
            >
              <Edit className="w-3.5 h-3.5 text-emerald-400" /> Editar Perfil
            </Link>
          </div>
        )}
      </div>

      {/* Estatísticas do Perfil (Requisito 24) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#121622] rounded-2xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Jogos Avaliados</span>
          <div className="text-2xl font-black text-white mt-1 flex items-center gap-1.5">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>{stats.ratedGamesCount}</span>
          </div>
        </div>

        <div className="p-4 bg-[#121622] rounded-2xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Listas Criadas</span>
          <div className="text-2xl font-black text-white mt-1 flex items-center gap-1.5">
            <Bookmark className="w-5 h-5 text-emerald-400" />
            <span>{stats.createdListsCount}</span>
          </div>
        </div>

        <div className="p-4 bg-[#121622] rounded-2xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Jogos Adicionados</span>
          <div className="text-2xl font-black text-white mt-1 flex items-center gap-1.5">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>{stats.addedGamesCount}</span>
          </div>
        </div>

        <div className="p-4 bg-[#121622] rounded-2xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Média das Avaliações</span>
          <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1 font-mono">
            <span>{stats.averageRating > 0 ? `${stats.averageRating} ★` : '-'}</span>
          </div>
        </div>
      </div>

      {/* Tabs de Conteúdo: Avaliações Recentes, Listas, Atividade */}
      <div>
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            Jogos Avaliados ({stats.recentReviews.length})
          </button>

          <button
            onClick={() => setActiveTab('lists')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'lists'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Listas ({userLists.length})
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'activity'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Atividades ({activities.length})
          </button>
        </div>

        {/* Tab 1: Avaliações Recentes */}
        {activeTab === 'reviews' && (
          <div className="pt-6">
            {stats.recentReviews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {stats.recentReviews.map((rev) => (
                  <Link
                    key={rev.id}
                    to={`/games/${rev.rawgGameId}`}
                    className="group bg-[#121622] rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="aspect-[16/10] bg-slate-900 overflow-hidden relative">
                      <img
                        src={
                          rev.gameCover ||
                          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
                        }
                        alt={rev.gameTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 text-xs font-bold text-amber-300 border border-slate-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {rev.rating} ★
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition truncate">
                          {rev.gameTitle}
                        </h4>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Avaliado em {new Date(rev.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {rev.comment && (
                        <p className="text-xs text-slate-400 italic line-clamp-2 mt-2 pt-2 border-t border-slate-800/80">
                          "{rev.comment}"
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Nenhum jogo avaliado ainda por este usuário.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Listas do Usuário */}
        {activeTab === 'lists' && (
          <div className="pt-6">
            {userLists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userLists.map((list) => (
                  <Link
                    key={list.id}
                    to={`/lists/${list.id}`}
                    className="p-5 bg-[#121622] rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            list.type === 'group'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {list.type === 'group' ? 'Lista de Grupo' : 'Lista Pessoal'}
                        </span>
                        <span className="text-xs text-slate-400">{list.games.length} jogos</span>
                      </div>
                      <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                        {list.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {list.description || 'Sem descrição.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex -space-x-2">
                      {list.games.slice(0, 4).map((g, idx) => (
                        <img
                          key={idx}
                          src={
                            g.coverUrl ||
                            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=80&auto=format&fit=crop&q=80'
                          }
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover border border-[#121622]"
                        />
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Nenhuma lista criada por este usuário ainda.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Feed de Atividades Recentes (Requisito 24) */}
        {activeTab === 'activity' && (
          <div className="pt-6 max-w-2xl">
            {activities.length > 0 ? (
              <div className="p-4 bg-[#121622] rounded-2xl border border-slate-800 space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs pb-3 border-b border-slate-800/80 last:border-0 last:pb-0">
                    <img
                      src={profileUser.avatar}
                      alt={profileUser.username}
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1 leading-relaxed">
                      <span className="font-bold text-white">@{profileUser.username}</span>{' '}
                      {act.type === 'rated' && (
                        <span>
                          avaliou <strong className="text-emerald-300">{act.gameTitle}</strong> com{' '}
                          <span className="text-amber-400 font-semibold">{act.rating} ★</span>
                        </span>
                      )}
                      {act.type === 'added_to_list' && (
                        <span>
                          adicionou <strong className="text-cyan-300">{act.gameTitle}</strong> à lista{' '}
                          <strong className="text-slate-200">{act.listName}</strong>
                        </span>
                      )}
                      {act.type === 'created_list' && (
                        <span>
                          criou uma nova lista: <strong className="text-emerald-300">{act.listName}</strong>
                        </span>
                      )}
                      {act.type === 'joined_group' && (
                        <span>
                          entrou para o grupo <strong className="text-cyan-300">{act.listName}</strong>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {new Date(act.timestamp).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(act.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Nenhuma atividade recente registrada.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

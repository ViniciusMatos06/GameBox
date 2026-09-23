import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Bookmark,
  Users,
  Star,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Calendar,
  Layers,
  CheckCircle2,
  KeyRound,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApiKey } from '../context/ApiKeyContext';
import { getPopularGames, getUpcomingGames } from '../services/rawgApi';
import { RawgGame } from '../types/rawg';
import { GameCard } from '../components/games/GameCard';
import { getUserLists, getActivities } from '../services/gameBoxService';
import { GameList, UserActivity } from '../types/gamebox';
import { AddGameModal } from '../components/lists/AddGameModal';

export const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { hasKey, openKeyModal } = useApiKey();

  // Estados para dados da RAWG
  const [popularGames, setPopularGames] = useState<RawgGame[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<RawgGame[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [rawgError, setRawgError] = useState<string | null>(null);

  // Estados locais para usuário autenticado
  const [userLists, setUserLists] = useState<GameList[]>([]);
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [selectedGameForAdd, setSelectedGameForAdd] = useState<RawgGame | null>(null);

  // Buscar dados da RAWG
  useEffect(() => {
    if (!hasKey) return;

    let isCancelled = false;
    setIsLoadingGames(true);
    setRawgError(null);

    Promise.all([getPopularGames(1, 8), getUpcomingGames(1, 4)])
      .then(([popRes, upRes]) => {
        if (!isCancelled) {
          setPopularGames(popRes.results || []);
          setUpcomingGames(upRes.results || []);
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar jogos na Home:', err);
        if (!isCancelled) {
          setRawgError(err.message || 'Falha ao conectar com a RAWG API.');
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingGames(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [hasKey]);

  // Carregar listas e atividades do GameBox
  useEffect(() => {
    if (user) {
      setUserLists(getUserLists(user.id));
    }
    setRecentActivities(getActivities(6));
  }, [user]);

  // =========================================================================
  // SE ESTIVER AUTENTICADO: DASHBOARD MODERNO (REQUISITO 27)
  // =========================================================================
  if (isAuthenticated && user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Boas-vindas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Olá, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Descubra novos jogos, organize suas listas e veja o que seus amigos estão jogando.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/lists/create"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              Criar Lista
            </Link>
            <Link
              to="/explore"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              Explorar Catálogo
            </Link>
          </div>
        </div>

        {/* Suas Listas */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Suas Listas</h2>
            </div>
            <Link to="/lists" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
              Ver todas ({userLists.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {userLists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {userLists.slice(0, 3).map((list) => (
                <Link
                  key={list.id}
                  to={`/lists/${list.id}`}
                  className="group p-5 bg-[#121622] rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          list.type === 'group'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {list.type === 'group' ? 'Lista de Grupo' : 'Lista Pessoal'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{list.games.length} jogos</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                      {list.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{list.description}</p>
                  </div>

                  {/* Miniaturas das capas */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex -space-x-2 overflow-hidden">
                      {list.games.slice(0, 4).map((g, idx) => (
                        <img
                          key={idx}
                          src={
                            g.coverUrl ||
                            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80'
                          }
                          alt={g.title}
                          className="w-8 h-8 rounded-lg object-cover border border-[#121622]"
                        />
                      ))}
                    </div>
                    {list.type === 'group' && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-cyan-400" /> {list.members.length} membros
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#121622] rounded-2xl border border-dashed border-slate-800">
              <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">Você ainda não tem listas</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Crie sua primeira lista para organizar ou jogar com amigos.</p>
              <Link
                to="/lists/create"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                + Criar Lista Agora
              </Link>
            </div>
          )}
        </section>

        {/* Grade de Jogos Populares Reais da RAWG */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Jogos Populares no Momento</h2>
              <span className="text-xs text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded font-mono">RAWG Real API</span>
            </div>
            <Link to="/explore" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
              Ver mais na RAWG <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!hasKey ? (
            <div className="p-8 text-center bg-[#121622] rounded-2xl border border-amber-500/30">
              <KeyRound className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">Chave da RAWG API necessária</p>
              <p className="text-xs text-slate-400 mt-1 mb-4 max-w-md mx-auto">
                Para carregar a lista de jogos reais direto dos servidores da RAWG, configure sua API Key gratuita.
              </p>
              <button
                onClick={openKeyModal}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Configurar Chave
              </button>
            </div>
          ) : isLoadingGames ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[16/14] bg-[#121622] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : rawgError ? (
            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-sm">
              {rawgError}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {popularGames.map((game) => (
                <GameCard key={game.id} game={game} onAddToList={(g) => setSelectedGameForAdd(g)} />
              ))}
            </div>
          )}
        </section>

        {/* Seção dupla: Próximos Lançamentos e Atividade Recente */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Próximos Lançamentos (RAWG) */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">Próximos Lançamentos</h2>
              </div>
              <Link
                to="/explore?ordering=released"
                className="text-xs font-semibold text-cyan-400 hover:underline"
              >
                Ver todos
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingGames.map((game) => (
                <Link
                  key={game.id}
                  to={`/games/${game.id}`}
                  className="flex items-center gap-3 p-3 bg-[#121622] rounded-xl border border-slate-800 hover:border-slate-700 transition group"
                >
                  <img
                    src={
                      game.background_image ||
                      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80'
                    }
                    alt={game.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition">
                      {game.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Lançamento: {game.released || 'Em breve'}
                    </p>
                    <span className="text-[11px] text-slate-500 truncate block mt-0.5">
                      {game.genres?.slice(0, 2).map((g) => g.name).join(', ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Atividade Recente do GameBox */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Atividade Recente</h2>
              </div>
            </div>

            <div className="p-4 bg-[#121622] rounded-2xl border border-slate-800 space-y-3.5">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <img
                    src={act.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                    alt={act.username}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0 leading-relaxed">
                    <span className="font-bold text-white">@{act.username}</span>{' '}
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
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Modal de adição rápida caso acionado nos cards */}
        <AddGameModal
          isOpen={Boolean(selectedGameForAdd)}
          onClose={() => setSelectedGameForAdd(null)}
          preselectedGame={selectedGameForAdd}
        />
      </div>
    );
  }

  // =========================================================================
  // SE NÃO ESTIVER AUTENTICADO: LANDING PAGE MODERNA (REQUISITO 21)
  // =========================================================================
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Glow de fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-emerald-400 mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            O Letterboxd dos Videogames
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Descubra, organize e <br />
            <span className="text-gradient">avalie seus jogos.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Crie suas próprias listas ou reúna seus amigos para construir uma coleção de jogos juntos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-base font-bold rounded-2xl transition shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              Criar conta gratuita
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-white text-base font-semibold rounded-2xl transition border border-slate-700/80 flex items-center justify-center gap-2"
            >
              Entrar
            </Link>
            <Link
              to="/explore"
              className="w-full sm:w-auto px-6 py-3.5 text-slate-400 hover:text-white text-sm font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Compass className="w-4 h-4" /> Explorar catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Pilares do GameBox: Descubra, Organize, Compartilhe, Avalie */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Descubra */}
          <div className="p-6 bg-[#121622] rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Descubra</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pesquise milhões de possibilidades através do catálogo oficial e atualizado de jogos da RAWG API.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-semibold">
              Catálogo oficial RAWG →
            </div>
          </div>

          {/* Organize */}
          <div className="p-6 bg-[#121622] rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Organize</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Crie listas pessoais personalizadas, organize seus favoritos e monte seu backlog do ano.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-cyan-400 font-semibold">
              Listas Pessoais exclusivas →
            </div>
          </div>

          {/* Compartilhe */}
          <div className="p-6 bg-[#121622] rounded-2xl border border-slate-800 hover:border-purple-500/40 transition flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Compartilhe</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Crie listas de grupo colaborativas e convide amigos para adicionar jogos e trocar opiniões.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-purple-400 font-semibold">
              Listas de Grupo com convites →
            </div>
          </div>

          {/* Avalie */}
          <div className="p-6 bg-[#121622] rounded-2xl border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Avalie</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dê sua própria nota de 1 a 5 estrelas e veja a média exclusiva da comunidade GameBox calculada separadamente da RAWG.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-amber-400 font-semibold">
              Sistema StarRating interativo →
            </div>
          </div>
        </div>
      </section>

      {/* Demonstração Visual com Jogos REAIS da RAWG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Destaques do Catálogo RAWG</h2>
            <p className="text-xs text-slate-400 mt-1">Jogos reais obtidos diretamente da API oficial</p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
          >
            Explorar catálogo completo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {popularGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {popularGames.slice(0, 8).map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="p-10 text-center bg-[#121622] rounded-2xl border border-slate-800">
            <KeyRound className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Catálogo pronto para ser conectado</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Configure sua RAWG API Key no arquivo .env ou no botão superior para carregar os jogos em tempo real.
            </p>
            <button
              onClick={openKeyModal}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
            >
              Inserir Chave da RAWG
            </button>
          </div>
        )}
      </section>

      {/* CTA Final */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="p-10 bg-gradient-to-br from-[#121622] via-[#141926] to-[#0e121b] border border-slate-800 rounded-3xl relative overflow-hidden">
          <h2 className="text-3xl font-extrabold text-white mb-3">Pronto para criar sua coleção?</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Junte-se à comunidade GameBox, convide amigos e comece a registrar todas as suas experiências nos videogames.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl transition shadow-lg shadow-emerald-500/20"
          >
            Começar agora gratuitamente <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

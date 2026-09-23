import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Check, Loader2, AlertCircle, Bookmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApiKey } from '../../context/ApiKeyContext';
import { useDebounce } from '../../hooks/useDebounce';
import { searchGames } from '../../services/rawgApi';
import { RawgGame } from '../../types/rawg';
import { addGameToList, getUserLists } from '../../services/gameBoxService';
import { GameList } from '../../types/gamebox';

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetListId?: string; // Se aberto diretamente da página de uma lista
  preselectedGame?: RawgGame | null; // Se aberto da página de detalhes do jogo
  onGameAdded?: (listId: string, game: RawgGame) => void;
}

export const AddGameModal: React.FC<AddGameModalProps> = ({
  isOpen,
  onClose,
  targetListId,
  preselectedGame,
  onGameAdded,
}) => {
  const { user } = useAuth();
  const { hasKey, openKeyModal } = useApiKey();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<RawgGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLists, setUserLists] = useState<GameList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>(targetListId || '');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 350);

  useEffect(() => {
    if (user) {
      const lists = getUserLists(user.id);
      setUserLists(lists);
      if (!selectedListId && lists.length > 0) {
        setSelectedListId(targetListId || lists[0].id);
      }
    }
  }, [user, targetListId, isOpen]);

  useEffect(() => {
    if (preselectedGame) {
      setSearchResults([preselectedGame]);
      setSearchTerm(preselectedGame.name);
    }
  }, [preselectedGame]);

  // Busca real na RAWG
  useEffect(() => {
    if (preselectedGame && searchTerm === preselectedGame.name) return;

    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    if (!hasKey) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setStatusMessage(null);

    searchGames(debouncedSearch, 1, 10)
      .then((res) => {
        if (!isCancelled) {
          setSearchResults(res.results || []);
        }
      })
      .catch((err) => {
        console.error('Erro ao pesquisar jogos na RAWG:', err);
        if (!isCancelled) {
          setStatusMessage({ type: 'error', text: 'Erro ao buscar jogos na RAWG.' });
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearch, hasKey, preselectedGame]);

  if (!isOpen) return null;

  const handleAddGame = (game: RawgGame) => {
    if (!user) {
      setStatusMessage({ type: 'error', text: 'Você precisa estar logado para adicionar jogos.' });
      return;
    }

    const currentListId = targetListId || selectedListId;
    if (!currentListId) {
      setStatusMessage({ type: 'error', text: 'Selecione uma lista de destino.' });
      return;
    }

    const result = addGameToList(
      currentListId,
      {
        rawgId: game.id,
        title: game.name,
        coverUrl: game.background_image,
        releaseYear: game.released ? game.released.substring(0, 4) : 'TBA',
        genres: game.genres ? game.genres.map((g) => g.name) : [],
        platforms: game.platforms ? game.platforms.map((p) => p.platform.name) : [],
      },
      user
    );

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      if (onGameAdded) {
        onGameAdded(currentListId, game);
      }
      setTimeout(() => {
        setStatusMessage(null);
        if (targetListId) {
          onClose();
        }
      }, 1500);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-slate-700/70 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161b28]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Adicionar Jogo à Lista</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seletor de Lista caso não esteja amarrado a uma lista específica */}
        {!targetListId && (
          <div className="px-6 pt-4 pb-2 border-b border-slate-800/80 bg-[#141824]">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Escolha a lista de destino:
            </label>
            {userLists.length > 0 ? (
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="w-full px-3 py-2 bg-[#0b0e15] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {userLists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.type === 'group' ? 'Grupo' : 'Pessoal'}) — {l.games.length} jogos
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-amber-300 py-1 flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Você ainda não tem listas criadas. Crie uma lista primeiro!
              </div>
            )}
          </div>
        )}

        {/* Barra de Pesquisa RAWG */}
        <div className="p-6 pb-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar um jogo..."
              className="w-full pl-10 pr-4 py-3 bg-[#0d1017] border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {isLoading && (
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
            )}
          </div>

          {/* Mensagens de feedback */}
          {statusMessage && (
            <div
              className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              }`}
            >
              {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {statusMessage.text}
            </div>
          )}

          {!hasKey && (
            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-xs text-amber-300">
              <span>Para buscar no catálogo oficial, configure sua RAWG API Key.</span>
              <button
                onClick={openKeyModal}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg shrink-0"
              >
                Configurar
              </button>
            </div>
          )}
        </div>

        {/* Lista de Resultados Reais da RAWG */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
              Buscando na RAWG API oficial...
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#161a26] border border-slate-800/80 hover:border-slate-700 transition group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={
                      game.background_image ||
                      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80'
                    }
                    alt={game.name}
                    className="w-16 h-16 rounded-lg object-cover bg-slate-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{game.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                      <span>{game.released ? game.released.substring(0, 4) : 'TBA'}</span>
                      <span>•</span>
                      <span className="truncate">
                        {game.genres?.slice(0, 2).map((g) => g.name).join(', ') || 'Sem gênero'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="text-slate-400">
                        {game.platforms?.slice(0, 3).map((p) => p.platform.name).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddGame(game)}
                  className="shrink-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-md shadow-emerald-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </div>
            ))
          ) : searchTerm.trim() ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Nenhum jogo encontrado para "<span className="text-slate-300">{searchTerm}</span>" na RAWG.
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              Digite o nome de qualquer jogo real (Ex: Elden Ring, Minecraft, Hades...) para buscar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

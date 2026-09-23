import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Bookmark, Check, ArrowRight, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getListByInviteCode, joinGroupList } from '../services/gameBoxService';
import { GameList } from '../types/gamebox';

export const Invite: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [list, setList] = useState<GameList | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (inviteCode) {
      const found = getListByInviteCode(inviteCode);
      if (found) {
        setList(found);
      } else {
        setErrorMessage('Convite não encontrado ou expirado.');
      }
    }
  }, [inviteCode]);

  const handleJoin = () => {
    if (!user) {
      setErrorMessage('Você precisa entrar na sua conta para participar do grupo.');
      return;
    }

    if (!inviteCode) return;

    setIsJoining(true);
    const result = joinGroupList(inviteCode, user);

    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        if (result.list) {
          navigate(`/lists/${result.list.id}`);
        } else if (list) {
          navigate(`/lists/${list.id}`);
        }
      }, 1200);
    } else {
      setErrorMessage(result.message);
      setIsJoining(false);
    }
  };

  if (errorMessage && !list) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="p-8 bg-[#121622] rounded-3xl border border-rose-500/20 text-rose-300">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Convite Inválido</h2>
          <p className="text-xs text-rose-200/80 mb-6">{errorMessage}</p>
          <Link
            to="/lists"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
          >
            Ver minhas listas
          </Link>
        </div>
      </div>
    );
  }

  if (!list) return null;

  const isAlreadyMember = user && list.members.some((m) => m.userId === user.id);

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="bg-[#121622] border border-slate-700/70 rounded-3xl overflow-hidden shadow-2xl p-8 sm:p-10 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center">
          <Users className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Convite Especial</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Você foi convidado para participar de uma lista!
          </h1>
        </div>

        {/* Card Resumo da Lista (Requisito 20) */}
        <div className="p-6 rounded-2xl bg-[#161a26] border border-slate-800 text-left space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">{list.name}</h2>
            {list.description && (
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{list.description}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Criada por:</span>
              <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                {list.ownerAvatar && (
                  <img src={list.ownerAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                )}
                @{list.ownerUsername}
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-300 font-semibold">
              <span className="flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                {list.games.length} {list.games.length === 1 ? 'jogo' : 'jogos'}
              </span>
              <span className="flex items-center gap-1 text-cyan-300">
                <Users className="w-3.5 h-3.5" />
                {list.members.length} participantes
              </span>
            </div>
          </div>

          {/* Miniaturas de jogos da lista */}
          {list.games.length > 0 && (
            <div className="flex -space-x-2 pt-2 overflow-hidden">
              {list.games.slice(0, 5).map((g, idx) => (
                <img
                  key={idx}
                  src={
                    g.coverUrl ||
                    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=80&auto=format&fit=crop&q=80'
                  }
                  alt={g.title}
                  className="w-10 h-10 rounded-lg object-cover border-2 border-[#161a26]"
                />
              ))}
            </div>
          )}
        </div>

        {/* Mensagens de Sucesso ou Erro */}
        {successMessage && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" /> {successMessage} Redirecionando...
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* Ação: Entrar no Grupo ou Fazer Login */}
        <div>
          {isAuthenticated ? (
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full py-3.5 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              {isAlreadyMember ? (
                <>
                  Ver lista do grupo <ArrowRight className="w-4 h-4" />
                </>
              ) : isJoining ? (
                'Entrando...'
              ) : (
                'Entrar no grupo'
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <Link
                to={`/login?redirect=/invite/${inviteCode}`}
                className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Entrar para participar do grupo
              </Link>
              <p className="text-xs text-slate-500">
                Ainda não tem conta?{' '}
                <Link to="/register" className="text-emerald-400 hover:underline">
                  Cadastre-se grátis
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

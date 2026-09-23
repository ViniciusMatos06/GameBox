import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Palette,
  KeyRound,
  LogOut,
  User,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApiKey } from '../context/ApiKeyContext';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { apiKey, saveApiKey, clearApiKey } = useApiKey();
  const navigate = useNavigate();

  const [rawgInputKey, setRawgInputKey] = useState(apiKey);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  // Estados fictícios para preferências (demonstração visual moderna)
  const [notificationsEmail, setNotificationsEmail] = useState(true);
  const [notificationsGroup, setNotificationsGroup] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [themeDark, setThemeDark] = useState(true);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiKey(rawgInputKey.trim());
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-emerald-400" />
          Configurações
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Gerencie suas preferências de conta, privacidade, aparência e integração com a RAWG API.
        </p>
      </div>

      <div className="space-y-6">
        {/* Seção 1: CONTA (Requisito 26) */}
        <section className="bg-[#121622] rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <User className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Conta</h2>
          </div>

          {user ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-2xl object-cover" />
                <div>
                  <p className="text-sm font-bold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email} • @{user.username}</p>
                </div>
              </div>
              <Link
                to="/profile/edit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition text-center"
              >
                Editar Perfil
              </Link>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Você não está conectado.</p>
          )}
        </section>

        {/* Seção Integração: RAWG API KEY */}
        <section className="bg-[#121622] rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Chave da RAWG Video Games API</h2>
            </div>
            <a
              href="https://rawg.io/apidocs"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono"
            >
              Obter chave <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <form onSubmit={handleSaveApiKey} className="space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              A RAWG fornece o catálogo oficial em tempo real. Esta chave também pode ser definida no arquivo{' '}
              <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">.env</code> como{' '}
              <code className="text-emerald-400 font-mono">VITE_RAWG_API_KEY</code>.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={rawgInputKey}
                onChange={(e) => setRawgInputKey(e.target.value)}
                placeholder="Insira sua chave RAWG API..."
                className="flex-1 px-4 py-2.5 bg-[#0b0e15] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shrink-0"
              >
                Salvar Chave
              </button>
            </div>
            {apiKeySaved && (
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Chave atualizada com sucesso!
              </p>
            )}
          </form>
        </section>

        {/* Seção 2: PRIVACIDADE (Requisito 26) */}
        <section className="bg-[#121622] rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Privacidade</h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#161a26] border border-slate-800/80 cursor-pointer">
              <div>
                <p className="font-semibold text-white">Perfil Público</p>
                <p className="text-slate-400 mt-0.5">Permitir que outros membros vejam suas listas públicas e avaliações.</p>
              </div>
              <input
                type="checkbox"
                checked={profilePublic}
                onChange={(e) => setProfilePublic(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-slate-900 border-slate-700"
              />
            </label>
          </div>
        </section>

        {/* Seção 3: NOTIFICAÇÕES (Requisito 26) */}
        <section className="bg-[#121622] rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Bell className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Notificações</h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#161a26] border border-slate-800/80 cursor-pointer">
              <div>
                <p className="font-semibold text-white">Novos Jogos Adicionados em Grupos</p>
                <p className="text-slate-400 mt-0.5">Receber aviso quando um participante adicionar um novo jogo na lista.</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsGroup}
                onChange={(e) => setNotificationsGroup(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-slate-900 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#161a26] border border-slate-800/80 cursor-pointer">
              <div>
                <p className="font-semibold text-white">Resumo Semanal por E-mail</p>
                <p className="text-slate-400 mt-0.5">Destaques dos lançamentos da semana baseados nas suas notas.</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsEmail}
                onChange={(e) => setNotificationsEmail(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-slate-900 border-slate-700"
              />
            </label>
          </div>
        </section>

        {/* Seção 4: APARÊNCIA (Requisito 26) */}
        <section className="bg-[#121622] rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Palette className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Aparência</h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#161a26] border border-slate-800/80 cursor-pointer">
              <div>
                <p className="font-semibold text-white">Modo Escuro (Padrão Cinematográfico)</p>
                <p className="text-slate-400 mt-0.5">Estética imersiva estilo Letterboxd com tons obsidian e esmeralda.</p>
              </div>
              <input
                type="checkbox"
                checked={themeDark}
                onChange={(e) => setThemeDark(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-slate-900 border-slate-700"
              />
            </label>
          </div>
        </section>

        {/* Seção 5: SESSÃO / SAIR DA CONTA (Requisito 26) */}
        {user && (
          <section className="bg-[#121622] rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <LogOut className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-white">Sessão</h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-white">Encerrar sessão atual</p>
                <p className="text-xs text-slate-400 mt-0.5">Você precisará fazer login novamente para editar suas listas.</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sair da conta
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

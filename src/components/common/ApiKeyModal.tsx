import React, { useState } from 'react';
import { KeyRound, ExternalLink, X, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApiKey } from '../../context/ApiKeyContext';

export const ApiKeyModal: React.FC = () => {
  const { apiKey, isKeyModalOpen, closeKeyModal, saveApiKey, clearApiKey } = useApiKey();
  const [inputKey, setInputKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isKeyModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      closeKeyModal();
    }, 1200);
  };

  const handleClear = () => {
    setInputKey('');
    clearApiKey();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121620] border border-slate-700/60 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161b26]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Configuração da RAWG API</h2>
          </div>
          <button
            onClick={closeKeyModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-300 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Regra Fundamental — API RAWG Real</p>
              <p className="text-amber-200/80 leading-relaxed text-xs">
                O GameBox consome exclusivamente dados reais da RAWG. Para buscar e navegar por milhares de jogos
                reais, informe sua chave pessoal da API.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-300">
            <p className="font-medium text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Como obter sua chave gratuita (Leva 1 minuto):
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-400 pl-1">
              <li>
                Acesse{' '}
                <a
                  href="https://rawg.io/apidocs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-mono"
                >
                  rawg.io/apidocs <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Crie uma conta gratuita e clique em "Get an API key"</li>
              <li>Copie a chave e cole no campo abaixo ou no arquivo <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">.env</code></li>
            </ol>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Chave da API (VITE_RAWG_API_KEY)
              </label>
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Ex: 4a2b9c7d1e8f3a0b..."
                className="w-full px-4 py-3 bg-[#0a0d13] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Você também pode salvar no arquivo <span className="text-slate-400">.env</span> na raiz do projeto como{' '}
                <span className="text-emerald-400 font-mono">VITE_RAWG_API_KEY=sua_chave</span>.
              </p>
            </div>

            {savedSuccess && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                <Check className="w-4 h-4" /> Chave salva com sucesso! Atualizando dados...
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              {apiKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:underline"
                >
                  Remover chave salva
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={closeKeyModal}
                  className="px-4 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={!inputKey.trim()}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-emerald-500/20"
                >
                  Salvar Chave
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const ApiKeyBanner: React.FC = () => {
  const { hasKey, openKeyModal } = useApiKey();

  if (hasKey) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-b border-amber-500/30 px-4 py-3 text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong className="font-semibold text-amber-300">Atenção:</strong> A chave da RAWG API não está configurada.
            Adicione sua <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-200 text-xs">VITE_RAWG_API_KEY</code> para carregar o catálogo real de jogos.
          </span>
        </div>
        <button
          onClick={openKeyModal}
          className="whitespace-nowrap px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-1.5"
        >
          <KeyRound className="w-3.5 h-3.5" />
          Configurar Chave Agora
        </button>
      </div>
    </div>
  );
};

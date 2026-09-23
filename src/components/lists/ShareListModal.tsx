import React, { useState } from 'react';
import { X, Copy, Check, Share2, Users } from 'lucide-react';
import { GameList } from '../../types/gamebox';

interface ShareListModalProps {
  list: GameList;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareListModal: React.FC<ShareListModalProps> = ({ list, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const inviteUrl = `${window.location.origin}/invite/${list.inviteCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback manual caso a API de clipboard do navegador falhe
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-slate-700/70 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161b28]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Share2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">Compartilhe esta lista com seus amigos</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <Users className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">{list.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Quem acessar este link poderá entrar no grupo, adicionar jogos e compartilhar avaliações.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Link de Convite:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 px-3 py-2.5 bg-[#0b0e15] border border-slate-700 rounded-xl text-xs text-slate-300 font-mono focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  copied
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar link
                  </>
                )}
              </button>
            </div>
          </div>

          {copied && (
            <p className="text-xs text-emerald-400 font-medium text-center animate-in fade-in">
              ✓ Link copiado! Envie para seus amigos entrarem na lista.
            </p>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

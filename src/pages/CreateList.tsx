import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bookmark, User, Users, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createList } from '../services/gameBoxService';
import { ListType } from '../types/gamebox';

export const CreateList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ListType>('personal');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Você precisa estar logado para criar uma lista.');
      return;
    }

    if (!name.trim()) {
      setError('Por favor, digite um nome para sua lista.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newList = createList(
        {
          name,
          description,
          type,
        },
        user
      );

      navigate(`/lists/${newList.id}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar lista.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/lists"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar para Minhas Listas
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Bookmark className="w-7 h-7 text-emerald-400" />
          Criar Nova Lista
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Crie uma lista pessoal para guardar seus jogos ou crie um grupo para compartilhar avaliações com amigos.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 bg-[#121622] rounded-3xl border border-slate-800 space-y-6">
        {/* Nome */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Nome da Lista <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Jogos para zerar em 2026, Melhores RPGs, Clássicos do PS2..."
            className="w-full px-4 py-3 bg-[#0b0e15] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Descrição (opcional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Conte um pouco sobre o objetivo desta lista ou que tipo de jogos ela reúne..."
            className="w-full px-4 py-3 bg-[#0b0e15] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition resize-none"
          />
        </div>

        {/* Tipo da Lista (Pessoal vs Grupo) com explicação clara conforme Requisito 10 */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Tipo de Lista:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Opção Pessoal */}
            <button
              type="button"
              onClick={() => setType('personal')}
              className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                type === 'personal'
                  ? 'bg-emerald-500/10 border-emerald-500 text-white'
                  : 'bg-[#151926] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  {type === 'personal' && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-base text-white mb-1">Pessoal</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Somente você pode adicionar e avaliar jogos.
                </p>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold mt-4 block">
                Visualizável por link, mas privado para edição
              </span>
            </button>

            {/* Opção Grupo */}
            <button
              type="button"
              onClick={() => setType('group')}
              className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                type === 'group'
                  ? 'bg-cyan-500/10 border-cyan-500 text-white'
                  : 'bg-[#151926] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  {type === 'group' && (
                    <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-base text-white mb-1">Grupo</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Convide seus amigos e construam a lista juntos.
                </p>
              </div>
              <span className="text-[11px] text-cyan-400 font-semibold mt-4 block">
                Link de convite para múltiplos membros adicionarem jogos
              </span>
            </button>
          </div>
        </div>

        {/* Botão de Criação */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
          <Link
            to="/lists"
            className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isSubmitting ? 'Criando lista...' : 'Criar lista'}
          </button>
        </div>
      </form>
    </div>
  );
};

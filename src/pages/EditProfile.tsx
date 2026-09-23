import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, ArrowLeft, Check, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EditProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim()) {
      setError('Nome, username e e-mail são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateProfile({
        name: name.trim(),
        username: username.trim().toLowerCase().replace(/\s+/g, '_'),
        email: email.trim().toLowerCase(),
        bio: bio.trim(),
        avatar: avatar.trim() || user.avatar,
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate(`/profile/${username.trim().toLowerCase()}`);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar alterações.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div>
        <Link
          to={`/profile/${user.username}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Perfil
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <UserIcon className="w-7 h-7 text-emerald-400" />
          Editar Perfil
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Atualize suas informações pessoais visíveis para a comunidade do GameBox.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
          {error}
        </div>
      )}

      {isSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" /> Alterações salvas com sucesso! Redirecionando...
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 bg-[#121622] rounded-3xl border border-slate-800 space-y-5">
        {/* Preview e URL da Foto */}
        <div className="flex items-center gap-5 pb-4 border-b border-slate-800">
          <img
            src={avatar || user.avatar}
            alt={name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/30 shrink-0"
          />
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              URL da Foto de Perfil
            </label>
            <div className="relative">
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://exemplo.com/minha-foto.jpg"
                className="w-full pl-9 pr-3 py-2.5 bg-[#0b0e15] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Nome */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Nome Completo
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#0b0e15] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Nome de Usuário (Username)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">@</span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 bg-[#0b0e15] border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            E-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#0b0e15] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Biografia
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Fale um pouco sobre seus gêneros favoritos, consoles ou jogos marcantes..."
            className="w-full px-4 py-2.5 bg-[#0b0e15] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition resize-none"
          />
        </div>

        {/* Botões Salvar e Cancelar (Requisito 25) */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
          <Link
            to={`/profile/${user.username}`}
            className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

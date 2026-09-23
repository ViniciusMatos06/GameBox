import React from 'react';
import { Gamepad2, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#090b10] mt-auto text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                Game<span className="text-emerald-400">Box</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              O Letterboxd para videogames. Descubra lançamentos e clássicos com a base de dados oficial da RAWG, monte listas pessoais e colabore em listas de grupo com seus amigos.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Navegação</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition">Início</Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-emerald-400 transition">Explorar Catálogo</Link>
              </li>
              <li>
                <Link to="/lists" className="hover:text-emerald-400 transition">Minhas Listas</Link>
              </li>
              <li>
                <Link to="/lists/create" className="hover:text-emerald-400 transition">Criar Nova Lista</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Fonte de Dados</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              Catálogo de jogos, capas e metadados fornecidos em tempo real pela{' '}
              <a
                href="https://rawg.io/apidocs"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                RAWG Video Games API <ExternalLink className="w-3 h-3" />
              </a>.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} GameBox. Desenvolvido para os apaixonados por jogos.</p>
          <div className="flex items-center gap-1">
            <span>Criado com</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>para a comunidade gamer.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

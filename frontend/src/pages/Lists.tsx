import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getMyLists } from '../services/listService';
import { getGamesByIds } from '../services/rawgApi';
import { EmptyState, ErrorState } from '../components/common/States';
import type { GameList } from '../types/gamebox';
import type { RawgGameDetails } from '../types/rawg';
import './Lists.css';

type Filter = 'all' | 'personal' | 'group';

export default function Lists() {
  const [filter, setFilter] = useState<Filter>('all');
  const [lists, setLists] = useState<GameList[]>([]);
  const [covers, setCovers] = useState<Record<number, RawgGameDetails>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    getMyLists()
      .then((l) => {
        setLists(l);
        const ids = l.flatMap((x) => x.games.slice(0, 6).map((g) => g.gameId));
        if (ids.length) getGamesByIds(ids).then(setCovers);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  const filtered = lists.filter((l) => filter === 'all' || l.type === filter);
  const personal = lists.filter((l) => l.type === 'personal').length;
  const groups = lists.filter((l) => l.type === 'group').length;

  return (
    <div className="lists-page">
      <header className="lists-head">
        <div><span className="eyebrow">Minhas listas</span><h1>Listas</h1></div>
        <Link to="/lists/create" className="btn btn-primary"><Plus size={16} /> Criar lista</Link>
      </header>

      <div className="lists-tabs">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Todas ({lists.length})</button>
        <button className={filter === 'personal' ? 'active' : ''} onClick={() => setFilter('personal')}>Pessoais ({personal})</button>
        <button className={filter === 'group' ? 'active' : ''} onClick={() => setFilter('group')}>Grupos ({groups})</button>
      </div>

      {loading ? null : error ? <ErrorState message={error} onRetry={load} />
        : filtered.length === 0 ? (
          <EmptyState title="Nenhuma lista por aqui ainda." description="Crie uma lista pessoal ou de grupo para começar a organizar seus jogos." />
        ) : (
          <div className="lists-col">
            {filtered.map((l) => (
              <Link key={l.id} to={`/lists/${l.id}`} className="list-row">
                <div className="list-row-info">
                  <div className="list-row-tags">
                    <span className="badge">{l.type === 'group' ? 'Grupo' : 'Pessoal'}</span>
                    <small>Atualizada em {new Date(l.updatedAt).toLocaleDateString('pt-BR')}</small>
                  </div>
                  <h2 className="display-heading">{l.name}</h2>
                  <p>{l.description || 'Sem descrição.'}</p>
                  <div className="list-row-count"><b>{l.games.length}</b><span>jogos</span>{l.type === 'group' && <span> · {l.memberUsernames.length} participantes</span>}</div>
                </div>
                <div className="list-row-covers">
                  {l.games.slice(0, 6).map((g) => (
                    <figure key={g.gameId}>
                      {covers[g.gameId]?.background_image ? <img src={covers[g.gameId].background_image as string} alt="" /> : <i />}
                      <figcaption>{covers[g.gameId]?.name}</figcaption>
                    </figure>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      <Link to="/lists/create" className="lists-new"><Plus size={14} /> Nova lista</Link>
    </div>
  );
}

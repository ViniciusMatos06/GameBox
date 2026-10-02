import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users2, User as UserIcon } from 'lucide-react';
import { getMyLists } from '../services/listService';
import { EmptyState, ErrorState } from '../components/common/States';
import Button from '../components/common/Button';
import type { GameList } from '../types/gamebox';
import './Lists.css';

type Filter = 'all' | 'personal' | 'group';

export default function Lists() {
  const [filter, setFilter] = useState<Filter>('all');
  const [lists, setLists] = useState<GameList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    getMyLists()
      .then(setLists)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const filtered = lists.filter((l) => filter === 'all' || l.type === filter);
  const personalCount = lists.filter((l) => l.type === 'personal').length;
  const groupCount = lists.filter((l) => l.type === 'group').length;

  return (
    <div className="lists-page">
      <div className="lists-header">
        <h1>Minhas listas</h1>
        <Link to="/lists/create">
          <Button icon={<Plus size={16} />}>Criar lista</Button>
        </Link>
      </div>

      <div className="lists-filters">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          Todas ({lists.length})
        </button>
        <button className={filter === 'personal' ? 'active' : ''} onClick={() => setFilter('personal')}>
          Pessoais ({personalCount})
        </button>
        <button className={filter === 'group' ? 'active' : ''} onClick={() => setFilter('group')}>
          Grupos ({groupCount})
        </button>
      </div>

      {loading ? null : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma lista por aqui ainda."
          description="Crie uma lista pessoal ou de grupo para começar a organizar seus jogos."
          action={
            <Link to="/lists/create">
              <Button>Criar lista</Button>
            </Link>
          }
        />
      ) : (
        <div className="lists-grid">
          {filtered.map((l) => (
            <Link key={l.id} to={`/lists/${l.id}`} className="list-card">
              <div className="list-card-thumbs">
                {l.games.slice(0, 4).map((_, i) => (
                  <div key={i} className="list-card-thumb-slot" />
                ))}
                {l.games.length === 0 && <div className="list-card-thumb-empty">Sem jogos ainda</div>}
              </div>
              <div className="list-card-body">
                <div className="list-card-title-row">
                  <h3>{l.name}</h3>
                  {l.type === 'group' ? <Users2 size={15} /> : <UserIcon size={15} />}
                </div>
                <p>{l.description || 'Sem descrição.'}</p>
                <div className="list-card-meta">
                  <span>{l.games.length} jogos</span>
                  {l.type === 'group' && <span>{l.memberUsernames.length} participantes</span>}
                  <span>Atualizada em {new Date(l.updatedAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

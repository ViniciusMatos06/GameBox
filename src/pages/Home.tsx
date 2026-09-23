import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users2, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getListsForUser } from '../services/listService';
import { getPopularGames, getUpcomingGames, hasApiKey } from '../services/rawgApi';
import { getUserActivities } from '../services/activityService';
import type { RawgGame } from '../types/rawg';
import GameGrid from '../components/game/GameGrid';
import { EmptyState } from '../components/common/States';
import Button from '../components/common/Button';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const [popular, setPopular] = useState<RawgGame[]>([]);
  const [upcoming, setUpcoming] = useState<RawgGame[]>([]);
  const [loading, setLoading] = useState(true);

  const lists = user ? getListsForUser(user.username).slice(0, 4) : [];
  const activities = user ? getUserActivities(user.username).slice(0, 5) : [];

  useEffect(() => {
    if (!hasApiKey()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([getPopularGames(), getUpcomingGames()])
      .then(([p, u]) => {
        setPopular(p.results.slice(0, 6));
        setUpcoming(u.results.slice(0, 6));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      <h1>Olá, {user?.name.split(' ')[0]} 👋</h1>

      <section className="home-section">
        <div className="home-section-header">
          <h3>Suas listas</h3>
          <Link to="/lists">Ver todas</Link>
        </div>
        {lists.length === 0 ? (
          <EmptyState
            title="Você ainda não tem listas."
            description="Crie uma lista pessoal ou de grupo para começar."
            action={
              <Link to="/lists/create">
                <Button icon={<Plus size={16} />}>Criar lista</Button>
              </Link>
            }
          />
        ) : (
          <div className="home-lists-row">
            {lists.map((l) => (
              <Link to={`/lists/${l.id}`} key={l.id} className="home-list-chip">
                {l.type === 'group' ? <Users2 size={14} /> : <UserIcon size={14} />}
                <div>
                  <strong>{l.name}</strong>
                  <span>{l.games.length} jogos</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {hasApiKey() && (
        <>
          <section className="home-section">
            <div className="home-section-header">
              <h3>Jogos populares</h3>
              <Link to="/explore">Explorar</Link>
            </div>
            <GameGrid games={popular} loading={loading} skeletonCount={6} />
          </section>

          <section className="home-section">
            <div className="home-section-header">
              <h3>Próximos lançamentos</h3>
              <Link to="/explore">Explorar</Link>
            </div>
            <GameGrid games={upcoming} loading={loading} skeletonCount={6} />
          </section>
        </>
      )}

      <section className="home-section">
        <div className="home-section-header">
          <h3>Atividade recente</h3>
        </div>
        {activities.length === 0 ? (
          <p className="home-empty-text">Sua atividade vai aparecer aqui conforme você usa o GameBox.</p>
        ) : (
          <div className="home-activity-list">
            {activities.map((a) => (
              <div key={a.id} className="home-activity-item">
                {describeActivity(a)}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function describeActivity(a: ReturnType<typeof getUserActivities>[number]): string {
  switch (a.type) {
    case 'rated_game':
      return `Você avaliou ${a.gameName ?? 'um jogo'} com ${'★'.repeat(a.stars ?? 0)}`;
    case 'added_game':
      return `Você adicionou ${a.gameName ?? 'um jogo'} à lista ${a.listName ?? ''}`;
    case 'joined_list':
      return `Você entrou na lista ${a.listName ?? ''}`;
    case 'created_list':
      return `Você criou a lista ${a.listName ?? ''}`;
    default:
      return 'Atividade registrada';
  }
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ListChecks, Users, Star } from 'lucide-react';
import Button from '../components/common/Button';
import GameGrid from '../components/game/GameGrid';
import { getPopularGames, hasApiKey } from '../services/rawgApi';
import type { RawgGame } from '../types/rawg';
import { ErrorState } from '../components/common/States';
import './Landing.css';

export default function Landing() {
  const [games, setGames] = useState<RawgGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!hasApiKey()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getPopularGames()
      .then((res) => setGames(res.results.slice(0, 10)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div className="landing">
      <section className="landing-hero">
        <h1>Descubra, organize e avalie seus jogos.</h1>
        <p>Crie suas próprias listas ou reúna seus amigos para construir uma coleção de jogos juntos.</p>
        <div className="landing-hero-actions">
          <Link to="/register">
            <Button>Criar conta</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">Entrar</Button>
          </Link>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-feature">
          <Compass size={24} />
          <h3>Descubra</h3>
          <p>Pesquise milhões de possibilidades através do catálogo de jogos.</p>
        </div>
        <div className="landing-feature">
          <ListChecks size={24} />
          <h3>Organize</h3>
          <p>Crie listas pessoais.</p>
        </div>
        <div className="landing-feature">
          <Users size={24} />
          <h3>Compartilhe</h3>
          <p>Crie listas de grupo e convide seus amigos.</p>
        </div>
        <div className="landing-feature">
          <Star size={24} />
          <h3>Avalie</h3>
          <p>Dê sua própria nota para cada jogo.</p>
        </div>
      </section>

      <section className="landing-showcase">
        <h2>Em alta agora</h2>
        {!hasApiKey() ? (
          <div className="landing-no-key">
            Configure <code>VITE_RAWG_API_KEY</code> em um arquivo <code>.env</code> (veja{' '}
            <code>.env.example</code>) para ver o catálogo real da RAWG.
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <GameGrid games={games} loading={loading} skeletonCount={10} />
        )}
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Star, ListChecks, Users, Link2, Lock, Info } from 'lucide-react';
import { getPopularGames } from '../services/rawgApi';
import type { RawgGame } from '../types/rawg';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const TICKER = ['Elden Ring', 'The Witcher 3', 'Red Dead Redemption 2', 'Portal 2', 'Half-Life 2', 'Tomb Raider', 'Hades', 'Hollow Knight', 'Cyberpunk 2077', 'God of War'];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [games, setGames] = useState<RawgGame[]>([]);

  useEffect(() => {
    getPopularGames().then((r) => setGames(r.results.slice(0, 8))).catch(() => {});
  }, []);

  const cta = isAuthenticated ? '/home' : '/register';

  return (
    <div className="lp">
      <section className="lp-hero">
        <div className="lp-hero-text">
          <span className="lp-pill"><i /> Plataforma social de jogos</span>
          <h1>Seu mundo<br />de jogos.<br /><em>Do seu jeito.</em></h1>
          <p>Descubra jogos, crie suas listas, avalie seus favoritos e compartilhe tudo com seus amigos.</p>
          <div className="lp-hero-actions">
            <Link to={cta} className="lp-btn lp-btn-red">Criar minha conta <ArrowRight size={16} /></Link>
            <Link to={isAuthenticated ? '/explore' : '/login'} className="lp-btn lp-btn-ghost">Explorar jogos</Link>
          </div>
        </div>
        <div className="lp-hero-art">
          <div className="lp-card lp-card-a"><b>W</b><span>The Witcher 3</span><em>★ 4.6</em></div>
          <div className="lp-card lp-card-b"><b>R</b><span>Red Dead Redemption 2</span><em>★ 4.6</em></div>
          <div className="lp-card lp-card-c"><b>P</b></div>
          <div className="lp-panel lp-panel-rate"><small>SUA NOTA</small><strong>The Witcher 3</strong><div>★★★★<span>★</span></div></div>
          <div className="lp-panel lp-panel-list">
            <header><strong>Platinar em 2026</strong><small>6 jogos</small></header>
            <p>Resident Evil 4</p><p>Resident Evil 2</p><p>Marvel's Spider-Man</p>
          </div>
        </div>
      </section>

      <div className="lp-ticker"><div>{[...TICKER, ...TICKER].map((t, i) => <span key={i}>{t}<i /></span>)}</div></div>

      {games.length > 0 && (
        <section className="lp-section">
          <span className="eyebrow">01 — Descubra</span>
          <h2 className="display-heading">Milhares de jogos reais.</h2>
          <div className="lp-games">
            {games.map((g) => (
              <Link key={g.id} to={`/games/${g.id}`} className="lp-game">
                <div className="lp-game-cover">
                  {g.background_image && <img src={g.background_image} alt={g.name} loading="lazy" />}
                  <span className="lp-game-rate">★ {g.rating.toFixed(1)}</span>
                </div>
                <strong>{g.name}</strong>
                <small>{g.released ? new Date(g.released).getFullYear() : '—'} · {g.genres?.[0]?.name ?? ''}</small>
              </Link>
            ))}
          </div>
          <Link to={cta} className="lp-btn lp-btn-red">Explorar jogos <ArrowRight size={16} /></Link>
        </section>
      )}

      <section className="lp-section">
        <span className="eyebrow">02 — Crie suas listas</span>
        <h2 className="display-heading">Duas formas de organizar.</h2>
        <div className="lp-two">
          <div className="lp-box">
            <span className="lp-tag">Listas pessoais</span>
            <h3 className="display-heading">Sua coleção, suas regras.</h3>
            <p>Crie listas para organizar os jogos do seu jeito.</p>
            <div className="lp-chips"><span>Meus favoritos</span><span>Quero jogar</span><span>Melhores RPGs</span><span>Jogos zerados</span></div>
            <small className="lp-note"><Lock size={14} /> Somente você pode adicionar e avaliar jogos da sua lista.</small>
          </div>
          <div className="lp-box lp-box-red">
            <span className="lp-tag lp-tag-red">Listas de grupo</span>
            <h3 className="display-heading">Monte uma lista com seus amigos.</h3>
            <p>Crie uma lista colaborativa e compartilhe um link. Seus amigos entram, adicionam jogos e avaliam os títulos.</p>
            <div className="lp-rating-table">
              <header>Elden Ring</header>
              <div><i>V</i> Vinicius <span>★★★★★</span></div>
              <div><i>J</i> João <span>★★★★<u>★</u></span></div>
              <div><i>M</i> Maria <span>★★★★★</span></div>
              <footer>MÉDIA <strong>4.7 ★</strong></footer>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section lp-split">
        <div>
          <span className="eyebrow">03 — Avalie jogos</span>
          <h2 className="display-heading">Sua opinião também faz parte do jogo.</h2>
          <p>Avalie com 1 a 5 estrelas, escreva sua review e veja como seus amigos avaliaram os mesmos títulos.</p>
          <div className="lp-info"><Info size={16} /> <span><b>A avaliação do GameBox é independente</b> da nota fornecida pela base de dados de jogos.</span></div>
        </div>
        <div className="lp-box">
          <div className="lp-rate-head"><strong>The Witcher 3: Wild Hunt</strong><span>★ 4.6 <small>NOTA RAWG</small></span></div>
          <small className="lp-label">NOTA GAMEBOX — EXPERIMENTE</small>
          <div className="lp-stars">☆☆☆☆☆</div>
        </div>
      </section>

      <section className="lp-section lp-split">
        <div>
          <span className="eyebrow">04 — Seu círculo gamer</span>
          <h2 className="display-heading">Siga amigos. Converse sobre o que está jogando.</h2>
          <p>Encontre pessoas pelo @username, acompanhe a atividade de quem você segue e converse pelo chat que fica disponível em todas as telas.</p>
          <Link to={cta} className="lp-btn lp-btn-red">Criar conta <ArrowRight size={16} /></Link>
        </div>
        <div className="lp-box">
          <div className="lp-follow"><i>V</i><strong>@vinicius</strong><span>Seguindo</span></div>
          <div className="lp-follow"><i>J</i><strong>@joao</strong><span className="lp-follow-cta">+ Seguir</span></div>
          <div className="lp-bubble">Já terminou Elden Ring?</div>
          <div className="lp-bubble lp-bubble-me">Quase, kkk</div>
        </div>
      </section>

      <section className="lp-section">
        <span className="eyebrow">05 — Como funciona</span>
        <h2 className="display-heading">Quatro passos.</h2>
        <div className="lp-steps">
          {[['01', 'Crie sua conta', 'Entre no GameBox e personalize seu perfil.'], ['02', 'Encontre seus jogos', 'Pesquise jogos reais através do catálogo.'], ['03', 'Crie suas listas', 'Organize em listas pessoais ou colaborativas.'], ['04', 'Compartilhe', 'Convide amigos, avaliem juntos e conversem.']].map(([n, t, d]) => (
            <div key={n}><b>{n}</b><strong>{t}</strong><p>{d}</p></div>
          ))}
        </div>
      </section>

      <section className="lp-section">
        <span className="eyebrow">06 — Experiência social</span>
        <h2 className="display-heading">Mais do que uma lista de jogos.</h2>
        <div className="lp-feats">
          {[[Compass, 'Descobrir jogos'], [Star, 'Avaliar'], [ListChecks, 'Criar listas'], [Users, 'Jogar com amigos'], [Link2, 'Compartilhar por link']].map(([Icon, t], i) => {
            const I = Icon as typeof Compass;
            return <div key={i}><I size={22} /><strong>{t as string}</strong></div>;
          })}
        </div>
      </section>

      <section className="lp-final">
        <h2 className="display-heading">Pronto para organizar seus jogos?</h2>
        <Link to={cta} className="lp-btn lp-btn-red">Criar minha conta <ArrowRight size={16} /></Link>
      </section>
    </div>
  );
}

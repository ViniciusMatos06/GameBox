import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getReviewsForGame, upsertReview, addComment } from '../../services/reviewService';
import type { Review } from '../../types/review';
import StarRating from '../common/StarRating';
import Button from '../common/Button';
import { UserAvatar } from '../common/States';
import { timeAgo } from '../../pages/People';
import './GameReviews.css';

type Filter = 'all' | 'following';

export default function GameReviews({ gameId, gameName }: { gameId: number; gameName: string }) {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [myStars, setMyStars] = useState(0);
  const [myText, setMyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function load() {
    setLoading(true);
    getReviewsForGame(gameId, filter).then(setReviews).catch(() => setReviews([])).finally(() => setLoading(false));
  }
  useEffect(load, [gameId, filter]);

  useEffect(() => {
    if (!user) return;
    const mine = reviews.find((r) => r.author.username === user.username);
    if (mine) { setMyStars(mine.stars); setMyText(mine.text); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews.length]);

  async function submitReview() {
    if (myStars === 0) { showToast('Escolha uma nota antes de publicar.', 'info'); return; }
    setSubmitting(true);
    try {
      await upsertReview(gameId, { gameName, stars: myStars, text: myText });
      showToast('Avaliação publicada!');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao publicar.', 'error');
    } finally { setSubmitting(false); }
  }

  async function submitComment(reviewId: string, text: string) {
    if (!text.trim()) return;
    try {
      await addComment(reviewId, text.trim());
      setExpanded((p) => new Set(p).add(reviewId));
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao comentar.', 'error');
    }
  }

  function toggle(id: string) {
    setExpanded((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  return (
    <section className="game-reviews">
      <div className="game-reviews-header">
        <div>
          <span className="eyebrow">Avaliações e comentários</span>
          <h2 className="display-heading">O que estão dizendo</h2>
        </div>
        {isAuthenticated && (
          <div className="game-reviews-filter">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Todas</button>
            <button className={filter === 'following' ? 'active' : ''} onClick={() => setFilter('following')}>Quem eu sigo</button>
          </div>
        )}
      </div>

      {isAuthenticated && (
        <div className="game-reviews-form">
          <span className="game-reviews-form-label">Sua avaliação</span>
          <StarRating value={myStars} onChange={setMyStars} size={22} />
          <textarea rows={2} placeholder="O que você achou desse jogo? (opcional)" value={myText} onChange={(e) => setMyText(e.target.value)} />
          <Button onClick={submitReview} disabled={submitting}>Publicar</Button>
        </div>
      )}

      {loading ? <p className="game-reviews-empty">Carregando...</p>
        : reviews.length === 0 ? <p className="game-reviews-empty">{filter === 'following' ? 'Ninguém que você segue avaliou este jogo ainda.' : 'Nenhuma avaliação ainda. Seja o primeiro!'}</p>
        : (
          <div className="game-reviews-list">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} open={expanded.has(r.id)} onToggle={() => toggle(r.id)}
                canReply={isAuthenticated} onReply={(t) => submitComment(r.id, t)} />
            ))}
          </div>
        )}
    </section>
  );
}

function ReviewCard({ review, open, onToggle, canReply, onReply }: {
  review: Review; open: boolean; onToggle: () => void; canReply: boolean; onReply: (text: string) => void;
}) {
  const [reply, setReply] = useState('');
  const send = () => { if (reply.trim()) { onReply(reply); setReply(''); } };
  const n = review.comments.length;

  return (
    <div className="review-card">
      <div className="review-card-top">
        <Link to={`/profile/${review.author.username}`}><UserAvatar src={review.author.avatarUrl} alt={review.author.username} size={40} /></Link>
        <div className="review-card-meta">
          <Link to={`/profile/${review.author.username}`} className="review-card-name">{review.author.name}</Link>
          <span className="review-card-username">@{review.author.username}</span>
        </div>
        <span className="review-card-time">{timeAgo(review.createdAt)}</span>
      </div>
      <StarRating value={review.stars} readOnly size={15} />
      {review.text && <p className="review-card-text">{review.text}</p>}
      <button className="review-card-toggle" onClick={onToggle}>
        <MessageSquare size={13} /> {n === 0 ? 'Comentar' : `${n} comentário${n > 1 ? 's' : ''}`}
      </button>

      {open && (
        <div className="review-card-thread">
          {review.comments.map((c) => (
            <div className="review-comment" key={c.id}>
              <UserAvatar src={c.author.avatarUrl} alt={c.author.username} size={28} />
              <div>
                <span className="review-comment-author">{c.author.name}</span>{' '}
                <span className="review-comment-username">@{c.author.username}</span>
                <span className="review-comment-time">{timeAgo(c.createdAt)}</span>
                <p>{c.text}</p>
              </div>
            </div>
          ))}
          {canReply && (
            <div className="review-reply-row">
              <input placeholder="Escreva um comentário" value={reply} onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()} />
              <button disabled={!reply.trim()} onClick={send}>Publicar</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

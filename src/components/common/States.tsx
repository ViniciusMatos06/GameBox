import type { ReactNode } from 'react';
import { AlertTriangle, Inbox } from 'lucide-react';
import Button from './Button';
import './States.css';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function GameCardSkeleton() {
  return (
    <div className="game-card-skeleton">
      <Skeleton className="skeleton-cover" />
      <Skeleton className="skeleton-line" />
      <Skeleton className="skeleton-line skeleton-line-short" />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      {icon ?? <Inbox size={36} />}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="empty-state error-state">
      <AlertTriangle size={36} />
      <h3>Não foi possível carregar os jogos.</h3>
      <p>{message}</p>
      {onRetry && <Button onClick={onRetry}>Tentar novamente</Button>}
    </div>
  );
}

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'accent' | 'gold' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function UserAvatar({ src, alt, size = 36 }: { src: string; alt: string; size?: number }) {
  return (
    <img
      src={src}
      alt={alt}
      className="user-avatar"
      style={{ width: size, height: size }}
      onError={(e) => {
        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(alt)}`;
      }}
    />
  );
}

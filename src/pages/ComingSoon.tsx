import { Construction } from 'lucide-react';

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center', color: 'var(--text-muted)' }}>
      <Construction size={36} style={{ marginBottom: 12, color: 'var(--accent-light)' }} />
      <h2 style={{ color: 'var(--text)' }}>{title}</h2>
      <p style={{ fontSize: '0.88rem' }}>
        Esta página está na próxima leva de desenvolvimento do GameBox.
      </p>
    </div>
  );
}

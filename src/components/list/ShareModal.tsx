import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function ShareModal({
  inviteCode,
  onClose,
}: {
  inviteCode: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/invite/${inviteCode}`;

  function handleCopy() {
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal title="Compartilhar lista" onClose={onClose}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 14 }}>
        Compartilhe esta lista com seus amigos
      </p>
      <div
        style={{
          display: 'flex',
          gap: 8,
          background: 'var(--surface-3)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '10px 12px',
          marginBottom: 14,
          alignItems: 'center',
        }}
      >
        <span style={{ flex: 1, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {link}
        </span>
      </div>
      <Button fullWidth onClick={handleCopy} icon={copied ? <Check size={16} /> : <Copy size={16} />}>
        {copied ? 'Link copiado!' : 'Copiar link'}
      </Button>
    </Modal>
  );
}

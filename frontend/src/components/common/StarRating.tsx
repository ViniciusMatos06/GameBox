import { useState } from 'react';
import { Star } from 'lucide-react';
import './StarRating.css';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number;
}

export default function StarRating({ value, onChange, readOnly = false, size = 20 }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div
      className={`star-rating ${readOnly ? 'star-rating-readonly' : ''}`}
      onMouseLeave={() => setHovered(null)}
      role={readOnly ? undefined : 'radiogroup'}
      aria-label="Avaliação em estrelas"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          className="star-rating-btn"
          onMouseEnter={() => !readOnly && setHovered(n)}
          onClick={() => !readOnly && onChange?.(n)}
          aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            className={n <= display ? 'star-filled' : 'star-empty'}
            fill={n <= display ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  );
}

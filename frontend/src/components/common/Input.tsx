import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = '', ...rest }: InputProps) {
  return (
    <div className="field">
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}
      <input id={id} className={`field-input ${error ? 'field-input-error' : ''} ${className}`} {...rest} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, className = '', ...rest }: TextareaProps) {
  return (
    <div className="field">
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}
      <textarea id={id} className={`field-input field-textarea ${error ? 'field-input-error' : ''} ${className}`} {...rest} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

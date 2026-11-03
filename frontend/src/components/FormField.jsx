import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function FormField({ label, name, error, type, ...inputProps }) {
  const errorId = `${name}-error`;
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-navy">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && revealed ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`input-field ${isPassword ? 'pr-10' : ''}`}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed(!revealed)}
            aria-label={`${revealed ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-2 text-muted transition hover:text-navy"
          >
            {revealed ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

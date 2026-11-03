import { Minus, Plus } from 'lucide-react';

const MAX_QUANTITY = 99;
const BUTTON = 'p-3 text-navy transition hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-40';

export default function QuantitySelector({ value, onChange }) {
  return (
    <div className="flex items-center rounded-control border border-line bg-white">
      <button type="button" aria-label="Decrease quantity" disabled={value <= 1} onClick={() => onChange(value - 1)} className={BUTTON}>
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <span aria-live="polite" className="w-8 text-center text-sm font-semibold tabular-nums text-navy">{value}</span>
      <button type="button" aria-label="Increase quantity" disabled={value >= MAX_QUANTITY} onClick={() => onChange(value + 1)} className={BUTTON}>
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

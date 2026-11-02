import { formatEnum } from '../../utils/format.js';

const TONES = {
  good: 'bg-green-50 text-green-700',
  warn: 'bg-amber-50 text-amber-800',
  bad: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  neutral: 'bg-slate-100 text-slate-700',
};

const STATUS_TONES = {
  ACTIVE: 'good', PUBLISHED: 'good', PAID: 'good', DELIVERED: 'good', Yes: 'good', Success: 'good',
  PENDING: 'warn', DRAFT: 'warn', PARTIALLY_REFUNDED: 'warn', Low: 'warn',
  SUSPENDED: 'bad', FAILED: 'bad', CANCELLED: 'bad', Out: 'bad', Failed: 'bad',
  CONFIRMED: 'info', PROCESSING: 'info', SHIPPED: 'info', ADMIN: 'info',
};

export default function StatusBadge({ value }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[STATUS_TONES[value] ?? 'neutral']}`}>
      {/^[A-Z_]+$/.test(value) ? formatEnum(value) : value}
    </span>
  );
}

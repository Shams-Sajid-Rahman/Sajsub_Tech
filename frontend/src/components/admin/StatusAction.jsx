import { formatEnum } from '../../utils/format.js';

// A menu of the status changes the API says are allowed for this record.
export default function StatusAction({ row, onChoose }) {
  if (row.allowedStatuses.length === 0) return <span className="text-muted">-</span>;
  return (
    <select
      aria-label="Change status"
      value=""
      onChange={({ target }) => target.value && onChoose(row, target.value)}
      className="rounded-lg border border-line bg-white px-2 py-1 text-sm text-navy outline-none focus:border-primary"
    >
      <option value="">Change to...</option>
      {row.allowedStatuses.map((status) => (
        <option key={status} value={status}>
          {formatEnum(status)}
        </option>
      ))}
    </select>
  );
}

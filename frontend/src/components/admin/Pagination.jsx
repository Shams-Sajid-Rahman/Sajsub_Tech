const BUTTON = 'rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-navy hover:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line';

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.total === 0) return null;
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-2 border-t border-line p-3 text-sm text-muted">
      <span>
        Page {meta.page} of {meta.totalPages} ({meta.total} total)
      </span>
      <div className="flex gap-2">
        <button type="button" className={BUTTON} disabled={!meta.hasPreviousPage} onClick={() => onPageChange(meta.page - 1)}>
          Previous
        </button>
        <button type="button" className={BUTTON} disabled={!meta.hasNextPage} onClick={() => onPageChange(meta.page + 1)}>
          Next
        </button>
      </div>
    </nav>
  );
}

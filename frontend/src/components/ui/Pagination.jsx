import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button.jsx';

// The first and last page, plus the pages next to the current one. Null marks a gap.
const visiblePages = (page, totalPages) => {
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((number) => number >= 1 && number <= totalPages)
    .sort((a, b) => a - b);
  return pages.flatMap((number, index) => (index > 0 && number - pages[index - 1] > 1 ? [null, number] : [number]));
};

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.total === 0) return null;
  const { page, totalPages, total, hasPreviousPage, hasNextPage } = meta;

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-2 border-t border-line p-3 text-sm text-muted">
      <span>
        Page {page} of {totalPages} ({total} total)
      </span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" icon={ChevronLeft} disabled={!hasPreviousPage} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <span className="hidden items-center gap-1 sm:flex">
          {visiblePages(page, totalPages).map((number, index) =>
            number === null ? (
              <span key={`gap-${index}`} aria-hidden="true" className="px-1">
                …
              </span>
            ) : (
              <Button
                key={number}
                variant={number === page ? 'primary' : 'ghost'}
                size="sm"
                aria-label={`Page ${number}`}
                aria-current={number === page ? 'page' : undefined}
                onClick={() => onPageChange(number)}
              >
                {number}
              </Button>
            ),
          )}
        </span>
        <Button variant="outline" size="sm" disabled={!hasNextPage} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight aria-hidden="true" className="size-3.5" />
        </Button>
      </div>
    </nav>
  );
}

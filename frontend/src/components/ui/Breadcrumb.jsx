import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// items: [{ label, to }]. The last item is the current page.
export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted">
        {items.map(({ label, to }, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={label} className="flex min-w-0 items-center gap-1">
              {index > 0 && <ChevronRight aria-hidden="true" className="size-3 shrink-0" />}
              {isLast || !to ? (
                <span aria-current={isLast ? 'page' : undefined} className="truncate font-medium text-navy">
                  {label}
                </span>
              ) : (
                <Link to={to} className="rounded hover:text-primary-dark">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

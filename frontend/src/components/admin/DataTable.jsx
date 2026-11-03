import EmptyState from '../ui/EmptyState.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import Pagination from '../ui/Pagination.jsx';
import LoadingSkeleton from '../ui/LoadingSkeleton.jsx';

const SKELETON_ROWS = 5;

// columns: [{ header, render(row), align }]. list: the result of useAdminList.
export default function DataTable({ columns, list, emptyMessage = 'Nothing found.', rowKey = (row) => row.id }) {
  const { rows, meta, loading, error, reload, setPage } = list;

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-xs uppercase tracking-wide text-muted">
            <tr>
              {columns.map(({ header, align }) => (
                <th key={header} scope="col" className={`whitespace-nowrap px-4 py-3 font-semibold ${align === 'right' ? 'text-right' : ''}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && rows.length === 0
              ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                  <tr key={index}>
                    {columns.map(({ header }) => (
                      <td key={header} className="px-4 py-3">
                        <LoadingSkeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr key={rowKey(row)} className="hover:bg-slate-50">
                    {columns.map(({ header, render, align }) => (
                      <td key={header} className={`px-4 py-3 text-navy ${align === 'right' ? 'text-right tabular-nums' : ''}`}>
                        {render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {!loading && rows.length === 0 && <EmptyState compact message={emptyMessage} />}
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
}

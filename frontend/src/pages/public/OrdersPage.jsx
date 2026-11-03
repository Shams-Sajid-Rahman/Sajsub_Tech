import { useState } from 'react';
import { ChevronRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import StorePage, { CARD } from '../../components/store/StorePage.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { formatDateTime, formatMoney } from '../../utils/format.js';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, meta, loading, error, reload } = useFetch(`/orders?page=${page}&limit=10`);

  return (
    <StorePage title="My orders">
      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && !data && <LoadingSkeleton className="h-48 rounded-xl" />}
      {data?.length === 0 && (
        <div className={CARD}>
          <EmptyState icon={Package} title="No orders yet" message="You haven't placed any orders yet." action={<Button to="/shop">Start shopping</Button>} />
        </div>
      )}
      {data?.length > 0 && (
        <div className={`${CARD} overflow-hidden`}>
          <ul className="divide-y divide-line">
            {data.map((order) => (
              <li key={order.id}>
                <Link to={`/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-page">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-navy">{order.orderNumber}</span>
                    <span className="block text-xs text-muted">
                      {formatDateTime(order.placedAt)} · {order._count.items} {order._count.items === 1 ? 'item' : 'items'}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <StatusBadge value={order.status} />
                    <StatusBadge value={order.paymentStatus} />
                    <span className="text-sm font-bold tabular-nums text-navy">{formatMoney(order.totalAmount)}</span>
                    <ChevronRight aria-hidden="true" className="size-4 text-muted" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}
    </StorePage>
  );
}

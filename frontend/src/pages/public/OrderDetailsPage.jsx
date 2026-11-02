import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import ErrorState from '../../components/admin/ErrorState.jsx';
import Skeleton from '../../components/admin/Skeleton.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import OrderSummary from '../../components/store/OrderSummary.jsx';
import StorePage, { CARD } from '../../components/store/StorePage.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { apiPost } from '../../services/api.js';
import { formatDateTime, formatEnum, formatMoney } from '../../utils/format.js';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { data: order, loading, error, reload } = useFetch(`/orders/${id}`);
  const toast = useToast();
  const [cancelling, setCancelling] = useState(false);

  const cancel = async () => {
    await apiPost(`/orders/${id}/cancel`);
    toast.success('Order cancelled');
    reload();
  };

  if (error) {
    return (
      <StorePage>
        <ErrorState message={error} onRetry={reload} />
      </StorePage>
    );
  }
  if (loading && !order) {
    return (
      <StorePage>
        <Skeleton className="h-64 rounded-xl" />
      </StorePage>
    );
  }
  if (!order) return null;

  const address = order.shippingAddress;
  const payment = order.payments[0];

  return (
    <StorePage title={`Order ${order.orderNumber}`} subtitle={`Placed ${formatDateTime(order.placedAt)}`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge value={order.status} />
        <StatusBadge value={order.paymentStatus} />
        {order.status === 'PENDING' && (
          <button type="button" onClick={() => setCancelling(true)} className="ml-auto text-sm font-semibold text-red-600 hover:text-red-700">
            Cancel order
          </button>
        )}
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_340px]">
        <ul className={`${CARD} divide-y divide-line`}>
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 p-4">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-page p-1">
                {item.imageUrl ? <img src={item.imageUrl} alt="" className="max-h-full max-w-full object-contain" /> : <ImageOff aria-hidden="true" className="size-5 text-slate-300" />}
              </span>
              <span className="min-w-0 flex-1 text-sm">
                <span className="block font-semibold text-navy">{item.productName}</span>
                <span className="block text-xs text-muted">{formatMoney(item.unitPrice)} × {item.quantity}</span>
              </span>
              <span className="text-sm font-bold tabular-nums text-navy">{formatMoney(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <aside className="space-y-5">
          <section className={`${CARD} p-5`}>
            <h2 className="mb-3 font-bold text-navy">Summary</h2>
            <OrderSummary subtotal={order.subtotalAmount} discount={order.discountAmount} shipping={order.shippingAmount} total={order.totalAmount} />
            {payment && <p className="mt-3 text-xs text-muted">Payment: {formatEnum(payment.method)}</p>}
          </section>
          <section className={`${CARD} p-5 text-sm text-muted`}>
            <h2 className="mb-2 font-bold text-navy">Shipping to</h2>
            <p>{address.fullName}</p>
            <p>{[address.line1, address.line2].filter(Boolean).join(', ')}</p>
            <p>{[address.city, address.state, address.postalCode].filter(Boolean).join(', ')}</p>
            <p>{address.country}</p>
            <p>{address.phone}</p>
          </section>
        </aside>
      </div>
      <Link to="/orders" className="mt-5 inline-block text-sm font-semibold text-primary">← Back to my orders</Link>
      {cancelling && (
        <ConfirmDialog
          title="Cancel this order?"
          message="Your order will be cancelled. This can't be undone."
          confirmLabel="Cancel order"
          onConfirm={cancel}
          onClose={() => setCancelling(false)}
        />
      )}
    </StorePage>
  );
}

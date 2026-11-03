import { Check, ImageOff, Truck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import FormMessage from '../../components/FormMessage.jsx';
import OrderSummary from '../../components/store/OrderSummary.jsx';
import StorePage, { CARD } from '../../components/store/StorePage.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { apiPost } from '../../services/api.js';
import { formatDateTime, formatEnum, formatMoney } from '../../utils/format.js';

const TRACKING_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const CLOSED_STATUSES = ['CANCELLED', 'REFUNDED'];
const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED'];
const COLLECTED_STATUSES = ['PAID', 'PARTIALLY_REFUNDED', 'REFUNDED'];

const STEP_LABELS = { PENDING: 'Order placed' };
const stepLabel = (status) => STEP_LABELS[status] ?? formatEnum(status);

// Follows the normal delivery steps. A cancelled or refunded order just shows what happened.
function TrackingTimeline({ order }) {
  const reached = new Map(order.statusHistory.map((entry) => [entry.status, entry]));
  const statuses = CLOSED_STATUSES.includes(order.status) ? order.statusHistory.map(({ status }) => status) : TRACKING_STEPS;

  return (
    <section className={`${CARD} p-5`}>
      <h2 className="mb-4 font-bold text-navy">Order tracking</h2>
      <ol>
        {statuses.map((status, index) => {
          const entry = reached.get(status);
          const isLast = index === statuses.length - 1;
          return (
            <li key={`${status}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
              {!isLast && <span aria-hidden="true" className={`absolute left-[11px] top-6 h-[calc(100%-24px)] w-0.5 ${entry ? 'bg-primary' : 'bg-line'}`} />}
              <span className={`flex size-6 shrink-0 items-center justify-center rounded-full ${entry ? 'bg-primary text-white' : 'border-2 border-line bg-white'}`}>
                {entry && <Check aria-hidden="true" className="size-3.5" />}
              </span>
              <span className="min-w-0 text-sm">
                <span className={`block font-semibold ${entry ? 'text-navy' : 'text-muted'}`}>{stepLabel(status)}</span>
                {entry && <span className="block text-xs text-muted">{formatDateTime(entry.createdAt)}</span>}
                {entry?.note && <span className="block text-xs text-muted">{entry.note}</span>}
              </span>
            </li>
          );
        })}
      </ol>
      {order.trackingNumber && (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-page p-3 text-sm text-navy">
          <Truck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            {order.carrier && `${order.carrier}: `}
            <span className="font-semibold">{order.trackingNumber}</span>
          </span>
        </p>
      )}
    </section>
  );
}

function PaymentSection({ order, paying, onPay, onCheck, checking }) {
  const canPay = order.paymentMethod === 'ONLINE' && order.status === 'PENDING' && !COLLECTED_STATUSES.includes(order.paymentStatus);
  const refunded = order.refunds.reduce((sum, { amount }) => sum + Number(amount), 0);

  return (
    <section className={`${CARD} p-5 text-sm`}>
      <h2 className="mb-3 font-bold text-navy">Payment</h2>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted">{order.paymentMethod === 'ONLINE' ? 'Online payment' : 'Cash on delivery'}</span>
        <StatusBadge value={order.paymentStatus} />
      </div>
      {refunded > 0 && <p className="mt-2 text-muted">Refunded: {formatMoney(refunded)}</p>}
      {order.payments.some(({ needsRefund }) => needsRefund) && (
        <p className="mt-2 text-xs text-muted">A refund is due on this order. Our team will process it.</p>
      )}
      {canPay && (
        <div className="mt-3 space-y-2">
          <button type="button" onClick={onPay} disabled={paying} className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
            {paying ? 'Opening payment page...' : `Pay ${formatMoney(order.totalAmount)} now`}
          </button>
          {order.payments.length > 0 && (
            <button type="button" onClick={onCheck} disabled={checking} className="w-full rounded-lg border border-line py-2 font-semibold text-navy hover:border-primary disabled:opacity-60">
              {checking ? 'Checking...' : 'I already paid: check again'}
            </button>
          )}
          <p className="text-xs text-muted">Unpaid orders are cancelled automatically after 30 minutes.</p>
        </div>
      )}
      {order.payments.length > 0 && (
        <details className="mt-3 border-t border-line pt-3">
          <summary className="cursor-pointer font-medium text-navy">Payment history</summary>
          <ul className="mt-2 space-y-2">
            {order.payments.map((payment) => (
              <li key={payment.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="min-w-0">
                  <span className="block text-navy">{formatMoney(payment.amount)} · {formatDateTime(payment.paidAt ?? payment.createdAt)}</span>
                  {payment.transactionRef && <span className="block break-all text-muted">Ref: {payment.transactionRef}</span>}
                  {payment.failureReason && <span className="block text-muted">{payment.failureReason}</span>}
                </span>
                <StatusBadge value={payment.status} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

// Only explains the trip back from the payment page. Whether an order is paid always comes from the server.
const RETURN_MESSAGES = {
  failed: ['error', 'Your payment did not go through. You can try again below.'],
  cancelled: ['error', 'You cancelled the payment. You can try again below.'],
  pending: ['success', "We're confirming your payment with the provider. This page will update when it's verified."],
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const paymentReturn = searchParams.get('payment');
  const { data: order, loading, error, reload } = useFetch(`/orders/${id}`);
  const toast = useToast();
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);
  const [checking, setChecking] = useState(false);
  const autoChecked = useRef(false);

  const check = async ({ quiet = false } = {}) => {
    setChecking(true);
    try {
      await apiPost(`/orders/${id}/payments/verify`);
      await reload();
      if (!quiet) toast.success('Checked with the payment provider');
    } catch (requestError) {
      if (!quiet) toast.error(requestError.message);
    } finally {
      setChecking(false);
    }
  };

  // The provider's notification can't always reach us, so returning customers trigger one check.
  useEffect(() => {
    if (paymentReturn !== 'pending' || autoChecked.current) return;
    autoChecked.current = true;
    check({ quiet: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentReturn]);

  const pay = async () => {
    setPaying(true);
    try {
      const { data } = await apiPost(`/orders/${id}/payments`);
      window.location.assign(data.gatewayUrl);
    } catch (requestError) {
      toast.error(requestError.message);
      setPaying(false);
      reload();
    }
  };

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
        <LoadingSkeleton className="h-64 rounded-xl" />
      </StorePage>
    );
  }
  if (!order) return null;

  const address = order.shippingAddress;
  const isPaid = COLLECTED_STATUSES.includes(order.paymentStatus);
  const returnMessage = !isPaid ? RETURN_MESSAGES[paymentReturn] : null;

  return (
    <StorePage title={`Order ${order.orderNumber}`} subtitle={`Placed ${formatDateTime(order.placedAt)}`}>
      {location.state?.justPlaced && (
        <div className="mb-4"><FormMessage type="success">Thank you! Your order has been placed.</FormMessage></div>
      )}
      {paymentReturn && isPaid && (
        <div className="mb-4"><FormMessage type="success">Your payment has been verified. Thank you!</FormMessage></div>
      )}
      {returnMessage && (
        <div className="mb-4"><FormMessage type={returnMessage[0]}>{returnMessage[1]}</FormMessage></div>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge value={order.status} />
        {CANCELLABLE_STATUSES.includes(order.status) && (
          <button type="button" onClick={() => setCancelling(true)} className="ml-auto text-sm font-semibold text-red-600 hover:text-red-700">
            Cancel order
          </button>
        )}
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <TrackingTimeline order={order} />
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
        </div>
        <aside className="space-y-5">
          <section className={`${CARD} p-5`}>
            <h2 className="mb-3 font-bold text-navy">Summary</h2>
            <OrderSummary subtotal={order.subtotalAmount} discount={order.discountAmount} shipping={order.shippingAmount} total={order.totalAmount} />
          </section>
          <PaymentSection order={order} paying={paying} onPay={pay} onCheck={() => check()} checking={checking} />
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
          message={isPaid ? "Your order will be cancelled and a refund will be arranged. This can't be undone." : "Your order will be cancelled. This can't be undone."}
          confirmLabel="Cancel order"
          onConfirm={cancel}
          onClose={() => setCancelling(false)}
        />
      )}
    </StorePage>
  );
}

import { formatMoney } from '../../utils/format.js';

// Shows subtotal, discount (when there is one), shipping and total, as calculated by the server.
export default function OrderSummary({ subtotal, discount, shipping, total }) {
  const rowClass = 'flex justify-between text-muted';
  return (
    <dl className="space-y-2 text-sm tabular-nums">
      <div className={rowClass}>
        <dt>Subtotal</dt>
        <dd>{formatMoney(subtotal)}</dd>
      </div>
      {Number(discount) > 0 && (
        <div className="flex justify-between font-medium text-green-700">
          <dt>Discount</dt>
          <dd>-{formatMoney(discount)}</dd>
        </div>
      )}
      <div className={rowClass}>
        <dt>Shipping</dt>
        <dd>{Number(shipping) === 0 ? 'Free' : formatMoney(shipping)}</dd>
      </div>
      <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-navy">
        <dt>Total</dt>
        <dd>{formatMoney(total)}</dd>
      </div>
    </dl>
  );
}

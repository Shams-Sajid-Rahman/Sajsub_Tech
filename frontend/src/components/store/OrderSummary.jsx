import { formatMoney } from '../../utils/format.js';

// rows: [[label, amount]]. The last row is shown as the total.
export default function OrderSummary({ rows }) {
  return (
    <dl className="space-y-2 text-sm tabular-nums">
      {rows.map(([label, amount], index) => {
        const isTotal = index === rows.length - 1;
        return (
          <div key={label} className={`flex justify-between ${isTotal ? 'border-t border-line pt-2 text-base font-bold text-navy' : 'text-muted'}`}>
            <dt>{label}</dt>
            <dd>{Number(amount) === 0 && label === 'Shipping' ? 'Free' : formatMoney(amount)}</dd>
          </div>
        );
      })}
    </dl>
  );
}

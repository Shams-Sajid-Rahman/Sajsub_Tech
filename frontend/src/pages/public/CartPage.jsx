import { ImageOff, Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton.jsx';
import OrderSummary from '../../components/store/OrderSummary.jsx';
import StorePage, { CARD } from '../../components/store/StorePage.jsx';
import { useStore } from '../../hooks/useStore.js';
import { useToast } from '../../hooks/useToast.js';
import { formatMoney } from '../../utils/format.js';

const issueMessage = (issue, stockAvailable) => {
  if (issue === 'NOT_ENOUGH_STOCK') return `Only ${stockAvailable} left. Lower the quantity to continue.`;
  if (issue === 'OUT_OF_STOCK') return 'Out of stock. Remove this item to continue.';
  return 'No longer available. Remove this item to continue.';
};

export default function CartPage() {
  const { cart, updateCartItem, removeCartItem } = useStore();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const run = async (action) => {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  if (!cart) {
    return (
      <StorePage title="My cart">
        <LoadingSkeleton className="h-64 rounded-xl" />
      </StorePage>
    );
  }
  if (cart.items.length === 0) {
    return (
      <StorePage title="My cart">
        <p className={`${CARD} p-10 text-center text-sm text-muted`}>
          Your cart is empty. <Link to="/shop" className="font-semibold text-primary">Start shopping</Link>
        </p>
      </StorePage>
    );
  }

  const blocked = cart.items.some(({ available }) => !available);

  return (
    <StorePage title="My cart">
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_340px]">
        <ul className={`${CARD} divide-y divide-line`}>
          {cart.items.map(({ productId, quantity, lineTotal, available, issue, stockAvailable, product }) => (
            <li key={productId} className="flex flex-wrap items-center gap-3 p-4">
              <Link to={`/product/${product.slug}`} className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-page p-1">
                {product.primaryImage ? <img src={product.primaryImage.url} alt="" className="max-h-full max-w-full object-contain" /> : <ImageOff aria-hidden="true" className="size-6 text-slate-300" />}
              </Link>
              <div className="min-w-40 flex-1">
                <Link to={`/product/${product.slug}`} className="text-sm font-semibold text-navy hover:text-primary">{product.name}</Link>
                <p className="text-xs text-muted">{formatMoney(product.effectivePrice)} each</p>
                {!available && <p className="mt-1 text-xs font-semibold text-red-700">{issueMessage(issue, stockAvailable)}</p>}
              </div>
              <div className="flex items-center rounded-lg border border-line">
                <button type="button" aria-label={`Decrease ${product.name} quantity`} disabled={busy || quantity <= 1} onClick={() => run(() => updateCartItem(productId, quantity - 1))} className="p-2 text-navy disabled:opacity-40">
                  <Minus aria-hidden="true" className="size-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold tabular-nums text-navy">{quantity}</span>
                <button type="button" aria-label={`Increase ${product.name} quantity`} disabled={busy} onClick={() => run(() => updateCartItem(productId, quantity + 1))} className="p-2 text-navy disabled:opacity-40">
                  <Plus aria-hidden="true" className="size-4" />
                </button>
              </div>
              <p className="w-24 text-right text-sm font-bold tabular-nums text-navy">{formatMoney(lineTotal)}</p>
              <button type="button" aria-label={`Remove ${product.name}`} disabled={busy} onClick={() => run(() => removeCartItem(productId))} className="p-1 text-muted hover:text-red-600">
                <Trash2 aria-hidden="true" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <aside className={`${CARD} p-5`}>
          <h2 className="mb-3 font-bold text-navy">Order summary</h2>
          <OrderSummary {...cart} />
          {blocked && <p className="mt-3 text-xs font-semibold text-red-700">Fix the items marked above to continue.</p>}
          <Link
            to={blocked ? '#' : '/checkout'}
            aria-disabled={blocked}
            className={`mt-4 block rounded-lg py-2.5 text-center text-sm font-semibold text-white ${blocked ? 'pointer-events-none bg-slate-300' : 'bg-primary hover:bg-primary-dark'}`}
          >
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </StorePage>
  );
}

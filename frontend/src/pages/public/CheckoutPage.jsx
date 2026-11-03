import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton.jsx';
import FormField from '../../components/FormField.jsx';
import FormMessage from '../../components/FormMessage.jsx';
import OrderSummary from '../../components/store/OrderSummary.jsx';
import StorePage, { CARD } from '../../components/store/StorePage.jsx';
import SubmitButton from '../../components/SubmitButton.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { useStore } from '../../hooks/useStore.js';
import { useToast } from '../../hooks/useToast.js';
import { apiDelete, apiPost } from '../../services/api.js';
import { formatMoney } from '../../utils/format.js';

const ADDRESS_FIELDS = [
  { name: 'fullName', label: 'Full name', autoComplete: 'name' },
  { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
  { name: 'line1', label: 'Address', autoComplete: 'address-line1', wide: true },
  { name: 'line2', label: 'Apartment, suite (optional)', autoComplete: 'address-line2', wide: true },
  { name: 'city', label: 'City', autoComplete: 'address-level2' },
  { name: 'state', label: 'State or region (optional)', autoComplete: 'address-level1' },
  { name: 'postalCode', label: 'Postal code (optional)', autoComplete: 'postal-code' },
  { name: 'country', label: 'Country', autoComplete: 'country-name' },
];

const paymentMethods = (onlineEnabled) => [
  { value: 'CASH_ON_DELIVERY', label: 'Cash on delivery', help: 'Pay when your order arrives.' },
  {
    value: 'ONLINE',
    label: 'Pay online',
    help: onlineEnabled ? 'Cards, mobile banking and internet banking through SSLCommerz.' : 'Not available right now.',
    disabled: !onlineEnabled,
  },
];

const describeAddress = ({ line1, line2, city, state, postalCode, country }) =>
  [line1, line2, city, state, postalCode, country].filter(Boolean).join(', ');

function NewAddressForm({ onSaved, onCancel }) {
  const { user } = useAuth();
  const form = useForm({
    fullName: `${user.firstName} ${user.lastName}`,
    phone: user.phone ?? '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const save = form.submitWith(async (values) => {
    const { data } = await apiPost('/addresses', values);
    await onSaved(data);
  });

  return (
    <div className="mt-3 rounded-lg border border-line p-4">
      <FormMessage>{form.error}</FormMessage>
      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        {ADDRESS_FIELDS.map(({ wide, name, ...field }) => (
          <div key={name} className={wide ? 'sm:col-span-2' : ''}>
            <FormField name={name} value={form.values[name]} onChange={form.handleChange} error={form.fieldErrors[name]} {...field} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={save} disabled={form.submitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
          {form.submitting ? 'Saving...' : 'Save address'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-navy">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function AddressSection({ selectedId, onSelect, error }) {
  const toast = useToast();
  const { data: addresses, loading, error: loadError, reload } = useFetch('/addresses');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!addresses) return;
    if (!addresses.some(({ id }) => id === selectedId)) onSelect(addresses[0]?.id ?? null);
  }, [addresses, selectedId, onSelect]);

  const handleSaved = async (address) => {
    await reload();
    onSelect(address.id);
    setAdding(false);
  };

  const handleDelete = async (id) => {
    try {
      await apiDelete(`/addresses/${id}`);
      await reload();
    } catch (requestError) {
      toast.error(requestError.message);
    }
  };

  const showForm = adding || addresses?.length === 0;

  return (
    <section className={`${CARD} p-5`}>
      <h2 className="mb-3 font-bold text-navy">Shipping address</h2>
      {loadError && <ErrorState message={loadError} onRetry={reload} />}
      {loading && !addresses && <LoadingSkeleton className="h-24" />}
      <ul className="space-y-2">
        {(addresses ?? []).map((address) => (
          <li key={address.id} className={`flex items-start gap-3 rounded-lg border p-3 ${selectedId === address.id ? 'border-primary bg-page' : 'border-line'}`}>
            <input
              type="radio"
              id={`address-${address.id}`}
              name="address"
              checked={selectedId === address.id}
              onChange={() => onSelect(address.id)}
              className="mt-1 accent-primary"
            />
            <label htmlFor={`address-${address.id}`} className="min-w-0 flex-1 cursor-pointer text-sm">
              <span className="block font-semibold text-navy">
                {address.fullName} · {address.phone}
                {address.isDefault && <span className="ml-2 text-xs font-medium text-primary">Default</span>}
              </span>
              <span className="block text-muted">{describeAddress(address)}</span>
            </label>
            <button type="button" onClick={() => handleDelete(address.id)} aria-label={`Delete address ${address.line1}`} className="text-xs font-semibold text-red-600 hover:text-red-700">
              Delete
            </button>
          </li>
        ))}
      </ul>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {showForm ? (
        <NewAddressForm onSaved={handleSaved} onCancel={addresses?.length ? () => setAdding(false) : null} />
      ) : (
        addresses && (
          <button type="button" onClick={() => setAdding(true)} className="mt-3 text-sm font-semibold text-primary">
            + Add a new address
          </button>
        )
      )}
    </section>
  );
}

export default function CheckoutPage() {
  const { cart, refreshCart, site } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const form = useForm({ customerNote: '' });
  const [addressId, setAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  // Stays the same across retries of this checkout, so a repeat can't create a second order.
  const idempotencyKey = useRef(crypto.randomUUID());
  const placing = useRef(false);

  const onSubmit = form.submitWith(async ({ customerNote }) => {
    if (placing.current) return;
    placing.current = true;
    try {
      const { data } = await apiPost('/orders', {
        addressId: addressId ?? undefined,
        paymentMethod,
        idempotencyKey: idempotencyKey.current,
        expectedTotal: cart.total,
        customerNote,
      });
      if (paymentMethod === 'ONLINE') {
        try {
          const { data: payment } = await apiPost(`/orders/${data.id}/payments`);
          window.location.assign(payment.gatewayUrl);
          return;
        } catch {
          // The order exists and can be paid from its own page.
          toast.error("Your order is saved, but the payment page couldn't open. Please try again from your order.");
        }
      }
      await refreshCart();
      navigate(`/orders/${data.id}`, { replace: true, state: { justPlaced: true } });
    } catch (error) {
      await refreshCart().catch(() => {});
      throw error;
    } finally {
      placing.current = false;
    }
  });

  if (!cart) {
    return (
      <StorePage title="Checkout">
        <LoadingSkeleton className="h-64 rounded-xl" />
      </StorePage>
    );
  }
  if (cart.items.length === 0) {
    return (
      <StorePage title="Checkout">
        <p className={`${CARD} p-10 text-center text-sm text-muted`}>
          Your cart is empty. <Link to="/shop" className="font-semibold text-primary">Start shopping</Link>
        </p>
      </StorePage>
    );
  }

  const blocked = cart.items.some(({ available }) => !available);

  return (
    <StorePage title="Checkout">
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <AddressSection selectedId={addressId} onSelect={setAddressId} error={form.fieldErrors.addressId} />
          <section className={`${CARD} p-5`}>
            <h2 className="mb-3 font-bold text-navy">Payment method</h2>
            <div className="space-y-2">
              {paymentMethods(Boolean(site.payments?.online)).map(({ value, label, help, disabled }) => (
                <label key={value} className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${paymentMethod === value ? 'border-primary bg-page' : 'border-line'} ${disabled ? 'opacity-60' : 'cursor-pointer'}`}>
                  <input type="radio" name="paymentMethod" value={value} disabled={disabled} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="mt-1 accent-primary" />
                  <span>
                    <span className="block font-semibold text-navy">{label}</span>
                    <span className="block text-xs text-muted">{help}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
          <section className={`${CARD} p-5`}>
            <label htmlFor="customerNote" className="mb-1 block font-bold text-navy">Order note (optional)</label>
            <textarea id="customerNote" name="customerNote" rows={2} maxLength={1000} value={form.values.customerNote} onChange={form.handleChange} className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-navy" />
          </section>
        </div>
        <form onSubmit={onSubmit} noValidate className={`${CARD} p-5`}>
          <h2 className="mb-3 font-bold text-navy">Order summary</h2>
          <FormMessage>{form.error}</FormMessage>
          <ul className="my-3 space-y-2 border-b border-line pb-3 text-sm">
            {cart.items.map(({ productId, quantity, lineTotal, available, product }) => (
              <li key={productId} className="flex justify-between gap-3 text-navy">
                <span>
                  {product.name} × {quantity}
                  {!available && <span className="block text-xs font-semibold text-red-700">Unavailable</span>}
                </span>
                <span className="tabular-nums">{formatMoney(lineTotal)}</span>
              </li>
            ))}
          </ul>
          <OrderSummary {...cart} />
          {blocked && (
            <p className="mt-3 text-xs font-semibold text-red-700">
              Some items are unavailable. <Link to="/cart" className="underline">Update your cart</Link> to continue.
            </p>
          )}
          {!addressId && !blocked && <p className="mt-3 text-xs text-muted">Add a shipping address to continue.</p>}
          <div className={`mt-4 ${blocked || !addressId ? 'pointer-events-none opacity-50' : ''}`}>
            <SubmitButton submitting={form.submitting}>{paymentMethod === 'ONLINE' ? 'Place Order and Pay' : 'Place Order'}</SubmitButton>
          </div>
        </form>
      </div>
    </StorePage>
  );
}

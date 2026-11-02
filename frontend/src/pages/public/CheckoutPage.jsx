import { Link, useNavigate } from 'react-router-dom';
import Skeleton from '../../components/admin/Skeleton.jsx';
import FormField from '../../components/FormField.jsx';
import FormMessage from '../../components/FormMessage.jsx';
import OrderSummary from '../../components/store/OrderSummary.jsx';
import StorePage, { CARD } from '../../components/store/StorePage.jsx';
import SubmitButton from '../../components/SubmitButton.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useForm } from '../../hooks/useForm.js';
import { useStore } from '../../hooks/useStore.js';
import { useToast } from '../../hooks/useToast.js';
import { apiPost } from '../../services/api.js';
import { formatMoney } from '../../utils/format.js';

const FIELDS = [
  { name: 'fullName', label: 'Full name', autoComplete: 'name' },
  { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
  { name: 'line1', label: 'Address', autoComplete: 'address-line1', wide: true },
  { name: 'line2', label: 'Apartment, suite (optional)', autoComplete: 'address-line2', wide: true },
  { name: 'city', label: 'City', autoComplete: 'address-level2' },
  { name: 'state', label: 'State or region (optional)', autoComplete: 'address-level1' },
  { name: 'postalCode', label: 'Postal code (optional)', autoComplete: 'postal-code' },
  { name: 'country', label: 'Country', autoComplete: 'country-name' },
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, refreshCart } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const form = useForm({
    fullName: `${user.firstName} ${user.lastName}`,
    phone: user.phone ?? '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    customerNote: '',
  });

  const onSubmit = form.submitWith(async ({ customerNote, ...shippingAddress }) => {
    try {
      const { data } = await apiPost('/orders', { shippingAddress, customerNote });
      await refreshCart();
      toast.success('Order placed. Thank you!');
      navigate(`/orders/${data.id}`, { replace: true });
    } catch (error) {
      // Address errors arrive as shippingAddress.city, but the form's fields are just city.
      error.errors = error.errors?.map(({ field, ...rest }) => ({ ...rest, field: field.replace('shippingAddress.', '') }));
      throw error;
    }
  });

  if (!cart) {
    return (
      <StorePage title="Checkout">
        <Skeleton className="h-64 rounded-xl" />
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

  return (
    <StorePage title="Checkout">
      <form onSubmit={onSubmit} className="grid items-start gap-5 lg:grid-cols-[1fr_340px]" noValidate>
        <div className="space-y-5">
          <section className={`${CARD} p-5`}>
            <h2 className="mb-4 font-bold text-navy">Shipping address</h2>
            <FormMessage>{form.error}</FormMessage>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              {FIELDS.map(({ wide, name, ...field }) => (
                <div key={name} className={wide ? 'sm:col-span-2' : ''}>
                  <FormField name={name} value={form.values[name]} onChange={form.handleChange} error={form.fieldErrors[name]} {...field} />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label htmlFor="customerNote" className="mb-1 block text-sm font-medium text-navy">Order note (optional)</label>
                <textarea id="customerNote" name="customerNote" rows={2} maxLength={1000} value={form.values.customerNote} onChange={form.handleChange} className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-navy" />
              </div>
            </div>
          </section>
          <section className={`${CARD} p-5`}>
            <h2 className="mb-2 font-bold text-navy">Payment</h2>
            <label className="flex items-center gap-2 text-sm font-medium text-navy">
              <input type="radio" checked readOnly className="accent-primary" /> Cash on delivery
            </label>
            <p className="mt-1 text-xs text-muted">Pay when your order arrives.</p>
          </section>
        </div>
        <aside className={`${CARD} p-5`}>
          <h2 className="mb-3 font-bold text-navy">Your order</h2>
          <ul className="mb-3 space-y-2 border-b border-line pb-3 text-sm">
            {cart.items.map(({ productId, quantity, lineTotal, product }) => (
              <li key={productId} className="flex justify-between gap-3 text-navy">
                <span>{product.name} × {quantity}</span>
                <span className="tabular-nums">{formatMoney(lineTotal)}</span>
              </li>
            ))}
          </ul>
          <OrderSummary rows={[['Subtotal', cart.subtotal], ['Shipping', cart.shipping], ['Total', cart.total]]} />
          <div className="mt-4"><SubmitButton submitting={form.submitting}>Place Order</SubmitButton></div>
        </aside>
      </form>
    </StorePage>
  );
}

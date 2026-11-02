import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import { useDropdown } from '../../hooks/useDropdown.js';

const pluralize = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

export default function NotificationMenu() {
  const { data, loading, error } = useFetch('/admin/notifications');
  const { open, toggle, close, containerRef } = useDropdown();

  const items = data
    ? [
        ...(data.pendingOrders > 0
          ? [{ key: 'orders', text: `${pluralize(data.pendingOrders, 'order')} awaiting confirmation`, to: '/admin/orders' }]
          : []),
        ...data.outOfStock.map(({ id, name }) => ({ key: id, text: `${name} is out of stock`, to: '/admin/inventory' })),
        ...data.lowStock.map(({ id, name, stockQuantity }) => ({ key: id, text: `${name}: ${stockQuantity} left`, to: '/admin/inventory' })),
      ]
    : [];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={`Notifications${items.length ? `, ${items.length} items` : ''}`}
        className="relative rounded-lg p-2 text-navy hover:bg-slate-100"
      >
        <Bell aria-hidden="true" className="size-5" />
        {items.length > 0 && (
          <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-white py-2 shadow-lg">
          <p className="px-4 pb-2 text-sm font-semibold text-navy">Notifications</p>
          {loading && <p className="px-4 py-2 text-sm text-muted">Loading...</p>}
          {error && <p className="px-4 py-2 text-sm text-red-700">{error}</p>}
          {!loading && !error && items.length === 0 && <p className="px-4 py-2 text-sm text-muted">Nothing needs attention.</p>}
          {items.map(({ key, text, to }) => (
            <Link key={key} to={to} onClick={close} className="block px-4 py-2 text-sm text-navy hover:bg-slate-50">
              {text}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

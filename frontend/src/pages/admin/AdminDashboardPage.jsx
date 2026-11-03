import { AlertTriangle, Boxes, DollarSign, FolderTree, Package, PackageX, ShoppingBag, Timer, Users } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AdminPage from '../../components/admin/AdminPage.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { formatDateTime, formatDay, formatEnum, formatMoney } from '../../utils/format.js';
import { fadeUp, stagger } from '../../utils/motion.js';

const CHART_COLOR = '#0866ff';
const AXIS_TEXT = { fontSize: 12, fill: '#56627a' };
const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const STAT_CARDS = [
  { key: 'totalRevenue', label: 'Total revenue', icon: DollarSign, format: formatMoney },
  { key: 'totalOrders', label: 'Total orders', icon: ShoppingBag, to: '/admin/orders' },
  { key: 'pendingOrders', label: 'Pending orders', icon: Timer, to: '/admin/orders' },
  { key: 'totalCustomers', label: 'Total customers', icon: Users, to: '/admin/users' },
  { key: 'totalProducts', label: 'Total products', icon: Package, to: '/admin/products' },
  { key: 'totalCategories', label: 'Total categories', icon: FolderTree, to: '/admin/categories' },
  { key: 'lowStockProducts', label: 'Low-stock products', icon: AlertTriangle, to: '/admin/inventory' },
  { key: 'outOfStockProducts', label: 'Out-of-stock products', icon: PackageX, to: '/admin/inventory' },
];

function StatCard({ label, value, icon: Icon, to }) {
  const content = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-muted">{label}</span>
        <span className="block truncate text-2xl font-bold tabular-nums text-navy">{value}</span>
      </span>
    </>
  );
  const className = 'card flex h-full items-center gap-3 p-4';
  return to ? (
    <Link to={to} className={`${className} transition duration-200 ease-standard hover:-translate-y-0.5 hover:border-primary hover:shadow-raised`}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

function ChartCard({ title, subtitle, empty, children }) {
  return (
    <section className="card p-4">
      <h2 className="font-semibold text-navy">{title}</h2>
      <p className="text-xs text-muted">{subtitle}</p>
      <div className="mt-4 h-64">
        {empty ? <p className="flex h-full items-center justify-center text-center text-sm text-muted">{empty}</p> : children}
      </div>
    </section>
  );
}

function ChartTooltip({ active, payload, label, formatLabel, formatValue }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-md">
      <p className="text-muted">{formatLabel(label)}</p>
      <p className="font-semibold tabular-nums text-navy">{formatValue(payload[0].value)}</p>
    </div>
  );
}

function RevenueChart({ data }) {
  const reducedMotion = useReducedMotion();
  const hasRevenue = data.some(({ revenue }) => revenue > 0);
  return (
    <ChartCard title="Revenue" subtitle="Paid orders, last 30 days (UTC)" empty={hasRevenue ? null : 'No paid orders in the last 30 days.'}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e3e9f4" />
          <XAxis dataKey="date" tickFormatter={formatDay} tick={AXIS_TEXT} tickLine={false} axisLine={false} minTickGap={32} />
          <YAxis tickFormatter={(value) => `৳${value.toLocaleString('en-US')}`} tick={AXIS_TEXT} tickLine={false} axisLine={false} width={64} allowDecimals={false} />
          <Tooltip cursor={{ stroke: '#56627a', strokeDasharray: '3 3' }} content={<ChartTooltip formatLabel={formatDay} formatValue={formatMoney} />} />
          <Area isAnimationActive={!reducedMotion} type="linear" dataKey="revenue" stroke={CHART_COLOR} strokeWidth={2} fill={CHART_COLOR} fillOpacity={0.1} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function OrdersChart({ data }) {
  const reducedMotion = useReducedMotion();
  const rows = [...data]
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
    .map(({ status, count }) => ({ status: formatEnum(status), count }));
  return (
    <ChartCard title="Orders by status" subtitle="All orders" empty={rows.length ? null : 'No orders yet.'}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }} barCategoryGap={8}>
          <CartesianGrid horizontal={false} stroke="#e3e9f4" />
          <XAxis type="number" allowDecimals={false} tick={AXIS_TEXT} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="status" width={84} tick={AXIS_TEXT} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: '#f4f7fc' }} content={<ChartTooltip formatLabel={(label) => label} formatValue={(value) => `${value} orders`} />} />
          <Bar dataKey="count" fill={CHART_COLOR} radius={[0, 4, 4, 0]} maxBarSize={20} isAnimationActive={!reducedMotion} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function RecentOrders({ orders }) {
  return (
    <section className="card overflow-hidden">
      <h2 className="border-b border-line p-4 font-semibold text-navy">Recent orders</h2>
      {orders.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted">No orders yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {orders.map(({ id, orderNumber, status, totalAmount, placedAt, user }) => (
            <li key={id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
              <span className="min-w-0">
                <span className="block font-medium text-navy">{orderNumber}</span>
                <span className="block text-xs text-muted">
                  {user.firstName} {user.lastName} · {formatDateTime(placedAt)}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <StatusBadge value={status} />
                <span className="font-semibold tabular-nums text-navy">{formatMoney(totalAmount)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ListCard({ title, empty, rows }) {
  return (
    <section className="card overflow-hidden">
      <h2 className="border-b border-line p-4 font-semibold text-navy">{title}</h2>
      {rows.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map(({ key, primary, secondary, value }) => (
            <li key={key} className="flex items-center justify-between gap-3 p-4 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-medium text-navy">{primary}</span>
                {secondary && <span className="block text-xs text-muted">{secondary}</span>}
              </span>
              <span className="shrink-0 tabular-nums">{value}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map(({ key }) => (
          <LoadingSkeleton key={key} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <LoadingSkeleton className="h-80 rounded-xl" />
        <LoadingSkeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, loading, error, reload } = useFetch('/admin/stats');

  return (
    <AdminPage title="Dashboard" description="Live figures from your store.">
      {error && <ErrorState message={error} onRetry={reload} />}
      {!error && loading && !data && <DashboardSkeleton />}
      {!error && data && (
        <div className="space-y-6">
          <m.div variants={stagger} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STAT_CARDS.map(({ key, label, icon, to, format }) => (
              <m.div key={key} variants={fadeUp}>
                <StatCard label={label} icon={icon} to={to} value={format ? format(data.totals[key]) : data.totals[key].toLocaleString('en-US')} />
              </m.div>
            ))}
          </m.div>
          <div className="grid gap-4 xl:grid-cols-2">
            <RevenueChart data={data.dailySales} />
            <OrdersChart data={data.ordersByStatus} />
          </div>
          <RecentOrders orders={data.recentOrders} />
          <div className="grid items-start gap-4 lg:grid-cols-3">
            <ListCard
              title="Inventory alerts"
              empty="All products are well stocked."
              rows={data.stockAlerts.map(({ id, name, stockQuantity }) => ({ key: id, primary: name, value: <StatusBadge value={stockQuantity === 0 ? 'Out' : 'Low'} />, secondary: `${stockQuantity} left` }))}
            />
            <ListCard
              title="Top products"
              empty="No sales yet."
              rows={data.topProducts.map(({ id, name, sold, revenue }) => ({ key: id, primary: name, secondary: `${sold} sold`, value: <span className="font-semibold text-navy">{formatMoney(revenue)}</span> }))}
            />
            <ListCard
              title="New customers"
              empty="No customers yet."
              rows={data.newCustomers.map(({ id, firstName, lastName, createdAt, lastLoginAt }) => ({ key: id, primary: `${firstName} ${lastName}`, secondary: `Joined ${formatDateTime(createdAt)}`, value: <span className="text-xs text-muted">{lastLoginAt ? 'Active' : 'New'}</span> }))}
            />
          </div>
        </div>
      )}
    </AdminPage>
  );
}

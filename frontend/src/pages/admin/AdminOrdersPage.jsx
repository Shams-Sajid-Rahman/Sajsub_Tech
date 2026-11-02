import { useState } from 'react';
import AdminPage, { RowAction } from '../../components/admin/AdminPage.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ErrorState from '../../components/admin/ErrorState.jsx';
import ListToolbar from '../../components/admin/ListToolbar.jsx';
import Modal from '../../components/admin/Modal.jsx';
import Skeleton from '../../components/admin/Skeleton.jsx';
import StatusAction from '../../components/admin/StatusAction.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { apiPatch } from '../../services/api.js';
import { enumOptions, formatDateTime, formatEnum, formatMoney } from '../../utils/format.js';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'];

const RESTOCKS = new Set(['CANCELLED', 'RETURNED']);

function OrderDetails({ orderId, onClose }) {
  const { data: order, loading, error, reload } = useFetch(`/admin/orders/${orderId}`);
  const address = order?.shippingAddress ?? {};

  return (
    <Modal wide title={order ? `Order ${order.orderNumber}` : 'Order'} onClose={onClose}>
      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && !order && <Skeleton className="h-40" />}
      {order && (
        <div className="space-y-5 text-sm text-navy">
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={order.status} />
            <StatusBadge value={order.paymentStatus} />
          </div>
          <p>
            {order.user.firstName} {order.user.lastName} ({order.user.email})
            <span className="block text-muted">Placed {formatDateTime(order.placedAt)}</span>
          </p>
          <p className="text-muted">Ship to: {Object.values(address).filter(Boolean).join(', ') || '-'}</p>
          <ul className="divide-y divide-line rounded-lg border border-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 p-3">
                <span>
                  {item.productName} × {item.quantity}
                  <span className="block text-xs text-muted">{item.productSku}</span>
                </span>
                <span className="tabular-nums">{formatMoney(item.lineTotal)}</span>
              </li>
            ))}
            {order.items.length === 0 && <li className="p-3 text-muted">No items.</li>}
          </ul>
          <dl className="space-y-1 tabular-nums">
            {[
              ['Subtotal', order.subtotalAmount],
              ['Discount', order.discountAmount],
              ['Shipping', order.shippingAmount],
              ['Tax', order.taxAmount],
              ['Total', order.totalAmount],
            ].map(([label, value]) => (
              <div key={label} className={`flex justify-between ${label === 'Total' ? 'font-semibold' : 'text-muted'}`}>
                <dt>{label}</dt>
                <dd>{formatMoney(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Modal>
  );
}

export default function AdminOrdersPage() {
  const list = useAdminList('/admin/orders');
  const toast = useToast();
  const [viewing, setViewing] = useState(null);
  const [change, setChange] = useState(null);

  const applyChange = async () => {
    await apiPatch(`/admin/orders/${change.order.id}/status`, { status: change.status });
    toast.success('Order updated');
    list.reload();
  };

  const columns = [
    { header: 'Order', render: (order) => <span className="whitespace-nowrap font-medium">{order.orderNumber}</span> },
    { header: 'Customer', render: (order) => order.user.email },
    { header: 'Items', align: 'right', render: (order) => order._count.items },
    { header: 'Total', align: 'right', render: (order) => formatMoney(order.totalAmount) },
    { header: 'Status', render: (order) => <StatusBadge value={order.status} /> },
    { header: 'Payment', render: (order) => <StatusBadge value={order.paymentStatus} /> },
    { header: 'Placed', render: (order) => formatDateTime(order.placedAt) },
    { header: 'View', render: (order) => <RowAction onClick={() => setViewing(order.id)}>Details</RowAction> },
    { header: 'Update', render: (order) => <StatusAction row={order} onChoose={(row, status) => setChange({ order: row, status })} /> },
  ];

  return (
    <AdminPage title="Orders" description="Track and update customer orders.">
      <ListToolbar
        list={list}
        searchPlaceholder="Search order number or email"
        filters={[
          { name: 'status', label: 'Status', options: enumOptions(ORDER_STATUSES) },
          { name: 'paymentStatus', label: 'Payment', options: enumOptions(PAYMENT_STATUSES) },
        ]}
      />
      <DataTable columns={columns} list={list} emptyMessage="No orders found." />
      {viewing && <OrderDetails orderId={viewing} onClose={() => setViewing(null)} />}
      {change && (
        <ConfirmDialog
          title={`Mark as ${formatEnum(change.status).toLowerCase()}?`}
          message={`Order ${change.order.orderNumber} will move to ${formatEnum(change.status).toLowerCase()}.${RESTOCKS.has(change.status) ? ' Its items go back into stock.' : ''}`}
          confirmLabel="Confirm"
          danger={RESTOCKS.has(change.status)}
          onConfirm={applyChange}
          onClose={() => setChange(null)}
        />
      )}
    </AdminPage>
  );
}

import { useState } from 'react';
import AdminPage, { RowAction } from '../../components/admin/AdminPage.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import ListToolbar from '../../components/admin/ListToolbar.jsx';
import Modal from '../../components/ui/Modal.jsx';
import RefundModal from '../../components/admin/RefundModal.jsx';
import ResourceForm from '../../components/admin/ResourceForm.jsx';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton.jsx';
import StatusAction from '../../components/admin/StatusAction.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { apiPatch } from '../../services/api.js';
import { enumOptions, formatDateTime, formatEnum, formatMoney } from '../../utils/format.js';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'];

// Stored addresses don't keep their field order.
const ADDRESS_ORDER = ['fullName', 'phone', 'line1', 'line2', 'city', 'state', 'postalCode', 'country'];

const SHIPPING_FIELDS = [
  { name: 'trackingNumber', label: 'Tracking number' },
  { name: 'carrier', label: 'Carrier' },
  { name: 'note', label: 'Note for the customer' },
];

function Section({ title, children }) {
  return (
    <section>
      <h3 className="mb-2 font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function OrderDetails({ orderId, onClose, onChanged }) {
  const { data: order, loading, error, reload } = useFetch(`/admin/orders/${orderId}`);
  const [refunding, setRefunding] = useState(null);
  const address = order?.shippingAddress ?? {};

  const afterRefund = () => {
    reload();
    onChanged();
  };

  return (
    <Modal size="lg" title={order ? `Order ${order.orderNumber}` : 'Order'} onClose={onClose}>
      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && !order && <LoadingSkeleton className="h-40" />}
      {order && (
        <div className="space-y-5 text-sm text-navy">
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={order.status} />
            <StatusBadge value={order.paymentStatus} />
          </div>

          <Section title="Customer">
            <p>
              {order.user.firstName} {order.user.lastName} ({order.user.email}){order.user.phone && ` · ${order.user.phone}`}
            </p>
            <p className="text-muted">
              Ship to: {ADDRESS_ORDER.map((field) => address[field]).filter(Boolean).join(', ') || '-'}
            </p>
            {order.customerNote && <p className="text-muted">Note: {order.customerNote}</p>}
            {order.trackingNumber && <p className="text-muted">Tracking: {[order.carrier, order.trackingNumber].filter(Boolean).join(' ')}</p>}
          </Section>

          <Section title="Products">
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
            <dl className="mt-3 space-y-1 tabular-nums">
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
          </Section>

          <Section title="Payments">
            {order.payments.length === 0 && <p className="text-muted">No payment attempts yet.</p>}
            <ul className="space-y-2">
              {order.payments.map((payment) => (
                <li key={payment.id} className="rounded-lg border border-line p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{formatMoney(payment.amount)}</span>
                    <span className="text-muted">{formatEnum(payment.method)}</span>
                    <StatusBadge value={payment.status} />
                    {payment.needsRefund && <StatusBadge value="Refund needed" />}
                    {payment.riskFlagged && <StatusBadge value="High risk" />}
                    {Number(payment.refundable) > 0 && (
                      <span className="ml-auto"><RowAction onClick={() => setRefunding(payment)}>Refund</RowAction></span>
                    )}
                  </div>
                  {payment.transactionRef && <p className="mt-1 break-all text-xs text-muted">Reference: {payment.transactionRef}</p>}
                  {payment.providerTransactionId && <p className="break-all text-xs text-muted">Bank reference: {payment.providerTransactionId}</p>}
                  {payment.failureReason && <p className="text-xs text-muted">{payment.failureReason}</p>}
                </li>
              ))}
            </ul>
          </Section>

          {order.refunds.length > 0 && (
            <Section title="Refunds">
              <ul className="space-y-1 text-muted">
                {order.refunds.map((refund) => (
                  <li key={refund.id}>
                    <span className="font-medium text-navy">{formatMoney(refund.amount)}</span> · {refund.reason} · {formatDateTime(refund.createdAt)}
                    {refund.createdBy && ` · ${refund.createdBy.email}`}
                    {refund.reference && ` · Ref: ${refund.reference}`}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Status history">
            <ul className="space-y-1 text-muted">
              {order.statusHistory.map((entry) => (
                <li key={entry.id}>
                  <span className="font-medium text-navy">{formatEnum(entry.status)}</span> · {formatDateTime(entry.createdAt)}
                  {entry.changedBy ? ` · ${entry.changedBy.email}` : ' · System'}
                  {entry.note && ` · ${entry.note}`}
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}
      {refunding && <RefundModal payment={refunding} onClose={() => setRefunding(null)} onDone={afterRefund} />}
    </Modal>
  );
}

export default function AdminOrdersPage() {
  const list = useAdminList('/admin/orders');
  const toast = useToast();
  const [viewing, setViewing] = useState(null);
  const [change, setChange] = useState(null);

  const applyChange = async (details = {}) => {
    await apiPatch(`/admin/orders/${change.order.id}/status`, { status: change.status, ...details });
    toast.success('Order updated');
    setChange(null);
    list.reload();
  };

  const columns = [
    { header: 'Order', render: (order) => <span className="whitespace-nowrap font-medium">{order.orderNumber}</span> },
    { header: 'Customer', render: (order) => order.user.email },
    { header: 'Items', align: 'right', render: (order) => order._count.items },
    { header: 'Total', align: 'right', render: (order) => formatMoney(order.totalAmount) },
    { header: 'Status', render: (order) => <StatusBadge value={order.status} /> },
    {
      header: 'Payment',
      render: (order) => (
        <span className="block whitespace-nowrap">
          <StatusBadge value={order.paymentStatus} />
          <span className="mt-0.5 block text-xs text-muted">{formatEnum(order.paymentMethod)}</span>
        </span>
      ),
    },
    { header: 'Placed', render: (order) => formatDateTime(order.placedAt) },
    { header: 'View', render: (order) => <RowAction onClick={() => setViewing(order.id)}>Details</RowAction> },
    { header: 'Update', render: (order) => <StatusAction row={order} onChoose={(row, status) => setChange({ order: row, status })} /> },
  ];

  const statusText = change && formatEnum(change.status).toLowerCase();

  return (
    <AdminPage title="Orders" description="Track orders, update their status and manage refunds.">
      <ListToolbar
        list={list}
        searchPlaceholder="Search order, customer name or email"
        filters={[
          { name: 'status', label: 'Status', options: enumOptions(ORDER_STATUSES) },
          { name: 'paymentStatus', label: 'Payment', options: enumOptions(PAYMENT_STATUSES) },
        ]}
      />
      <DataTable columns={columns} list={list} emptyMessage="No orders found." />
      {viewing && <OrderDetails orderId={viewing} onClose={() => setViewing(null)} onChanged={list.reload} />}
      {change?.status === 'SHIPPED' && (
        <Modal title={`Ship order ${change.order.orderNumber}`} onClose={() => setChange(null)}>
          <ResourceForm fields={SHIPPING_FIELDS} submitLabel="Mark as shipped" onSubmit={applyChange} />
        </Modal>
      )}
      {change && change.status !== 'SHIPPED' && (
        <ConfirmDialog
          title={`Mark as ${statusText}?`}
          message={`Order ${change.order.orderNumber} will move to ${statusText}.${change.status === 'CANCELLED' ? ' Its items go back into stock, and any payment collected is flagged for refund.' : ''}`}
          confirmLabel="Confirm"
          danger={change.status === 'CANCELLED'}
          onConfirm={() => applyChange()}
          onClose={() => setChange(null)}
        />
      )}
    </AdminPage>
  );
}

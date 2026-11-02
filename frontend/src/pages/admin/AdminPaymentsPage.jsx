import { useState } from 'react';
import AdminPage from '../../components/admin/AdminPage.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ListToolbar from '../../components/admin/ListToolbar.jsx';
import StatusAction from '../../components/admin/StatusAction.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';
import { useToast } from '../../hooks/useToast.js';
import { apiPatch } from '../../services/api.js';
import { enumOptions, formatDateTime, formatEnum, formatMoney } from '../../utils/format.js';

const STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'];
const METHODS = ['CASH_ON_DELIVERY', 'CARD', 'MOBILE_BANKING', 'BANK_TRANSFER'];

export default function AdminPaymentsPage() {
  const list = useAdminList('/admin/payments');
  const toast = useToast();
  const [change, setChange] = useState(null);

  const applyChange = async () => {
    await apiPatch(`/admin/payments/${change.payment.id}/status`, { status: change.status });
    toast.success('Payment updated');
    list.reload();
  };

  const columns = [
    { header: 'Order', render: (payment) => <span className="whitespace-nowrap font-medium">{payment.order.orderNumber}</span> },
    { header: 'Customer', render: (payment) => payment.order.user.email },
    { header: 'Method', render: (payment) => formatEnum(payment.method) },
    { header: 'Amount', align: 'right', render: (payment) => formatMoney(payment.amount) },
    { header: 'Status', render: (payment) => <StatusBadge value={payment.status} /> },
    { header: 'Transaction', render: (payment) => payment.providerTransactionId ?? '-' },
    { header: 'Paid', render: (payment) => formatDateTime(payment.paidAt) },
    { header: 'Update', render: (payment) => <StatusAction row={payment} onChoose={(row, status) => setChange({ payment: row, status })} /> },
  ];

  return (
    <AdminPage title="Payments" description="Record status changes. This doesn't move money through a payment provider.">
      <ListToolbar
        list={list}
        searchPlaceholder="Search order or transaction"
        filters={[
          { name: 'status', label: 'Status', options: enumOptions(STATUSES) },
          { name: 'method', label: 'Method', options: enumOptions(METHODS) },
        ]}
      />
      <DataTable columns={columns} list={list} emptyMessage="No payments found." />
      {change && (
        <ConfirmDialog
          title={`Mark as ${formatEnum(change.status).toLowerCase()}?`}
          message={`The payment of ${formatMoney(change.payment.amount)} for order ${change.payment.order.orderNumber} will be recorded as ${formatEnum(change.status).toLowerCase()}.`}
          confirmLabel="Confirm"
          danger={false}
          onConfirm={applyChange}
          onClose={() => setChange(null)}
        />
      )}
    </AdminPage>
  );
}

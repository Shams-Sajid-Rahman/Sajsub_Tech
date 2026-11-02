import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminPage, { RowAction } from '../../components/admin/AdminPage.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ListToolbar from '../../components/admin/ListToolbar.jsx';
import RefundModal from '../../components/admin/RefundModal.jsx';
import StatusAction from '../../components/admin/StatusAction.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';
import { useToast } from '../../hooks/useToast.js';
import { apiPatch, apiPost } from '../../services/api.js';
import { enumOptions, formatDateTime, formatEnum, formatMoney, yesNoOptions } from '../../utils/format.js';

const STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'];
const METHODS = ['CASH_ON_DELIVERY', 'ONLINE'];

export default function AdminPaymentsPage() {
  const [searchParams] = useSearchParams();
  // The notification menu links here with the refund filter already chosen.
  const list = useAdminList('/admin/payments', { needsRefund: searchParams.get('needsRefund') ?? '' });
  const toast = useToast();
  const [change, setChange] = useState(null);
  const [refunding, setRefunding] = useState(null);
  const [checking, setChecking] = useState(null);

  const applyChange = async () => {
    await apiPatch(`/admin/payments/${change.payment.id}/status`, { status: change.status });
    toast.success('Payment updated');
    list.reload();
  };

  const verify = async (payment) => {
    setChecking(payment.id);
    try {
      const { message } = await apiPost(`/admin/payments/${payment.id}/verify`);
      toast.success(message);
      list.reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setChecking(null);
    }
  };

  const columns = [
    { header: 'Order', render: (payment) => <span className="whitespace-nowrap font-medium">{payment.order.orderNumber}</span> },
    { header: 'Customer', render: (payment) => payment.order.user.email },
    { header: 'Method', render: (payment) => formatEnum(payment.method) },
    {
      header: 'Amount',
      align: 'right',
      render: (payment) => (
        <>
          {formatMoney(payment.amount)}
          {Number(payment.refundedAmount) > 0 && <span className="block text-xs text-muted">-{formatMoney(payment.refundedAmount)} refunded</span>}
        </>
      ),
    },
    {
      header: 'Status',
      render: (payment) => (
        <span className="flex flex-col items-start gap-1">
          <StatusBadge value={payment.status} />
          {payment.needsRefund && <StatusBadge value="Refund needed" />}
          {payment.riskFlagged && <StatusBadge value="High risk" />}
        </span>
      ),
    },
    {
      header: 'Reference',
      render: (payment) => (
        <span className="block max-w-44 break-all text-xs">
          {payment.transactionRef ?? '-'}
          {payment.providerTransactionId && <span className="block text-muted">Bank: {payment.providerTransactionId}</span>}
        </span>
      ),
    },
    { header: 'Paid', render: (payment) => formatDateTime(payment.paidAt) },
    {
      header: 'Actions',
      render: (payment) => (
        <span className="flex flex-col items-start gap-1">
          {payment.allowedStatuses.length > 0 && <StatusAction row={payment} onChoose={(row, status) => setChange({ payment: row, status })} />}
          {payment.transactionRef && ['PENDING', 'FAILED'].includes(payment.status) && (
            <RowAction disabled={checking === payment.id} onClick={() => verify(payment)}>
              {checking === payment.id ? 'Checking...' : 'Check with provider'}
            </RowAction>
          )}
          {Number(payment.refundable) > 0 && <RowAction onClick={() => setRefunding(payment)}>Refund</RowAction>}
        </span>
      ),
    },
  ];

  return (
    <AdminPage title="Payments" description="Online payments change only when the provider verifies them. Cash payments are marked here on collection.">
      <ListToolbar
        list={list}
        searchPlaceholder="Search order or reference"
        filters={[
          { name: 'status', label: 'Status', options: enumOptions(STATUSES) },
          { name: 'method', label: 'Method', options: enumOptions(METHODS) },
          { name: 'needsRefund', label: 'Refund needed', options: yesNoOptions },
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
      {refunding && <RefundModal payment={refunding} onClose={() => setRefunding(null)} onDone={list.reload} />}
    </AdminPage>
  );
}

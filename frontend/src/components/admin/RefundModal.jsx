import { useToast } from '../../hooks/useToast.js';
import { apiPost } from '../../services/api.js';
import { formatMoney } from '../../utils/format.js';
import Modal from '../ui/Modal.jsx';
import ResourceForm from './ResourceForm.jsx';

const FIELDS = [
  { name: 'amount', label: 'Amount', inputMode: 'decimal', help: 'Leave empty to refund everything that remains.' },
  { name: 'reason', label: 'Reason', type: 'textarea', required: true },
  { name: 'reference', label: 'Reference', help: 'The refund reference from the provider or your records, if any.' },
  { name: 'restock', label: 'The goods came back and can be sold again', type: 'checkbox' },
];

export default function RefundModal({ payment, onClose, onDone }) {
  const toast = useToast();

  const submit = async (payload) => {
    await apiPost(`/admin/payments/${payment.id}/refunds`, payload);
    toast.success('Refund recorded');
    onClose();
    onDone();
  };

  return (
    <Modal title="Record a refund" onClose={onClose}>
      <p className="mb-2 text-sm text-navy">Up to {formatMoney(payment.refundable)} can be refunded.</p>
      <p className="mb-4 text-xs text-muted">
        This records the refund. It doesn't move money: {payment.method === 'ONLINE' ? "issue it in your SSLCommerz merchant panel first." : 'return the cash to the customer yourself.'}
      </p>
      <ResourceForm fields={FIELDS} submitLabel="Record refund" onSubmit={submit} />
    </Modal>
  );
}

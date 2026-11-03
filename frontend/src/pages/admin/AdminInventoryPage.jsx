import { useRef, useState } from 'react';
import AdminPage, { RowAction } from '../../components/admin/AdminPage.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ListToolbar from '../../components/admin/ListToolbar.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ResourceForm from '../../components/admin/ResourceForm.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';
import { useToast } from '../../hooks/useToast.js';
import { apiPost } from '../../services/api.js';
import { enumOptions, formatDateTime, formatEnum } from '../../utils/format.js';

const STOCK_OPTIONS = [
  { value: 'in', label: 'In stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'out', label: 'Out of stock' },
];
const TRANSACTION_TYPES = ['INITIAL_STOCK', 'RESTOCK', 'SALE', 'ORDER_CANCELLED', 'CUSTOMER_RETURN', 'ADJUSTMENT'];

const ADJUST_FIELDS = [
  { name: 'type', label: 'Type', type: 'select', required: true, defaultValue: 'RESTOCK', options: enumOptions(['RESTOCK', 'ADJUSTMENT']) },
  { name: 'quantityChange', label: 'Quantity change', type: 'number', required: true, help: 'Positive adds stock. Negative removes it, for adjustments only.', parse: Number },
  { name: 'note', label: 'Reason', type: 'textarea', required: true },
];

const stockStatus = ({ stockQuantity, lowStockAlert }) => {
  if (stockQuantity === 0) return 'Out';
  if (stockQuantity <= lowStockAlert) return 'Low';
  return 'In stock';
};

export default function AdminInventoryPage() {
  const products = useAdminList('/admin/products');
  const history = useAdminList('/admin/inventory');
  const toast = useToast();
  const [adjusting, setAdjusting] = useState(null);
  const [historyFor, setHistoryFor] = useState(null);
  const historyHeading = useRef(null);

  const adjust = async (payload) => {
    await apiPost('/admin/inventory/adjust', { ...payload, productId: adjusting.id });
    toast.success('Stock updated');
    setAdjusting(null);
    products.reload();
    history.reload();
  };

  const showHistory = (product) => {
    setHistoryFor(product);
    history.setFilter('productId', product.id);
    historyHeading.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearHistoryFilter = () => {
    setHistoryFor(null);
    history.setFilter('productId', '');
  };

  const productColumns = [
    { header: 'Product', render: (product) => <span className="font-medium">{product.name}</span> },
    { header: 'SKU', render: (product) => product.sku },
    { header: 'Stock', align: 'right', render: (product) => product.stockQuantity },
    { header: 'Alert at', align: 'right', render: (product) => product.lowStockAlert },
    { header: 'Level', render: (product) => <StatusBadge value={stockStatus(product)} /> },
    {
      header: 'Actions',
      render: (product) => (
        <span className="whitespace-nowrap">
          <RowAction onClick={() => setAdjusting(product)}>Adjust</RowAction>
          <RowAction onClick={() => showHistory(product)}>History</RowAction>
        </span>
      ),
    },
  ];

  const historyColumns = [
    { header: 'Date', render: (entry) => formatDateTime(entry.createdAt) },
    { header: 'Product', render: (entry) => entry.product.name },
    { header: 'Type', render: (entry) => formatEnum(entry.type) },
    { header: 'Change', align: 'right', render: (entry) => (entry.quantityChange > 0 ? `+${entry.quantityChange}` : entry.quantityChange) },
    { header: 'Stock after', align: 'right', render: (entry) => entry.stockAfter },
    { header: 'By', render: (entry) => entry.performedBy?.email ?? 'System' },
    { header: 'Note', render: (entry) => entry.note ?? (entry.order ? `Order ${entry.order.orderNumber}` : '-') },
  ];

  return (
    <AdminPage title="Inventory" description="Every stock change is recorded in the history below.">
      <ListToolbar list={products} searchPlaceholder="Search name or SKU" filters={[{ name: 'stock', label: 'Stock', options: STOCK_OPTIONS }]} />
      <DataTable columns={productColumns} list={products} emptyMessage="No products found." />

      <div ref={historyHeading} className="mb-3 mt-8 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-navy">Stock history{historyFor && `: ${historyFor.name}`}</h2>
        {historyFor && <RowAction onClick={clearHistoryFilter}>Show all products</RowAction>}
      </div>
      <ListToolbar list={history} filters={[{ name: 'type', label: 'Type', options: enumOptions(TRANSACTION_TYPES) }]} />
      <DataTable columns={historyColumns} list={history} emptyMessage="No stock changes yet." />

      {adjusting && (
        <Modal title={`Adjust stock: ${adjusting.name}`} onClose={() => setAdjusting(null)}>
          <p className="mb-4 text-sm text-muted">Current stock: {adjusting.stockQuantity}</p>
          <ResourceForm fields={ADJUST_FIELDS} submitLabel="Update stock" onSubmit={adjust} />
        </Modal>
      )}
    </AdminPage>
  );
}

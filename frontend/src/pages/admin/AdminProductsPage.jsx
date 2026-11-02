import { useState } from 'react';
import AdminPage, { AddButton, RowAction } from '../../components/admin/AdminPage.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ListToolbar from '../../components/admin/ListToolbar.jsx';
import Modal from '../../components/admin/Modal.jsx';
import ResourceForm from '../../components/admin/ResourceForm.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { apiDelete, apiPatch, apiPost } from '../../services/api.js';
import { enumOptions, formatMoney } from '../../utils/format.js';

const STATUS_OPTIONS = enumOptions(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
const STOCK_OPTIONS = [
  { value: 'in', label: 'In stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'out', label: 'Out of stock' },
];

const lines = (text) => (text ?? '').split('\n').map((line) => line.trim()).filter(Boolean);

const toOptions = (rows) => (rows ?? []).map(({ id, name }) => ({ value: id, label: name }));

const buildFields = (categories, brands, isNew) => [
  { name: 'name', label: 'Name', required: true },
  { name: 'sku', label: 'SKU', required: true },
  { name: 'categoryId', label: 'Category', type: 'select', options: toOptions(categories), required: true },
  { name: 'brandId', label: 'Brand', type: 'select', options: toOptions(brands), required: true },
  { name: 'price', label: 'Price', inputMode: 'decimal', required: true },
  { name: 'discountPrice', label: 'Discount price', inputMode: 'decimal', nullable: true },
  ...(isNew
    ? [{ name: 'initialStock', label: 'Initial stock', type: 'number', min: 0, defaultValue: '0', parse: Number }]
    : []),
  { name: 'lowStockAlert', label: 'Low-stock alert at', type: 'number', min: 0, defaultValue: '5', parse: Number },
  { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true, defaultValue: 'DRAFT' },
  { name: 'isFeatured', label: 'Featured on the homepage', type: 'checkbox' },
  { name: 'shortDescription', label: 'Short description', type: 'textarea', nullable: true },
  { name: 'description', label: 'Description', type: 'textarea', nullable: true },
  {
    name: 'images',
    label: 'Image URLs',
    type: 'textarea',
    help: 'One per line. The first is the main image.',
    format: (images) => (images ?? []).map(({ url }) => url).join('\n'),
    parse: (text) => lines(text).map((url) => ({ url })),
    nullable: true,
  },
  {
    name: 'specifications',
    label: 'Specifications',
    type: 'textarea',
    help: 'One per line, as Name: Value',
    format: (specifications) => (specifications ?? []).map(({ name, value }) => `${name}: ${value}`).join('\n'),
    parse: (text) =>
      lines(text).map((line) => {
        const [name, ...rest] = line.split(':');
        return { name: name.trim(), value: rest.join(':').trim() };
      }),
    nullable: true,
  },
];

const stockBadge = ({ stockQuantity, lowStockAlert }) => {
  if (stockQuantity === 0) return <StatusBadge value="Out" />;
  if (stockQuantity <= lowStockAlert) return <StatusBadge value="Low" />;
  return null;
};

export default function AdminProductsPage() {
  const list = useAdminList('/admin/products');
  const categories = useFetch('/admin/categories?limit=100');
  const brands = useFetch('/admin/brands?limit=100');
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [archiving, setArchiving] = useState(null);

  const save = async (payload) => {
    if (editing.id) await apiPatch(`/admin/products/${editing.id}`, payload);
    else await apiPost('/admin/products', payload);
    toast.success(editing.id ? 'Product updated' : 'Product created');
    setEditing(null);
    list.reload();
  };

  const archive = async () => {
    await apiDelete(`/admin/products/${archiving.id}`);
    toast.success('Product archived');
    list.reload();
  };

  const columns = [
    {
      header: 'Product',
      render: (product) => (
        <span className="block min-w-48">
          <span className="block font-medium">{product.name}</span>
          <span className="block text-xs text-muted">{product.sku}</span>
        </span>
      ),
    },
    { header: 'Category', render: (product) => product.category.name },
    { header: 'Brand', render: (product) => product.brand.name },
    {
      header: 'Price',
      align: 'right',
      render: (product) => (
        <>
          {formatMoney(product.discountPrice ?? product.price)}
          {product.discountPrice && <span className="block text-xs text-muted line-through">{formatMoney(product.price)}</span>}
        </>
      ),
    },
    {
      header: 'Stock',
      align: 'right',
      render: (product) => (
        <span className="inline-flex items-center gap-2">
          {stockBadge(product)}
          {product.stockQuantity}
        </span>
      ),
    },
    { header: 'Status', render: (product) => <StatusBadge value={product.status} /> },
    {
      header: 'Actions',
      render: (product) => (
        <>
          <RowAction onClick={() => setEditing(product)}>Edit</RowAction>
          {product.status !== 'ARCHIVED' && (
            <RowAction danger onClick={() => setArchiving(product)}>
              Archive
            </RowAction>
          )}
        </>
      ),
    },
  ];

  return (
    <AdminPage
      title="Products"
      description="Your catalog. Stock changes happen on the Inventory page."
      action={<AddButton onClick={() => setEditing({})}>Add product</AddButton>}
    >
      <ListToolbar
        list={list}
        searchPlaceholder="Search name or SKU"
        filters={[
          { name: 'status', label: 'Status', options: STATUS_OPTIONS },
          { name: 'stock', label: 'Stock', options: STOCK_OPTIONS },
          { name: 'categoryId', label: 'Category', options: toOptions(categories.data) },
          { name: 'brandId', label: 'Brand', options: toOptions(brands.data) },
        ]}
      />
      <DataTable columns={columns} list={list} emptyMessage="No products found." />
      {editing && (
        <Modal wide title={editing.id ? 'Edit product' : 'Add product'} onClose={() => setEditing(null)}>
          <ResourceForm
            fields={buildFields(categories.data, brands.data, !editing.id)}
            initial={{ ...editing, categoryId: editing.category?.id, brandId: editing.brand?.id }}
            submitLabel={editing.id ? 'Save changes' : 'Create product'}
            onSubmit={save}
          />
        </Modal>
      )}
      {archiving && (
        <ConfirmDialog
          title="Archive product?"
          message={`${archiving.name} will be hidden from the store. Its order history is kept.`}
          confirmLabel="Archive"
          onConfirm={archive}
          onClose={() => setArchiving(null)}
        />
      )}
    </AdminPage>
  );
}

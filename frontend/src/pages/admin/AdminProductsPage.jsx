import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminPage, { AddButton, RowAction } from '../../components/admin/AdminPage.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ListToolbar from '../../components/admin/ListToolbar.jsx';
import Modal from '../../components/admin/Modal.jsx';
import ProductImagesModal from '../../components/admin/ProductImagesModal.jsx';
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

const mainImage = ({ images }) => images.find(({ isPrimary }) => isPrimary) ?? images[0];

const stockBadge = ({ stockQuantity, lowStockAlert }) => {
  if (stockQuantity === 0) return <StatusBadge value="Out" />;
  if (stockQuantity <= lowStockAlert) return <StatusBadge value="Low" />;
  return null;
};

export default function AdminProductsPage() {
  // Category and brand pages link here with a filter already chosen.
  const [searchParams] = useSearchParams();
  const list = useAdminList('/admin/products', {
    categoryId: searchParams.get('categoryId') ?? '',
    brandId: searchParams.get('brandId') ?? '',
  });
  const [imagesFor, setImagesFor] = useState(null);
  const categories = useFetch('/admin/categories?limit=100');
  const brands = useFetch('/admin/brands?limit=100');
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const save = async (payload) => {
    if (editing.id) await apiPatch(`/admin/products/${editing.id}`, payload);
    else await apiPost('/admin/products', payload);
    toast.success(editing.id ? 'Product updated' : 'Product created');
    setEditing(null);
    list.reload();
  };

  const remove = async () => {
    const { message } = await apiDelete(`/admin/products/${deleting.id}`);
    toast.success(message);
    list.reload();
  };

  const setPublished = async (product, published) => {
    try {
      await apiPatch(`/admin/products/${product.id}`, { status: published ? 'PUBLISHED' : 'DRAFT' });
      toast.success(published ? 'Product published' : 'Product unpublished');
      list.reload();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const columns = [
    {
      header: 'Product',
      render: (product) => (
        <span className="flex min-w-56 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-slate-50">
            {mainImage(product) ? (
              <img src={mainImage(product).url} alt="" className="size-full object-contain" />
            ) : (
              <ImageOff aria-hidden="true" className="size-4 text-muted" />
            )}
          </span>
          <span>
            <span className="block font-medium">{product.name}</span>
            <span className="block text-xs text-muted">{product.sku}</span>
          </span>
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
        <span className="whitespace-nowrap">
          <RowAction onClick={() => setEditing(product)}>Edit</RowAction>
          <RowAction onClick={() => setImagesFor(product)}>Images</RowAction>
          <RowAction onClick={() => setPublished(product, product.status !== 'PUBLISHED')}>
            {product.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
          </RowAction>
          <RowAction danger onClick={() => setDeleting(product)}>
            Delete
          </RowAction>
        </span>
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
      {imagesFor && <ProductImagesModal product={imagesFor} onClose={() => setImagesFor(null)} onChanged={list.reload} />}
      {deleting && (
        <ConfirmDialog
          title="Delete product?"
          message={`${deleting.name} will be permanently deleted if it has no stock or order history. Otherwise it will be archived and hidden from the store, so those records stay accurate.`}
          confirmLabel="Delete"
          onConfirm={remove}
          onClose={() => setDeleting(null)}
        />
      )}
    </AdminPage>
  );
}

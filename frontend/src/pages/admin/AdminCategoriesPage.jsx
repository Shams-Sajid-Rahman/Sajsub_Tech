import { useState } from 'react';
import { RowAction } from '../../components/admin/AdminPage.jsx';
import CatalogPage from '../../components/admin/CatalogPage.jsx';
import CategoryImageModal from '../../components/admin/CategoryImageModal.jsx';
import { useFetch } from '../../hooks/useFetch.js';

export default function AdminCategoriesPage() {
  const parents = useFetch('/admin/categories?limit=100');
  const [imageFor, setImageFor] = useState(null);

  const fields = (editing) => [
    { name: 'name', label: 'Name', required: true },
    ...(editing.id ? [{ name: 'slug', label: 'Slug', required: true }] : []),
    {
      name: 'parentId',
      label: 'Parent category',
      type: 'select',
      nullable: true,
      options: (parents.data ?? []).filter(({ id }) => id !== editing.id).map(({ id, name }) => ({ value: id, label: name })),
    },
    { name: 'description', label: 'Description', type: 'textarea', nullable: true },
    { name: 'sortOrder', label: 'Sort order', type: 'number', min: 0, defaultValue: '0', parse: Number },
    { name: 'showInMenu', label: 'Show in the All Categories menu', type: 'checkbox' },
    { name: 'isFeatured', label: 'Show in Shop by Category', type: 'checkbox' },
    { name: 'isActive', label: 'Active', type: 'checkbox' },
  ];

  return (
    <CatalogPage
      title="Categories"
      description="Organize products for the storefront. Select a product count to see those products."
      noun="Category"
      path="/admin/categories"
      productFilter="categoryId"
      fields={fields}
      extraColumns={[{ header: 'Parent', render: (row) => row.parent?.name ?? '-' }]}
      renderRowActions={(row) => <RowAction onClick={() => setImageFor(row)}>Image</RowAction>}
      renderExtras={(list) =>
        imageFor && <CategoryImageModal category={imageFor} onClose={() => setImageFor(null)} onChanged={list.reload} />
      }
    />
  );
}

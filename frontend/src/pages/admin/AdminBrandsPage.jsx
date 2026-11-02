import CatalogPage from '../../components/admin/CatalogPage.jsx';

const fields = (editing) => [
  { name: 'name', label: 'Name', required: true },
  ...(editing.id ? [{ name: 'slug', label: 'Slug', required: true }] : []),
  { name: 'description', label: 'Description', type: 'textarea', nullable: true },
  { name: 'logoUrl', label: 'Logo URL', nullable: true },
  { name: 'isActive', label: 'Active', type: 'checkbox' },
];

export default function AdminBrandsPage() {
  return <CatalogPage title="Brands" description="Manufacturers shown on your products." noun="Brand" path="/admin/brands" fields={fields} />;
}

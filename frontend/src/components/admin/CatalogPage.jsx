import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminList } from '../../hooks/useAdminList.js';
import { useToast } from '../../hooks/useToast.js';
import { apiDelete, apiPatch, apiPost } from '../../services/api.js';
import { yesNoOptions } from '../../utils/format.js';
import AdminPage, { AddButton, RowAction } from './AdminPage.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import DataTable from './DataTable.jsx';
import ListToolbar from './ListToolbar.jsx';
import Modal from './Modal.jsx';
import ResourceForm from './ResourceForm.jsx';
import StatusBadge from './StatusBadge.jsx';

// The shared page for categories and brands, which are managed the same way.
export default function CatalogPage({ title, description, noun, path, fields, productFilter, extraColumns = [], renderRowActions, renderExtras }) {
  const list = useAdminList(path);
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const save = async (payload) => {
    if (editing.id) await apiPatch(`${path}/${editing.id}`, payload);
    else await apiPost(path, payload);
    toast.success(editing.id ? `${noun} updated` : `${noun} created`);
    setEditing(null);
    list.reload();
  };

  const remove = async () => {
    const { message } = await apiDelete(`${path}/${deleting.id}`);
    toast.success(message);
    list.reload();
  };

  const columns = [
    { header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { header: 'Slug', render: (row) => <span className="text-muted">{row.slug}</span> },
    ...extraColumns,
    {
      header: 'Products',
      align: 'right',
      render: (row) => (
        <Link to={`/admin/products?${productFilter}=${row.id}`} className="font-semibold text-primary hover:text-primary-dark">
          {row._count.products}
        </Link>
      ),
    },
    { header: 'Status', render: (row) => <StatusBadge value={row.isActive ? 'ACTIVE' : 'ARCHIVED'} /> },
    {
      header: 'Actions',
      render: (row) => (
        <span className="whitespace-nowrap">
          <RowAction onClick={() => setEditing(row)}>Edit</RowAction>
          {renderRowActions?.(row)}
          <RowAction danger onClick={() => setDeleting(row)}>
            Delete
          </RowAction>
        </span>
      ),
    },
  ];

  return (
    <AdminPage title={title} description={description} action={<AddButton onClick={() => setEditing({ isActive: true })}>Add {noun.toLowerCase()}</AddButton>}>
      <ListToolbar list={list} searchPlaceholder="Search name" filters={[{ name: 'isActive', label: 'Active', options: yesNoOptions }]} />
      <DataTable columns={columns} list={list} emptyMessage={`No ${title.toLowerCase()} found.`} />
      {editing && (
        <Modal title={editing.id ? `Edit ${noun.toLowerCase()}` : `Add ${noun.toLowerCase()}`} onClose={() => setEditing(null)}>
          <ResourceForm fields={fields(editing)} initial={editing} submitLabel={editing.id ? 'Save changes' : `Create ${noun.toLowerCase()}`} onSubmit={save} />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title={`Delete ${noun.toLowerCase()}?`}
          message={`${deleting.name} will be permanently deleted if nothing uses it. If it has products or subcategories, it will be archived and hidden from the store instead.`}
          confirmLabel="Delete"
          onConfirm={remove}
          onClose={() => setDeleting(null)}
        />
      )}
      {renderExtras?.(list)}
    </AdminPage>
  );
}

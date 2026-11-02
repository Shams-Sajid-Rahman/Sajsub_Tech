import { useState } from 'react';
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
export default function CatalogPage({ title, description, noun, path, fields, extraColumns = [] }) {
  const list = useAdminList(path);
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [archiving, setArchiving] = useState(null);

  const save = async (payload) => {
    if (editing.id) await apiPatch(`${path}/${editing.id}`, payload);
    else await apiPost(path, payload);
    toast.success(editing.id ? `${noun} updated` : `${noun} created`);
    setEditing(null);
    list.reload();
  };

  const archive = async () => {
    await apiDelete(`${path}/${archiving.id}`);
    toast.success(`${noun} archived`);
    list.reload();
  };

  const columns = [
    { header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { header: 'Slug', render: (row) => <span className="text-muted">{row.slug}</span> },
    ...extraColumns,
    { header: 'Products', align: 'right', render: (row) => row._count.products },
    { header: 'Status', render: (row) => <StatusBadge value={row.isActive ? 'ACTIVE' : 'ARCHIVED'} /> },
    {
      header: 'Actions',
      render: (row) => (
        <>
          <RowAction onClick={() => setEditing(row)}>Edit</RowAction>
          {row.isActive && (
            <RowAction danger onClick={() => setArchiving(row)}>
              Archive
            </RowAction>
          )}
        </>
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
      {archiving && (
        <ConfirmDialog
          title={`Archive ${noun.toLowerCase()}?`}
          message={`${archiving.name} will be hidden from the store. You can reactivate it later.`}
          confirmLabel="Archive"
          onConfirm={archive}
          onClose={() => setArchiving(null)}
        />
      )}
    </AdminPage>
  );
}

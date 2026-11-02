import { useState } from 'react';
import AdminPage, { AddButton, RowAction } from '../../components/admin/AdminPage.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ListToolbar from '../../components/admin/ListToolbar.jsx';
import Modal from '../../components/admin/Modal.jsx';
import ResourceForm from '../../components/admin/ResourceForm.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';
import { useToast } from '../../hooks/useToast.js';
import { apiDelete, apiPatch, apiPost } from '../../services/api.js';
import { enumOptions, formatDateTime, formatEnum, yesNoOptions } from '../../utils/format.js';

const PLACEMENTS = enumOptions(['HERO', 'ANNOUNCEMENT', 'PROMOTION']);

const FIELDS = [
  { name: 'placement', label: 'Placement', type: 'select', options: PLACEMENTS, required: true, defaultValue: 'HERO' },
  { name: 'title', label: 'Title', required: true },
  { name: 'highlight', label: 'Highlighted text', nullable: true },
  { name: 'badgeText', label: 'Badge text', nullable: true },
  { name: 'subtitle', label: 'Subtitle', nullable: true },
  { name: 'imageUrl', label: 'Image URL', nullable: true },
  { name: 'buttonText', label: 'Button text', nullable: true },
  { name: 'linkUrl', label: 'Link', nullable: true, help: 'A path such as /shop, or a full URL.' },
  { name: 'sortOrder', label: 'Sort order', type: 'number', min: 0, defaultValue: '0', parse: Number },
  { name: 'startsAt', label: 'Starts (UTC)', type: 'datetime-local', nullable: true },
  { name: 'endsAt', label: 'Ends (UTC)', type: 'datetime-local', nullable: true },
  { name: 'isActive', label: 'Active', type: 'checkbox' },
];

export default function AdminBannersPage() {
  const list = useAdminList('/admin/banners');
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const save = async (payload) => {
    if (editing.id) await apiPatch(`/admin/banners/${editing.id}`, payload);
    else await apiPost('/admin/banners', payload);
    toast.success(editing.id ? 'Banner updated' : 'Banner created');
    setEditing(null);
    list.reload();
  };

  const remove = async () => {
    await apiDelete(`/admin/banners/${deleting.id}`);
    toast.success('Banner deleted');
    list.reload();
  };

  const columns = [
    { header: 'Title', render: (banner) => <span className="font-medium">{[banner.title, banner.highlight].filter(Boolean).join(' ')}</span> },
    { header: 'Placement', render: (banner) => formatEnum(banner.placement) },
    { header: 'Order', align: 'right', render: (banner) => banner.sortOrder },
    { header: 'Status', render: (banner) => <StatusBadge value={banner.isActive ? 'ACTIVE' : 'Inactive'} /> },
    { header: 'Ends', render: (banner) => formatDateTime(banner.endsAt) },
    {
      header: 'Actions',
      render: (banner) => (
        <>
          <RowAction onClick={() => setEditing(banner)}>Edit</RowAction>
          <RowAction danger onClick={() => setDeleting(banner)}>
            Delete
          </RowAction>
        </>
      ),
    },
  ];

  return (
    <AdminPage title="Banners" description="Hero slides, announcements and promotions." action={<AddButton onClick={() => setEditing({ isActive: true })}>Add banner</AddButton>}>
      <ListToolbar
        list={list}
        searchPlaceholder="Search title"
        filters={[
          { name: 'placement', label: 'Placement', options: PLACEMENTS },
          { name: 'isActive', label: 'Active', options: yesNoOptions },
        ]}
      />
      <DataTable columns={columns} list={list} emptyMessage="No banners found." />
      {editing && (
        <Modal wide title={editing.id ? 'Edit banner' : 'Add banner'} onClose={() => setEditing(null)}>
          <ResourceForm fields={FIELDS} initial={editing} submitLabel={editing.id ? 'Save changes' : 'Create banner'} onSubmit={save} />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete banner?"
          message={`"${deleting.title}" will be permanently deleted.`}
          confirmLabel="Delete"
          onConfirm={remove}
          onClose={() => setDeleting(null)}
        />
      )}
    </AdminPage>
  );
}

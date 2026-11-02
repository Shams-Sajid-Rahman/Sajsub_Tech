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
import { apiDelete, apiPut } from '../../services/api.js';
import { ApiRequestError } from '../../services/api.js';

const parseValue = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const showValue = (value) => (typeof value === 'string' ? value : JSON.stringify(value));

const fields = (isNew) => [
  ...(isNew ? [{ name: 'key', label: 'Key', required: true, help: 'Lowercase letters, numbers and underscores.' }] : []),
  { name: 'value', label: 'Value', type: 'textarea', required: true, format: (value) => (value === undefined ? '' : showValue(value)) },
  { name: 'description', label: 'Description', nullable: true },
  { name: 'isPublic', label: 'Visible to the public website', type: 'checkbox' },
];

export default function AdminSettingsPage() {
  const list = useAdminList('/admin/settings');
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const save = async ({ key, value, ...rest }) => {
    if (value === '') throw new ApiRequestError(400, 'Validation failed', [{ field: 'value', message: 'Required' }]);
    await apiPut(`/admin/settings/${editing.key ?? key}`, { ...rest, value: parseValue(value) });
    toast.success('Setting saved');
    setEditing(null);
    list.reload();
  };

  const remove = async () => {
    await apiDelete(`/admin/settings/${deleting.key}`);
    toast.success('Setting deleted');
    list.reload();
  };

  const columns = [
    { header: 'Key', render: (setting) => <span className="font-medium">{setting.key}</span> },
    { header: 'Value', render: (setting) => <span className="block max-w-xs truncate">{showValue(setting.value)}</span> },
    { header: 'Description', render: (setting) => setting.description ?? '-' },
    { header: 'Visibility', render: (setting) => <StatusBadge value={setting.isPublic ? 'Public' : 'Private'} /> },
    {
      header: 'Actions',
      render: (setting) => (
        <>
          <RowAction onClick={() => setEditing(setting)}>Edit</RowAction>
          <RowAction danger onClick={() => setDeleting(setting)}>
            Delete
          </RowAction>
        </>
      ),
    },
  ];

  return (
    <AdminPage title="Website settings" description="Values used across the store." action={<AddButton onClick={() => setEditing({})}>Add setting</AddButton>}>
      <ListToolbar list={list} searchPlaceholder="Search key" />
      <DataTable columns={columns} list={list} rowKey={(setting) => setting.key} emptyMessage="No settings found." />
      {editing && (
        <Modal title={editing.key ? `Edit ${editing.key}` : 'Add setting'} onClose={() => setEditing(null)}>
          <ResourceForm fields={fields(!editing.key)} initial={editing} submitLabel="Save" onSubmit={save} />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete setting?"
          message={`${deleting.key} will be permanently deleted. Features that use it may fall back to defaults.`}
          confirmLabel="Delete"
          onConfirm={remove}
          onClose={() => setDeleting(null)}
        />
      )}
    </AdminPage>
  );
}

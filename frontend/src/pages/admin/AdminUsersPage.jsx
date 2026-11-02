import { useState } from 'react';
import AdminPage, { RowAction } from '../../components/admin/AdminPage.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ListToolbar from '../../components/admin/ListToolbar.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';
import { useToast } from '../../hooks/useToast.js';
import { apiPatch } from '../../services/api.js';
import { enumOptions, formatDateTime } from '../../utils/format.js';

const FILTERS = [
  { name: 'role', label: 'Role', options: enumOptions(['ADMIN', 'CUSTOMER']) },
  { name: 'status', label: 'Status', options: enumOptions(['ACTIVE', 'SUSPENDED', 'DELETED']) },
];

export default function AdminUsersPage() {
  const list = useAdminList('/admin/users');
  const toast = useToast();
  const [target, setTarget] = useState(null);
  const suspending = target?.status === 'ACTIVE';

  const changeStatus = async () => {
    await apiPatch(`/admin/users/${target.id}/status`, { status: suspending ? 'SUSPENDED' : 'ACTIVE' });
    toast.success(suspending ? 'Customer suspended' : 'Customer reactivated');
    list.reload();
  };

  const columns = [
    { header: 'Name', render: (user) => `${user.firstName} ${user.lastName}` },
    { header: 'Email', render: (user) => user.email },
    { header: 'Role', render: (user) => <StatusBadge value={user.role} /> },
    { header: 'Status', render: (user) => <StatusBadge value={user.status} /> },
    { header: 'Orders', align: 'right', render: (user) => user._count.orders },
    { header: 'Last login', render: (user) => formatDateTime(user.lastLoginAt) },
    {
      header: 'Actions',
      render: (user) =>
        user.role === 'CUSTOMER' && user.status !== 'DELETED' ? (
          <RowAction danger={user.status === 'ACTIVE'} onClick={() => setTarget(user)}>
            {user.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
          </RowAction>
        ) : (
          <span className="text-muted">-</span>
        ),
    },
  ];

  return (
    <AdminPage title="Users" description="Customers and administrators.">
      <ListToolbar list={list} searchPlaceholder="Search name or email" filters={FILTERS} />
      <DataTable columns={columns} list={list} emptyMessage="No users found." />
      {target && (
        <ConfirmDialog
          title={suspending ? 'Suspend customer?' : 'Reactivate customer?'}
          message={
            suspending
              ? `${target.email} will be signed out immediately and won't be able to log in.`
              : `${target.email} will be able to log in again.`
          }
          confirmLabel={suspending ? 'Suspend' : 'Reactivate'}
          danger={suspending}
          onConfirm={changeStatus}
          onClose={() => setTarget(null)}
        />
      )}
    </AdminPage>
  );
}

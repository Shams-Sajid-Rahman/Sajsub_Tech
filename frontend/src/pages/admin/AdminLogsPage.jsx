import { useState } from 'react';
import AdminPage from '../../components/admin/AdminPage.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import ListToolbar from '../../components/admin/ListToolbar.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';
import { formatDateTime, formatEnum, yesNoOptions } from '../../utils/format.js';

const ENTITY_TYPES = ['User', 'Product', 'Category', 'Brand', 'InventoryTransaction', 'Order', 'Payment', 'Banner', 'SiteSetting'];

function ActivityLog() {
  const list = useAdminList('/admin/logs/activity');
  const columns = [
    { header: 'When', render: (log) => formatDateTime(log.createdAt) },
    { header: 'Admin', render: (log) => log.actor?.email ?? 'Removed account' },
    { header: 'Action', render: (log) => <span className="font-medium">{log.action}</span> },
    { header: 'Record', render: (log) => log.entityType },
    { header: 'IP address', render: (log) => log.ipAddress ?? '-' },
  ];
  return (
    <>
      <ListToolbar
        list={list}
        searchPlaceholder="Search action"
        filters={[{ name: 'entityType', label: 'Record', options: ENTITY_TYPES.map((value) => ({ value, label: value })) }]}
      />
      <DataTable columns={columns} list={list} emptyMessage="No admin activity yet." />
    </>
  );
}

function LoginLog() {
  const list = useAdminList('/admin/logs/logins');
  const columns = [
    { header: 'When', render: (log) => formatDateTime(log.createdAt) },
    { header: 'Email', render: (log) => log.email },
    { header: 'Result', render: (log) => <StatusBadge value={log.success ? 'Success' : 'Failed'} /> },
    { header: 'Reason', render: (log) => formatEnum(log.failureReason) },
    { header: 'IP address', render: (log) => log.ipAddress ?? '-' },
  ];
  return (
    <>
      <ListToolbar list={list} searchPlaceholder="Search email" filters={[{ name: 'success', label: 'Successful', options: yesNoOptions }]} />
      <DataTable columns={columns} list={list} emptyMessage="No logins recorded yet." />
    </>
  );
}

const TABS = [
  { key: 'activity', label: 'Admin activity', Component: ActivityLog },
  { key: 'logins', label: 'Logins', Component: LoginLog },
];

export default function AdminLogsPage() {
  const [active, setActive] = useState('activity');
  const { Component } = TABS.find(({ key }) => key === active);

  return (
    <AdminPage title="Activity logs" description="A record of admin changes and login attempts.">
      <div role="tablist" className="mb-4 flex gap-2 border-b border-line">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active === key}
            onClick={() => setActive(key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold ${active === key ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-navy'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <Component />
    </AdminPage>
  );
}

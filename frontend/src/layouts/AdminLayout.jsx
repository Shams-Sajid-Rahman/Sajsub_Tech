import {
  Boxes,
  ChevronDown,
  CreditCard,
  FolderTree,
  Image,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  User,
  Users,
  X,
} from 'lucide-react';
import { Suspense, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx';
import { PageSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import NotificationMenu from '../components/admin/NotificationMenu.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useDropdown } from '../hooks/useDropdown.js';
import { readStored, writeStored } from '../utils/storage.js';

const COLLAPSED_KEY = 'sajsub.adminSidebarCollapsed';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/brands', label: 'Brands', icon: Tag },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/banners', label: 'Banners', icon: Image },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/logs', label: 'Activity Logs', icon: ListChecks },
  { to: '/admin/profile', label: 'Profile', icon: User },
];

function Sidebar({ open, collapsed, onClose }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy text-white transition-[width,transform] duration-200 ease-standard lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } ${collapsed ? 'lg:w-[72px]' : ''}`}
    >
      <div className="flex h-16 items-center justify-between px-5">
        <Link to="/admin" onClick={onClose} aria-label="Sajsub Tech dashboard" className={`whitespace-nowrap rounded text-xl font-bold ${collapsed ? 'lg:hidden' : ''}`}>
          Sajsub <span className="text-accent">Tech</span>
        </Link>
        <button type="button" onClick={onClose} aria-label="Close menu" className="text-slate-300 hover:text-white lg:hidden">
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
      <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            title={collapsed ? label : undefined}
            aria-label={label}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-primary text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon aria-hidden="true" className="size-5 shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

function ProfileDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { open, toggle, close, containerRef } = useDropdown();

  const handleLogout = async () => {
    close();
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={toggle} aria-expanded={open} aria-haspopup="menu" className="flex items-center gap-2 rounded-lg p-1.5 text-sm font-medium text-navy hover:bg-slate-100">
        <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {user.firstName[0]}
          {user.lastName[0]}
        </span>
        <span className="hidden sm:inline">
          {user.firstName} {user.lastName}
        </span>
        <ChevronDown aria-hidden="true" className="size-4" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-2 w-48 rounded-xl border border-line bg-white py-1 shadow-lg">
          <Link role="menuitem" to="/admin/profile" onClick={close} className="flex items-center gap-2 px-4 py-2 text-sm text-navy hover:bg-slate-50">
            <User aria-hidden="true" className="size-4" /> Profile
          </Link>
          <button role="menuitem" type="button" onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-navy hover:bg-slate-50">
            <LogOut aria-hidden="true" className="size-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => readStored(COLLAPSED_KEY, false));

  const toggleCollapsed = () => {
    writeStored(COLLAPSED_KEY, !collapsed);
    setCollapsed(!collapsed);
  };

  return (
    <div className="min-h-screen bg-page">
      <Sidebar open={menuOpen} collapsed={collapsed} onClose={() => setMenuOpen(false)} />
      {menuOpen && <div aria-hidden="true" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 bg-navy/50 lg:hidden" />}
      <div className={`transition-[padding] duration-200 ease-standard ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white px-4 sm:px-6">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-navy hover:bg-slate-100 lg:hidden">
            <Menu aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className="hidden rounded-control p-2 text-navy transition hover:bg-page lg:block"
          >
            {collapsed ? <PanelLeftOpen aria-hidden="true" className="size-5" /> : <PanelLeftClose aria-hidden="true" className="size-5" />}
          </button>
          <div className="ml-auto flex items-center gap-2">
            <NotificationMenu />
            <ProfileDropdown />
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <ErrorBoundary resetKey={pathname}>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

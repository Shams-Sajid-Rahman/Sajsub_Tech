import { ChevronDown, Heart, Menu, ShoppingCart, User, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useDropdown } from '../../hooks/useDropdown.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useScrolled } from '../../hooks/useScrolled.js';
import { useStore } from '../../hooks/useStore.js';
import { dropdown } from '../../utils/motion.js';
import Drawer from '../ui/Drawer.jsx';
import { ALL_CATEGORIES_PATH, categoryIcon } from './categoryIcons.js';
import MegaMenu from './MegaMenu.jsx';
import SearchBar from './SearchBar.jsx';

const SHOP_LINKS = [
  { to: '/shop', label: 'All Products' },
  { to: '/shop?featured=true', label: 'Featured' },
  { to: '/shop?onSale=true', label: 'On Sale' },
  { to: '/shop?sort=price_asc', label: 'Lowest Price' },
  { to: '/shop?sort=rating', label: 'Top Rated' },
];
const PLAIN_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];
const DROPDOWN_BUTTON = 'flex items-center gap-[4px] rounded px-[12px] py-[3px] text-[12px] font-medium text-navy transition hover:text-primary-dark xl:text-[11.5px]';
const MENU_ITEM = 'block w-full px-4 py-2 text-left text-[13px] text-navy transition hover:bg-page hover:text-primary-dark';

function NavDropdown({ label, links }) {
  const { open, toggle, close, containerRef } = useDropdown();
  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={toggle} aria-expanded={open} className={DROPDOWN_BUTTON}>
        {label}
        <ChevronDown aria-hidden="true" className={`size-[13px] transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <m.div variants={dropdown} initial="hidden" animate="visible" exit="exit" className="absolute left-0 z-40 mt-1 w-52 rounded-card border border-line bg-white py-1 shadow-overlay">
            {links.map(({ to, label: text }) => (
              <Link key={to} to={to} onClick={close} className={MENU_ITEM}>
                {text}
              </Link>
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { open, toggle, close, containerRef } = useDropdown();
  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = async () => {
    close();
    // Leave first, or a protected page would redirect to the login page.
    navigate('/');
    await logout();
  };

  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={toggle} aria-expanded={open} aria-label="Account" className="flex items-center gap-[8px] rounded text-[11px] font-medium text-navy transition hover:text-primary-dark">
        <span className="flex size-[32px] items-center justify-center rounded-full border border-[#dbe4f6]">
          <User aria-hidden="true" className="size-[18px]" />
        </span>
        <span className="hidden lg:inline">{user ? user.firstName : 'Account'}</span>
        <ChevronDown aria-hidden="true" className={`hidden size-[14px] transition-transform duration-150 lg:block ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <m.div variants={dropdown} initial="hidden" animate="visible" exit="exit" className="absolute right-0 z-40 mt-2 w-44 rounded-card border border-line bg-white py-1 shadow-overlay">
            {!user && (
              <>
                <Link to="/login" onClick={close} className={MENU_ITEM}>Log in</Link>
                <Link to="/register" onClick={close} className={MENU_ITEM}>Create account</Link>
              </>
            )}
            {user && !isAdmin && (
              <>
                <Link to="/account" onClick={close} className={MENU_ITEM}>My profile</Link>
                <Link to="/orders" onClick={close} className={MENU_ITEM}>My orders</Link>
              </>
            )}
            {isAdmin && <Link to="/admin" onClick={close} className={MENU_ITEM}>Admin dashboard</Link>}
            {user && <button type="button" onClick={handleLogout} className={MENU_ITEM}>Log out</button>}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IconLink({ to, label, count, icon: Icon }) {
  return (
    <Link to={to} aria-label={`${label}${count ? `, ${count} items` : ''}`} className="flex flex-col items-center gap-[1px] rounded text-[10px] font-medium text-navy transition hover:text-primary-dark lg:w-[50px] lg:translate-y-[6px]">
      <span className="relative">
        <Icon aria-hidden="true" className="size-[22px]" />
        {/* The key restarts the small bump each time the count changes. */}
        <m.span
          key={count}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          className="absolute -right-[8px] -top-[6px] flex size-[15px] items-center justify-center rounded-full bg-sale text-[9px] font-bold text-white"
        >
          {count}
        </m.span>
      </span>
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}

function MobileMenu({ onClose }) {
  const { data } = useFetch(ALL_CATEGORIES_PATH);
  const categories = data ?? [];
  const link = 'flex items-center gap-2 rounded-control px-3 py-2.5 text-sm font-medium text-navy transition hover:bg-page';
  const childLink = 'block rounded-control py-1.5 pl-9 pr-3 text-[13px] text-muted transition hover:bg-page';
  const topLevel = categories.filter(({ parentId, showInMenu }) => !parentId && showInMenu);

  return (
    <Drawer label="Menu" onClose={onClose}>
      {(close) => (
        <nav aria-label="Mobile">
          <div className="mb-3 flex items-center justify-between">
            <img src="/images/brand/logo.png" alt="Sajsub Tech" className="h-[40px] w-auto" />
            <button type="button" onClick={close} aria-label="Close menu" className="rounded p-1 text-navy">
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <Link to="/" onClick={close} className={link}>Home</Link>
          <Link to="/shop" onClick={close} className={link}>Shop</Link>
          {PLAIN_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} onClick={close} className={link}>{label}</Link>
          ))}
          <p className="mt-3 px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-faint">Categories</p>
          {topLevel.map(({ id, slug, name, icon }) => {
            const Icon = categoryIcon(icon);
            return (
              <div key={id}>
                <Link to={`/category/${slug}`} onClick={close} className={link}>
                  <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
                  {name}
                </Link>
                {categories
                  .filter(({ parentId }) => parentId === id)
                  .map((child) => (
                    <Link key={child.id} to={`/category/${child.slug}`} onClick={close} className={childLink}>{child.name}</Link>
                  ))}
              </div>
            );
          })}
        </nav>
      )}
    </Drawer>
  );
}

export default function Header() {
  const { cart, wishlist } = useStore();
  const scrolled = useScrolled(8);
  const [menuOpen, setMenuOpen] = useState(false);
  const navClass = ({ isActive }) =>
    `rounded-full py-[3px] text-[12px] font-medium transition xl:text-[11.5px] ${isActive ? 'bg-primary px-[14px] font-semibold text-white' : 'px-[12px] text-navy hover:text-primary-dark'}`;

  return (
    <>
      <header className={`sticky top-0 z-30 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-raised' : ''}`}>
        <div className="relative mx-auto max-w-[1272px] px-4 min-[81.5rem]:px-0">
          <div className="flex items-center gap-3 py-2 lg:h-[94px] lg:items-start lg:py-0">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className="-ml-1 rounded p-1 text-navy lg:hidden">
              <Menu aria-hidden="true" className="size-6" />
            </button>
            <Link to="/" aria-label="Sajsub Tech home" className="shrink-0 rounded lg:mt-[15px]">
              <img src="/images/brand/logo.png" alt="Sajsub Tech" width="164" height="54" className="h-[40px] w-auto mix-blend-multiply lg:h-[54px]" />
            </Link>

            <div className="hidden flex-1 flex-col items-center lg:flex lg:pl-[16px] lg:pr-[246px] xl:pl-[181px] xl:pr-[358px]">
              <SearchBar className="mt-[17px] w-full max-w-[556px]" />
              <nav aria-label="Main" className="mt-[10px] flex items-center">
                <NavLink to="/" end className={navClass}>Home</NavLink>
                <NavDropdown label="Shop" links={SHOP_LINKS} />
                <MegaMenu buttonClass={DROPDOWN_BUTTON} />
                {PLAIN_LINKS.map(({ to, label }) => (
                  <NavLink key={to} to={to} className={navClass}>{label}</NavLink>
                ))}
              </nav>
            </div>

            <div className="ml-auto flex items-center gap-4 lg:absolute lg:right-4 lg:top-[20px] min-[81.5rem]:right-0 lg:-mr-[8px] lg:ml-0 lg:gap-[17px]">
              <div className="lg:-translate-y-[2px]"><AccountMenu /></div>
              <IconLink to="/wishlist" label="Wishlist" count={wishlist.length} icon={Heart} />
              <IconLink to="/cart" label="Cart" count={cart?.itemCount ?? 0} icon={ShoppingCart} />
            </div>
          </div>
        </div>
      </header>
      {/* On phones and tablets, search scrolls away so the fixed header stays small. */}
      <div className="relative z-20 bg-white px-4 pb-2 lg:hidden">
        <SearchBar />
      </div>
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </>
  );
}

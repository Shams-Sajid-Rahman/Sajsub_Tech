import { ChevronDown, Heart, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useDropdown } from '../../hooks/useDropdown.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useStore } from '../../hooks/useStore.js';

const SHOP_LINKS = [
  { to: '/shop', label: 'All Products' },
  { to: '/shop?featured=true', label: 'Featured' },
  { to: '/shop?sort=price_asc', label: 'Lowest Price' },
  { to: '/shop?sort=rating', label: 'Top Rated' },
];
const PLAIN_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

function SearchBar({ className = '' }) {
  const navigate = useNavigate();
  const [text, setText] = useState('');

  const onSubmit = (event) => {
    event.preventDefault();
    const search = text.trim();
    if (search) navigate(`/search?search=${encodeURIComponent(search)}`);
  };

  return (
    <form role="search" onSubmit={onSubmit} className={`relative ${className}`}>
      <button type="submit" aria-label="Search" className="absolute left-[12px] top-1/2 -translate-y-1/2 text-navy">
        <Search aria-hidden="true" className="size-[18px]" />
      </button>
      <input
        type="search"
        aria-label="Search for products"
        placeholder="Search for products..."
        value={text}
        onChange={({ target }) => setText(target.value)}
        className="h-[38px] w-full rounded-full border border-[#dbe4f6] bg-[#e9effb] pl-[41px] pr-4 text-[13px] text-navy outline-none placeholder:text-[#5b6780] focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </form>
  );
}

function NavDropdown({ label, links }) {
  const { open, toggle, close, containerRef } = useDropdown();
  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={toggle} aria-expanded={open} className="flex items-center gap-[6px] px-[12px] py-[3px] text-[12px] font-medium text-navy hover:text-primary">
        {label}
        <ChevronDown aria-hidden="true" className="size-[14px]" />
      </button>
      {open && (
        <div className="absolute left-0 z-40 mt-1 max-h-96 w-56 overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-lg">
          {links.map(({ to, label: text }) => (
            <Link key={to} to={to} onClick={close} className="block px-4 py-2 text-[13px] text-navy hover:bg-page hover:text-primary">
              {text}
            </Link>
          ))}
        </div>
      )}
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
    await logout();
    navigate('/');
  };
  const item = 'block w-full px-4 py-2 text-left text-[13px] text-navy hover:bg-page hover:text-primary';

  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={toggle} aria-expanded={open} aria-label="Account" className="flex items-center gap-[8px] text-[11px] font-medium text-navy hover:text-primary">
        <span className="flex size-[32px] items-center justify-center rounded-full border border-[#dbe4f6]">
          <User aria-hidden="true" className="size-[18px]" />
        </span>
        <span className="hidden lg:inline">{user ? user.firstName : 'Account'}</span>
        <ChevronDown aria-hidden="true" className="hidden size-[14px] lg:block" />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-44 rounded-xl border border-line bg-white py-1 shadow-lg">
          {!user && (
            <>
              <Link to="/login" onClick={close} className={item}>Log in</Link>
              <Link to="/register" onClick={close} className={item}>Create account</Link>
            </>
          )}
          {user && !isAdmin && (
            <>
              <Link to="/account" onClick={close} className={item}>My profile</Link>
              <Link to="/orders" onClick={close} className={item}>My orders</Link>
            </>
          )}
          {isAdmin && <Link to="/admin" onClick={close} className={item}>Admin dashboard</Link>}
          {user && <button type="button" onClick={handleLogout} className={item}>Log out</button>}
        </div>
      )}
    </div>
  );
}

function IconLink({ to, label, count, icon: Icon }) {
  return (
    <Link to={to} aria-label={`${label}${count ? `, ${count} items` : ''}`} className="flex flex-col items-center gap-[1px] text-[10px] font-medium text-navy hover:text-primary lg:w-[50px]">
      <span className="relative">
        <Icon aria-hidden="true" className="size-[22px]" />
        <span className="absolute -right-[8px] -top-[6px] flex size-[15px] items-center justify-center rounded-full bg-[#e8112d] text-[9px] font-bold text-white">
          {count}
        </span>
      </span>
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}

function MobileMenu({ categories, onClose }) {
  const link = 'block rounded-lg px-3 py-2.5 text-sm font-medium text-navy hover:bg-page';
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-navy/50" />
      <nav aria-label="Mobile" className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <img src="/images/brand/logo.png" alt="Sajsub Tech" className="h-[40px] w-auto" />
          <button type="button" onClick={onClose} aria-label="Close menu" className="p-1 text-navy">
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <Link to="/" onClick={onClose} className={link}>Home</Link>
        <Link to="/shop" onClick={onClose} className={link}>Shop</Link>
        {PLAIN_LINKS.map(({ to, label }) => (
          <Link key={to} to={to} onClick={onClose} className={link}>{label}</Link>
        ))}
        <p className="mt-3 px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">Categories</p>
        {categories.map(({ to, label }) => (
          <Link key={to} to={to} onClick={onClose} className={link}>{label}</Link>
        ))}
      </nav>
    </div>
  );
}

export default function SiteHeader() {
  const { cart, wishlist } = useStore();
  const { data } = useFetch('/categories?menu=true&limit=100');
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const categories = (data ?? []).map(({ slug, name }) => ({ to: `/category/${slug}`, label: name }));
  const navClass = ({ isActive }) =>
    `rounded-full py-[3px] text-[12px] font-medium ${isActive ? 'bg-primary px-[15px] font-semibold text-white' : 'px-[10px] text-navy hover:text-primary'}`;

  return (
    <header className="relative z-30 bg-white">
      <div className="mx-auto max-w-[1272px] px-4 xl:px-0">
        <div className="flex items-center gap-3 py-2 lg:h-[94px] lg:items-start lg:py-0">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className="-ml-1 p-1 text-navy lg:hidden">
            <Menu aria-hidden="true" className="size-6" />
          </button>
          <Link to="/" aria-label="Sajsub Tech home" className="shrink-0 lg:mt-[15px]">
            <img src="/images/brand/logo.png" alt="Sajsub Tech" width="164" height="54" className="h-[40px] w-auto mix-blend-multiply lg:h-[54px]" />
          </Link>

          <div className="hidden flex-1 flex-col items-center lg:flex lg:pl-[194px] lg:pr-[358px]">
            <SearchBar className="mt-[17px] w-full max-w-[556px]" />
            <nav aria-label="Main" className="mt-[9px] flex items-center">
              <NavLink to="/" end className={navClass}>Home</NavLink>
              <NavDropdown label="Shop" links={SHOP_LINKS} />
              <NavDropdown label="Categories" links={categories} />
              {PLAIN_LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to} className={navClass}>{label}</NavLink>
              ))}
            </nav>
          </div>

          <div className="ml-auto flex items-center gap-4 lg:absolute lg:right-[calc((100%-1272px)/2)] lg:top-[20px] lg:-mr-[8px] lg:ml-0 lg:gap-[17px]">
            <div><AccountMenu /></div>
            <IconLink to="/wishlist" label="Wishlist" count={wishlist.length} icon={Heart} />
            <IconLink to="/cart" label="Cart" count={cart?.itemCount ?? 0} icon={ShoppingCart} />
          </div>
        </div>
        <SearchBar key={pathname} className="pb-2 lg:hidden" />
      </div>
      {menuOpen && <MobileMenu categories={categories} onClose={() => setMenuOpen(false)} />}
    </header>
  );
}

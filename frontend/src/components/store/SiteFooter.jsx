import { Link } from 'react-router-dom';

const COLUMNS = [
  { title: 'Shop', links: [['/shop', 'All Products'], ['/shop?featured=true', 'Featured'], ['/cart', 'Cart'], ['/wishlist', 'Wishlist']] },
  { title: 'Company', links: [['/about', 'About'], ['/blog', 'Blog'], ['/contact', 'Contact']] },
  { title: 'Account', links: [['/account', 'My Profile'], ['/orders', 'My Orders'], ['/login', 'Log In'], ['/register', 'Register']] },
];

export default function SiteFooter() {
  return (
    <footer className="mt-10 bg-[#011339] text-slate-300">
      <div className="mx-auto grid max-w-[1272px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 xl:px-0">
        <div>
          <p className="text-xl font-bold text-white">
            Sajsub <span className="text-sky-400">Tech</span>
          </p>
          <p className="mt-2 text-sm">Smart Products. Better Tomorrow.</p>
        </div>
        {COLUMNS.map(({ title, links }) => (
          <nav key={title} aria-label={title}>
            <p className="mb-2 text-sm font-semibold text-white">{title}</p>
            {links.map(([to, label]) => (
              <Link key={to} to={to} className="block py-1 text-sm hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs">© {new Date().getFullYear()} Sajsub Tech</p>
    </footer>
  );
}

import { Link } from 'react-router-dom';

const COLUMNS = [
  { title: 'Shop', links: [['/shop', 'All Products'], ['/shop?featured=true', 'Featured'], ['/shop?onSale=true', 'On Sale'], ['/cart', 'Cart'], ['/wishlist', 'Wishlist']] },
  { title: 'Company', links: [['/about', 'About'], ['/blog', 'Blog'], ['/contact', 'Contact']] },
  { title: 'Account', links: [['/account', 'My Profile'], ['/orders', 'My Orders'], ['/login', 'Log In'], ['/register', 'Register']] },
];

export default function Footer() {
  return (
    <footer className="mt-section bg-navy text-slate-300">
      <div className="container-page grid grid-cols-2 gap-8 py-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 lg:col-span-1">
          <p className="text-xl font-bold text-white">
            Sajsub <span className="text-accent">Tech</span>
          </p>
          <p className="mt-2 text-sm font-medium tracking-wide text-accent">Code • Innovate • Grow</p>
          <p className="mt-3 max-w-xs text-sm">Smart Products. Better Tomorrow.</p>
        </div>
        {COLUMNS.map(({ title, links }) => (
          <nav key={title} aria-label={title}>
            <p className="mb-2 text-sm font-semibold text-white">{title}</p>
            {links.map(([to, label]) => (
              <Link key={to} to={to} className="block w-fit rounded py-1 text-sm transition hover:translate-x-0.5 hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs">© {new Date().getFullYear()} Sajsub Tech. All rights reserved.</p>
    </footer>
  );
}

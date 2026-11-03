import { Heart, Package, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileForms from '../../components/ProfileForms.jsx';
import StorePage from '../../components/store/StorePage.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const LINKS = [
  { to: '/orders', label: 'My orders', icon: Package },
  { to: '/wishlist', label: 'My wishlist', icon: Heart },
  { to: '/cart', label: 'My cart', icon: ShoppingCart },
];

export default function AccountPage() {
  const { user } = useAuth();
  return (
    <StorePage title="My profile" subtitle={`Welcome back, ${user.firstName}.`}>
      <ul className="mb-5 grid gap-3 sm:grid-cols-3">
        {LINKS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link to={to} className="card flex items-center gap-3 p-4 text-sm font-semibold text-navy transition duration-200 ease-standard hover:-translate-y-0.5 hover:border-primary hover:shadow-raised">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <ProfileForms />
    </StorePage>
  );
}

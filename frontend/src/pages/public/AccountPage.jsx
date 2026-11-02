import { Link } from 'react-router-dom';
import ProfileForms from '../../components/ProfileForms.jsx';
import StorePage from '../../components/store/StorePage.jsx';

export default function AccountPage() {
  return (
    <StorePage title="My profile">
      <div className="mb-5 flex gap-4 text-sm font-semibold text-primary">
        <Link to="/orders">My orders</Link>
        <Link to="/wishlist">My wishlist</Link>
      </div>
      <ProfileForms />
    </StorePage>
  );
}

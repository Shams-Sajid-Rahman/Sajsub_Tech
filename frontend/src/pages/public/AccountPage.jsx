import ProfileForms from '../../components/ProfileForms.jsx';
import AccountLayout from '../../layouts/AccountLayout.jsx';

export default function AccountPage() {
  return (
    <AccountLayout title="My account" afterLogout="/login">
      <ProfileForms />
    </AccountLayout>
  );
}

import AdminPage from '../../components/admin/AdminPage.jsx';
import ProfileForms from '../../components/ProfileForms.jsx';

export default function AdminProfilePage() {
  return (
    <AdminPage title="Profile" description="Your administrator details.">
      <div className="max-w-4xl">
        <ProfileForms />
      </div>
    </AdminPage>
  );
}

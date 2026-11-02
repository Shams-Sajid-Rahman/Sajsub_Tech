import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function AccountLayout({ title, afterLogout, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(afterLogout, { replace: true });
  };

  return (
    <main className="min-h-screen bg-page px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy">{title}</h1>
            <p className="text-sm text-muted">Signed in as {user.firstName} {user.lastName}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:border-primary hover:text-primary"
          >
            Log out
          </button>
        </header>
        {children}
      </div>
    </main>
  );
}

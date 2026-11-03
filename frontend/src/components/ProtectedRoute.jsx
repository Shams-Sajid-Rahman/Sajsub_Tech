import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

// Improves navigation only. Permissions are enforced by the backend.
export default function ProtectedRoute({ role, loginPath }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="p-8 text-center text-sm text-muted">Loading...</p>;
  }
  if (!user) return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}

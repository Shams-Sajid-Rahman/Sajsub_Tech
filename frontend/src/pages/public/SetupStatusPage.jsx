import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { apiGet } from '../../services/api.js';

const CHECKS = [
  { label: 'Backend API', path: '/health' },
  { label: 'PostgreSQL', path: '/health/db' },
];

export default function SetupStatusPage() {
  const { user } = useAuth();
  const [results, setResults] = useState({});

  useEffect(() => {
    CHECKS.forEach(({ path }) => {
      apiGet(path)
        .then(() => setResults((prev) => ({ ...prev, [path]: 'Connected' })))
        .catch(() => setResults((prev) => ({ ...prev, [path]: 'Unavailable' })));
    });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-4">
      <section className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-navy">Sajsub Tech setup status</h1>
        <ul className="mt-4 space-y-2">
          {CHECKS.map(({ label, path }) => (
            <li key={path} className="flex justify-between text-sm text-muted">
              <span>{label}</span>
              <span className="font-medium">{results[path] ?? 'Checking...'}</span>
            </li>
          ))}
        </ul>
        <nav className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-primary">
          {user ? (
            <Link to={user.role === 'ADMIN' ? '/admin' : '/account'}>My account</Link>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </section>
    </main>
  );
}

import { useEffect, useState } from 'react';
import { apiGet } from '../../services/api.js';

const CHECKS = [
  { label: 'Backend API', path: '/health' },
  { label: 'PostgreSQL', path: '/health/db' },
];

export default function SetupStatusPage() {
  const [results, setResults] = useState({});

  useEffect(() => {
    CHECKS.forEach(({ path }) => {
      apiGet(path)
        .then(() => setResults((prev) => ({ ...prev, [path]: 'Connected' })))
        .catch(() => setResults((prev) => ({ ...prev, [path]: 'Unavailable' })));
    });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="text-xl font-semibold text-slate-900">Sajsub Tech setup status</h1>
        <ul className="mt-4 space-y-2">
          {CHECKS.map(({ label, path }) => (
            <li key={path} className="flex justify-between text-sm text-slate-700">
              <span>{label}</span>
              <span className="font-medium">{results[path] ?? 'Checking...'}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

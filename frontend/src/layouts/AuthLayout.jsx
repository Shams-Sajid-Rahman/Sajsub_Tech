import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-page px-4 py-8">
      <Link to="/" className="mb-6 text-3xl font-bold leading-none text-navy">
        Sajsub <span className="text-primary">Tech</span>
      </Link>
      <section className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </section>
      {footer && <div className="mt-4 text-sm text-muted">{footer}</div>}
    </main>
  );
}

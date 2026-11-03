// The shared page frame for everything except the homepage.
export default function StorePage({ title, subtitle, narrow = false, children }) {
  return (
    <main className={`w-full py-6 ${narrow ? 'mx-auto max-w-3xl px-4' : 'container-page'}`}>
      {title && (
        <header className="mb-5">
          <h1 className="text-title font-bold text-navy">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </header>
      )}
      {children}
    </main>
  );
}

export const CARD = 'card';

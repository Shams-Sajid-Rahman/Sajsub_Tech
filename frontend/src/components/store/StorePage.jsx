// The shared page frame for everything except the homepage.
export default function StorePage({ title, subtitle, narrow = false, children }) {
  return (
    <main className={`mx-auto w-full px-4 py-6 xl:px-0 ${narrow ? 'max-w-3xl xl:px-4' : 'max-w-[1272px]'}`}>
      {title && (
        <header className="mb-5">
          <h1 className="text-2xl font-bold text-navy lg:text-[28px]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </header>
      )}
      {children}
    </main>
  );
}

export const CARD = 'rounded-xl border border-line bg-white';

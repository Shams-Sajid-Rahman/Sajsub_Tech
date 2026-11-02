import { Plus } from 'lucide-react';

export function PrimaryButton({ children, ...props }) {
  return (
    <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark" {...props}>
      {children}
    </button>
  );
}

export function AddButton({ children, ...props }) {
  return (
    <PrimaryButton {...props}>
      <Plus aria-hidden="true" className="size-4" />
      {children}
    </PrimaryButton>
  );
}

export function RowAction({ danger = false, ...props }) {
  return (
    <button
      type="button"
      className={`mr-3 whitespace-nowrap text-sm font-semibold last:mr-0 ${danger ? 'text-red-600 hover:text-red-700' : 'text-primary hover:text-primary-dark'}`}
      {...props}
    />
  );
}

export default function AdminPage({ title, description, action, children }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

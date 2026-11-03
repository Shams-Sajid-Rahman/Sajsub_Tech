import { Plus } from 'lucide-react';
import Button from '../ui/Button.jsx';

export function PrimaryButton(props) {
  return <Button {...props} />;
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
      className={`mr-3 whitespace-nowrap text-sm font-semibold last:mr-0 ${danger ? 'text-red-700 hover:text-red-700' : 'text-primary-dark hover:underline'}`}
      {...props}
    />
  );
}

export default function AdminPage({ title, description, action, children }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-title font-bold text-navy">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

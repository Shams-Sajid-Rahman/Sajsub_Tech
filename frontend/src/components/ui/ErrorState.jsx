import { CircleAlert } from 'lucide-react';
import Button from './Button.jsx';

export default function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-card border border-red-200 bg-red-50 p-6 text-center">
      <CircleAlert aria-hidden="true" className="mb-2 size-6 text-danger" />
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
          Try again
        </Button>
      )}
    </div>
  );
}

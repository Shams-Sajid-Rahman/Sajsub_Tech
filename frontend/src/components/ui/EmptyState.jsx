import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, message, action, compact = false }) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? 'p-8' : 'px-6 py-14'}`}>
      {!compact && (
        <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Icon aria-hidden="true" className="size-6" />
        </span>
      )}
      {title && <h2 className="text-subheading font-semibold text-navy">{title}</h2>}
      {message && <p className={`max-w-md text-sm text-muted ${title ? 'mt-1' : ''}`}>{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

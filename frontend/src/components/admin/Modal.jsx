import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

export default function Modal({ title, onClose, children, wide = false }) {
  const titleId = useId();
  const dialogRef = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    dialogRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/50 sm:items-center sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white shadow-xl outline-none sm:rounded-2xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-navy">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-navy">
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

import { CheckCircle2, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useMemo, useRef, useState } from 'react';

export const ToastContext = createContext(null);

const DISMISS_MS = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (type, message) => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts((current) => [...current, { id, type, message }]);
      setTimeout(() => dismiss(id), DISMISS_MS);
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({ success: (message) => show('success', message), error: (message) => show('error', message) }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
        {toasts.map(({ id, type, message }) => (
          <div key={id} role="status" className="flex items-start gap-2 rounded-lg border border-line bg-white p-3 text-sm text-navy shadow-lg">
            {type === 'success' ? (
              <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-green-600" />
            ) : (
              <XCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-red-600" />
            )}
            <span className="flex-1">{message}</span>
            <button type="button" onClick={() => dismiss(id)} aria-label="Dismiss" className="text-muted hover:text-navy">
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

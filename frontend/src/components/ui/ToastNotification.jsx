import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { DURATION, EASE } from '../../utils/motion.js';

const ICONS = {
  success: <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />,
  error: <XCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" />,
  info: <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />,
};

export default function ToastNotification({ toasts, onDismiss }) {
  return (
    <div className="fixed right-4 top-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map(({ id, type, message }) => (
          <m.div
            key={id}
            role="status"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: DURATION.base, ease: EASE }}
            className="flex items-start gap-2 rounded-card border border-line bg-white p-3 text-sm text-navy shadow-raised"
          >
            {ICONS[type]}
            <span className="flex-1">{message}</span>
            <button type="button" onClick={() => onDismiss(id)} aria-label="Dismiss" className="rounded text-muted transition hover:text-navy">
              <X aria-hidden="true" className="size-4" />
            </button>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

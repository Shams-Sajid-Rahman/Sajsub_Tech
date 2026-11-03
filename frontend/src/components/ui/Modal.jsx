import { X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDialogBehavior } from '../../hooks/useDialogBehavior.js';
import { DURATION, EASE, fade } from '../../utils/motion.js';

const SIZES = { md: 'sm:max-w-md', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' };

const panel = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
  exit: { opacity: 0, y: 12, transition: { duration: DURATION.fast, ease: EASE } },
};

export default function Modal({ title, onClose, size = 'md', children }) {
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  const [closing, setClosing] = useState(false);
  const dialogRef = useDialogBehavior(() => setClosing(true));

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  return createPortal(
    <AnimatePresence onExitComplete={() => onCloseRef.current()}>
      {!closing && (
        <m.div
          variants={fade}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-end justify-center bg-navy/50 sm:items-center sm:p-4"
        >
          <m.div
            ref={dialogRef}
            variants={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`flex max-h-[90dvh] w-full flex-col rounded-t-panel bg-white shadow-overlay outline-none sm:rounded-panel ${SIZES[size]}`}
          >
            <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 id={titleId} className="text-subheading font-semibold text-navy">
                {title}
              </h2>
              <button type="button" onClick={() => setClosing(true)} aria-label="Close" className="rounded-control p-1 text-muted transition hover:bg-page hover:text-navy">
                <X aria-hidden="true" className="size-5" />
              </button>
            </header>
            <div className="overflow-y-auto p-5">{children}</div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDialogBehavior } from '../../hooks/useDialogBehavior.js';
import { DURATION, EASE, fade } from '../../utils/motion.js';

const slide = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { duration: DURATION.base, ease: EASE } },
  exit: { x: '-100%', transition: { duration: DURATION.fast, ease: EASE } },
};

// A panel that slides in from the left. `children` is a function given `close`,
// so links inside can animate the drawer away.
export default function Drawer({ label, onClose, children }) {
  const onCloseRef = useRef(onClose);
  const [closing, setClosing] = useState(false);
  const close = () => setClosing(true);
  const dialogRef = useDialogBehavior(close);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  return createPortal(
    <AnimatePresence onExitComplete={() => onCloseRef.current()}>
      {!closing && (
        <m.div variants={fade} initial="hidden" animate="visible" exit="exit" className="fixed inset-0 z-50">
          <div aria-hidden="true" onClick={close} className="absolute inset-0 bg-navy/50" />
          <m.div
            ref={dialogRef}
            variants={slide}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-white p-4 shadow-overlay outline-none"
          >
            {children(close)}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

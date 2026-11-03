import { Check } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useRef, useState } from 'react';
import { DURATION, EASE, pressable } from '../../utils/motion.js';
import Button from './Button.jsx';

const SUCCESS_MS = 1500;

// A button for actions with a visible result. It shows a spinner while `onClick` runs,
// and a success state only if `onClick` returns true.
export default function AnimatedButton({ onClick, successLabel, icon, fullWidth = false, children, ...props }) {
  const [status, setStatus] = useState('idle');
  const timer = useRef(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  const handleClick = async (event) => {
    if (status !== 'idle') return;
    setStatus('working');
    let succeeded = false;
    try {
      succeeded = (await onClick?.(event)) === true;
    } finally {
      if (mounted.current) {
        setStatus(succeeded && successLabel ? 'done' : 'idle');
        if (succeeded && successLabel) timer.current = setTimeout(() => setStatus('idle'), SUCCESS_MS);
      }
    }
  };

  const done = status === 'done';

  return (
    <m.span {...pressable} className={fullWidth ? 'flex w-full' : 'inline-flex'}>
      <Button {...props} fullWidth={fullWidth} icon={done ? Check : icon} loading={status === 'working'} onClick={handleClick}>
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={done ? 'done' : 'idle'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: DURATION.fast, ease: EASE }}
          >
            {done ? successLabel : children}
          </m.span>
        </AnimatePresence>
      </Button>
    </m.span>
  );
}

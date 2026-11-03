import { ArrowUp } from 'lucide-react';
import { AnimatePresence, useReducedMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useState } from 'react';
import { pressable, scaleIn } from '../../utils/motion.js';

const SHOW_AFTER_PX = 240;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <m.button
          {...pressable}
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })}
          aria-label="Back to top"
          className="flex size-[41px] items-center justify-center rounded-full border border-line bg-white/90 text-navy shadow-raised hover:text-primary"
        >
          <ArrowUp aria-hidden="true" className="size-[18px]" />
        </m.button>
      )}
    </AnimatePresence>
  );
}

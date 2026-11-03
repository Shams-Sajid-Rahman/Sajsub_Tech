import { CheckCircle2, CircleAlert } from 'lucide-react';
import * as m from 'motion/react-m';
import { DURATION, EASE } from '../utils/motion.js';

const STYLES = {
  error: 'bg-red-50 text-red-700',
  success: 'bg-green-50 text-green-700',
};

export default function FormMessage({ type = 'error', children }) {
  if (!children) return null;
  const Icon = type === 'error' ? CircleAlert : CheckCircle2;
  return (
    <m.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.base, ease: EASE }}
      role={type === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-control px-3 py-2 text-sm ${STYLES[type]}`}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </m.p>
  );
}

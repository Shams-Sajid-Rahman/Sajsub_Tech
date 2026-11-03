import * as m from 'motion/react-m';
import { fadeUp } from '../../utils/motion.js';

const VIEWPORT = { once: true, amount: 0.1 };

// Fades a section in the first time it scrolls into view.
export default function Reveal({ as = 'div', className = '', children }) {
  const Element = m[as];
  return (
    <Element variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT} className={className}>
      {children}
    </Element>
  );
}

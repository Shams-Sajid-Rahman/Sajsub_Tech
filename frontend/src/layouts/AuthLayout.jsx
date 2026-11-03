import * as m from 'motion/react-m';
import { ShieldCheck, Truck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fadeUp } from '../utils/motion.js';

const POINTS = [
  [Zap, 'Live search and quick product views'],
  [ShieldCheck, 'Secure accounts and verified payments'],
  [Truck, 'Track every order from your account'],
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-page lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="hidden flex-col justify-center bg-[linear-gradient(140deg,var(--color-navy),#0b2c6e_70%,var(--color-primary-dark))] p-12 text-white lg:flex">
        <p className="text-sm font-medium tracking-wide text-accent">Code • Innovate • Grow</p>
        <p className="mt-3 text-display font-bold">Smart Products. Better Tomorrow.</p>
        <ul className="mt-8 space-y-4">
          {POINTS.map(([Icon, text]) => (
            <li key={text} className="flex items-center gap-3 text-sm text-white/90">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Icon aria-hidden="true" className="size-4 text-accent" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </aside>
      <main className="flex flex-col items-center justify-center px-4 py-8">
        <Link to="/" aria-label="Sajsub Tech home" className="mb-6 rounded">
          <img src="/images/brand/logo.png" alt="Sajsub Tech" width="164" height="54" className="h-[54px] w-auto mix-blend-multiply" />
        </Link>
        <m.section variants={fadeUp} initial="hidden" animate="visible" className="w-full max-w-md rounded-panel border border-line bg-white p-6 shadow-raised sm:p-8">
          <h1 className="text-title font-bold text-navy">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </m.section>
        {footer && <div className="mt-4 text-sm text-muted">{footer}</div>}
      </main>
    </div>
  );
}

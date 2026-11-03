import { Compass, ShieldCheck, Sparkles } from 'lucide-react';
import StorePage from '../../components/store/StorePage.jsx';
import Button from '../../components/ui/Button.jsx';
import Reveal from '../../components/ui/Reveal.jsx';

const VALUES = [
  { icon: Compass, title: 'Clear choices', text: 'Clear product information and straightforward prices, so you can decide with confidence.' },
  { icon: ShieldCheck, title: 'Secure shopping', text: 'Payments are confirmed with the payment provider, and your account is protected.' },
  { icon: Sparkles, title: 'Always improving', text: 'We keep adding useful products and making the store simpler to use.' },
];

export default function AboutPage() {
  return (
    <StorePage>
      <section className="overflow-hidden rounded-panel bg-[linear-gradient(100deg,var(--color-navy),#0b2c6e_70%,var(--color-primary-dark))] px-6 py-12 text-white sm:px-12">
        <p className="text-sm font-medium tracking-wide text-accent">Code • Innovate • Grow</p>
        <h1 className="mt-2 text-display font-bold">About Sajsub Tech</h1>
        <p className="mt-3 max-w-2xl text-white/90">
          Sajsub Tech is an online store for electronics and everyday essentials, from laptops and smartphones to audio, wearables, gaming and more.
        </p>
        <Button to="/shop" pill size="lg" className="mt-6">Shop now</Button>
      </section>
      <Reveal as="ul" className="mt-5 grid gap-3 md:grid-cols-3">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <li key={title} className="card p-6">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <h2 className="mt-3 text-subheading font-semibold text-navy">{title}</h2>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </li>
        ))}
      </Reveal>
    </StorePage>
  );
}

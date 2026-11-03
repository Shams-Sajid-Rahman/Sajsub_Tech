import { Headset, Repeat2, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../../hooks/useStore.js';
import { formatMoney } from '../../utils/format.js';

export default function ServiceStrip() {
  const { settings } = useStore().site;
  const services = [
    { icon: Truck, title: 'Free Shipping', text: settings.free_shipping_threshold ? `On orders over ${formatMoney(settings.free_shipping_threshold)}` : 'On eligible orders' },
    { icon: ShieldCheck, title: 'Secure Payment', text: '100% secure checkout' },
    { icon: Headset, title: '24/7 Support', text: 'Get help anytime' },
    { icon: Repeat2, title: 'Easy Returns', text: settings.return_policy_days ? `${settings.return_policy_days} days return policy` : 'Simple return policy' },
  ];

  return (
    <ul className="mt-[16px] grid grid-cols-2 gap-y-3 rounded-xl border border-line bg-white py-3 lg:grid-cols-4 lg:divide-x xl:grid-cols-[302fr_333fr_316fr_319fr] lg:divide-line lg:py-[13px] xl:py-[14px]">
      {services.map(({ icon: Icon, title, text }) => (
        <li key={title} className="group flex items-center justify-start gap-2 px-3 lg:justify-center lg:gap-[20px] lg:px-0 xl:justify-start xl:pl-[70px] xl:last:pl-[64px]">
          <Icon aria-hidden="true" strokeWidth={1.6} className="size-[28px] shrink-0 text-primary transition-transform duration-200 ease-standard group-hover:-translate-y-0.5 group-hover:scale-105 lg:size-[36px]" />
          <span className="min-w-0 xl:pt-[4px]">
            <span className="block text-[12px] font-semibold text-navy lg:text-[13px] xl:text-[12.5px]">{title}</span>
            <span className="block text-[10px] text-muted lg:mt-[4px] lg:text-[11px] xl:mt-0 xl:text-[10.5px]">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

import { Headset, Repeat2, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../../hooks/useStore.js';

export default function ServiceStrip() {
  const { settings } = useStore().site;
  const services = [
    { icon: Truck, title: 'Free Shipping', text: settings.free_shipping_threshold ? `On orders over $${settings.free_shipping_threshold}` : 'On eligible orders' },
    { icon: ShieldCheck, title: 'Secure Payment', text: '100% secure checkout' },
    { icon: Headset, title: '24/7 Support', text: 'Get help anytime' },
    { icon: Repeat2, title: 'Easy Returns', text: settings.return_policy_days ? `${settings.return_policy_days} days return policy` : 'Simple return policy' },
  ];

  return (
    <ul className="mt-[16px] grid grid-cols-2 gap-y-3 rounded-xl border border-[#e6ecf7] bg-white py-3 lg:grid-cols-4 lg:divide-x lg:divide-[#dfe5f0] lg:py-[13px]">
      {services.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex items-center justify-start gap-2 px-3 lg:justify-center lg:gap-[20px] lg:px-0">
          <Icon aria-hidden="true" strokeWidth={1.6} className="size-[28px] shrink-0 text-primary lg:size-[36px]" />
          <span className="min-w-0">
            <span className="block text-[12px] font-semibold text-navy lg:text-[13px]">{title}</span>
            <span className="block text-[10px] text-[#5b6780] lg:mt-[4px] lg:text-[11px]">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

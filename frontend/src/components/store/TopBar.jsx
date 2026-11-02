import { Rocket, Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from '../../hooks/useStore.js';

const ICONS = [Rocket, Tag];
const DAY = 86400000;

const toParts = (msLeft) => [
  ['d', Math.floor(msLeft / DAY)],
  ['h', Math.floor((msLeft % DAY) / 3600000)],
  ['m', Math.floor((msLeft % 3600000) / 60000)],
  ['s', Math.floor((msLeft % 60000) / 1000)],
];

function Countdown({ endsAt }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const left = new Date(endsAt).getTime() - now;
  if (!(left > 0)) return null;

  return (
    <div role="timer" aria-label="Offer ends in" className="flex gap-[4px] lg:gap-[6px]">
      {toParts(left).map(([unit, value]) => (
        <span key={unit} className="rounded-md bg-[#0d3fa6] px-[7px] py-[3px] text-[12px] font-bold leading-[20px] tabular-nums text-white lg:text-[16px]">
          {String(value).padStart(2, '0')}
          {unit}
        </span>
      ))}
    </div>
  );
}

export default function TopBar() {
  const { site } = useStore();
  const [closed, setClosed] = useState(false);
  const announcements = site.banners.filter(({ placement }) => placement === 'ANNOUNCEMENT');

  if (closed || (announcements.length === 0 && !site.settings.promo_ends_at)) return null;

  return (
    <div className="bg-[linear-gradient(90deg,#0a2456,#0a2c6b_50%,#011339)] text-white">
      <div className="relative mx-auto flex min-h-[41px] max-w-[1536px] flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-1 pr-10 lg:py-0">
        <div className="flex items-center divide-x divide-white/40 text-[11px] font-semibold lg:text-[12px]">
          {announcements.map(({ id, title }, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <span key={id} className={`flex items-center gap-1.5 px-3 lg:px-6 ${index > 0 ? 'hidden sm:flex' : ''}`}>
                <Icon aria-hidden="true" className="size-4 shrink-0 text-sky-300" />
                {title}
              </span>
            );
          })}
        </div>
        <div className="lg:absolute lg:right-[184px]">
          {site.settings.promo_ends_at && <Countdown endsAt={site.settings.promo_ends_at} />}
        </div>
        <button type="button" onClick={() => setClosed(true)} aria-label="Close announcement" className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-300 hover:text-white lg:right-[122px]">
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';

const DAY = 86400000;

const toParts = (msLeft) => [
  ['d', Math.floor(msLeft / DAY)],
  ['h', Math.floor((msLeft % DAY) / 3600000)],
  ['m', Math.floor((msLeft % 3600000) / 60000)],
  ['s', Math.floor((msLeft % 60000) / 1000)],
];

// Shows nothing once the end date has passed.
export default function Countdown({ endsAt, label = 'Offer ends in', unitClass }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const left = new Date(endsAt).getTime() - now;
  if (!(left > 0)) return null;

  return (
    <div role="timer" aria-label={label} className="flex gap-[4px] lg:gap-[6px]">
      {toParts(left).map(([unit, value]) => (
        <span key={unit} className={`rounded-md px-[7px] py-[3px] text-[12px] font-bold leading-[20px] tabular-nums ${unitClass}`}>
          {String(value).padStart(2, '0')}
          {unit}
        </span>
      ))}
    </div>
  );
}

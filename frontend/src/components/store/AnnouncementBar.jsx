import { Rocket, Tag, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import { useStore } from '../../hooks/useStore.js';
import { DURATION, EASE } from '../../utils/motion.js';
import { readStored, writeStored } from '../../utils/storage.js';
import Countdown from '../ui/Countdown.jsx';

const ICONS = [Rocket, Tag];
const ROTATE_MS = 5000;
const CLOSED_KEY = 'sajsub.announcementClosed';

// Shows as many messages as fit, and takes turns when there are more than that.
function Messages({ messages }) {
  const count = useMediaQuery('(min-width: 640px)') ? 2 : 1;
  const [first, setFirst] = useState(0);
  const [paused, setPaused] = useState(false);
  const rotates = messages.length > count;

  useEffect(() => {
    if (!rotates || paused) return undefined;
    const timer = setInterval(() => setFirst((current) => (current + count) % messages.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [rotates, paused, count, messages.length]);

  const visible = Array.from({ length: Math.min(count, messages.length) }, (_, index) => messages[(first + index) % messages.length]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={visible.map(({ id }) => id).join()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: DURATION.base, ease: EASE }}
          className="flex items-center divide-white/40 text-[11px] font-semibold sm:divide-x lg:text-[12px]"
        >
          {visible.map(({ id, title }) => {
            const Icon = ICONS[messages.findIndex((message) => message.id === id) % ICONS.length];
            return (
              <span key={id} className="flex items-center gap-1.5 px-3 lg:px-6">
                <Icon aria-hidden="true" className="size-4 shrink-0 text-accent" />
                {title}
              </span>
            );
          })}
        </m.div>
      </AnimatePresence>
    </div>
  );
}

export default function AnnouncementBar() {
  const { site } = useStore();
  const [closed, setClosed] = useState(() => readStored(CLOSED_KEY, false, 'sessionStorage'));
  const messages = site.banners.filter(({ placement }) => placement === 'ANNOUNCEMENT');
  const endsAt = site.settings.promo_ends_at;

  if (closed || (messages.length === 0 && !endsAt)) return null;

  const close = () => {
    setClosed(true);
    writeStored(CLOSED_KEY, true, 'sessionStorage');
  };

  return (
    <div className="bg-[linear-gradient(90deg,#0a2456,#0a2c6b_50%,var(--color-navy))] text-white">
      <div className="relative mx-auto flex min-h-[41px] max-w-[1536px] flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-1 pr-10 lg:py-0">
        {messages.length > 0 && <Messages messages={messages} />}
        <div className="xl:absolute xl:right-[184px]">
          {endsAt && <Countdown endsAt={endsAt} unitClass="bg-[#0d3fa6] text-white lg:text-[16px]" />}
        </div>
        <button type="button" onClick={close} aria-label="Close announcement" className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-accent transition hover:text-white touch:right-1 touch:p-2 xl:right-[122px]">
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}

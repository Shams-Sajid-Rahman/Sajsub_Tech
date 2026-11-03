import { ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { AnimatePresence, useReducedMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore.js';
import { DURATION, EASE } from '../../utils/motion.js';
import LoadingSkeleton from '../ui/LoadingSkeleton.jsx';

const SLIDE_MS = 6000;
const ARROW =
  'flex size-[32px] items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition duration-200 hover:bg-primary focus-visible:opacity-100 group-hover:opacity-100 touch:opacity-100';

export default function HeroSlider() {
  const { site, siteLoaded } = useStore();
  const slides = site.banners.filter(({ placement }) => placement === 'HERO');
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  // Stops while the visitor is looking at or using the banner, and for anyone who asks for less motion.
  useEffect(() => {
    if (count < 2 || paused || reducedMotion) return undefined;
    const timer = setInterval(() => setActive((current) => (current + 1) % count), SLIDE_MS);
    return () => clearInterval(timer);
  }, [count, paused, reducedMotion]);

  if (!siteLoaded) return <LoadingSkeleton className="h-[323px] min-w-0 flex-1 rounded-2xl" />;
  const slide = slides[active];
  if (!slide) return null;

  return (
    <section
      aria-label="Featured promotions"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="group relative min-h-[430px] min-w-0 flex-1 overflow-hidden rounded-2xl bg-[linear-gradient(100deg,#02112e_0%,#01163a_60%,#021a44_100%)] sm:min-h-[400px] lg:min-h-[323px]"
    >
      <AnimatePresence initial={false}>
        <m.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.slow, ease: EASE }}
          className="absolute inset-0"
        >
          {slide.imageUrl && (
            <img
              src={slide.imageUrl}
              alt=""
              fetchPriority="high"
              className="absolute bottom-0 right-0 h-[42%] w-auto max-w-full object-contain [mask-composite:intersect] [mask-image:linear-gradient(90deg,transparent,#000_14%),linear-gradient(180deg,transparent,#000_14%)] sm:h-[48%] lg:h-full lg:w-[46%] lg:object-cover lg:[mask-image:linear-gradient(90deg,transparent,#000_12%)] xl:w-[59%]"
            />
          )}
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.slow, ease: EASE, delay: 0.1 }}
            className="relative z-10 px-5 pt-6 sm:pl-[38px] sm:pt-[52px] lg:flex lg:h-full lg:flex-col lg:items-start lg:justify-center lg:pt-[16px]"
          >
            {slide.badgeText && (
              <span className="inline-flex h-[28px] items-center gap-[8px] rounded-full border border-[#2f6df0] bg-[#0b3fb0] px-[12px] text-[12px] font-semibold text-white xl:text-[13px]">
                <Star aria-hidden="true" className="size-[15px] fill-rating text-rating" />
                {slide.badgeText}
              </span>
            )}
            <h1 className="mt-[10px] max-w-[390px] text-[30px] font-bold leading-[1.13] text-white sm:text-[41.5px] sm:leading-[48px]">
              {slide.title}{' '}
              {slide.highlight && <span className="bg-[linear-gradient(90deg,#2fa8ff,#1f7bff)] bg-clip-text text-transparent xl:text-[45.4px]">{slide.highlight}</span>}
            </h1>
            {slide.subtitle && <p className="mt-[10px] text-[15px] text-white sm:mt-[13px] sm:text-[18px]">{slide.subtitle}</p>}
            {slide.buttonText && slide.linkUrl && (
              <Link
                to={slide.linkUrl}
                className="group/button mt-[16px] inline-flex h-[40px] items-center gap-[8px] rounded-full bg-primary px-[25px] text-[13px] font-semibold text-white transition duration-200 hover:bg-primary-dark hover:shadow-glow sm:mt-[20px] xl:px-[23px]"
              >
                {slide.buttonText}
                <ArrowRight aria-hidden="true" className="size-[16px] transition-transform duration-200 group-hover/button:translate-x-0.5" />
              </Link>
            )}
          </m.div>
        </m.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <div className="absolute bottom-[10px] right-3 z-20 flex gap-2">
            <button type="button" onClick={() => setActive((active - 1 + count) % count)} aria-label="Previous slide" className={ARROW}>
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
            <button type="button" onClick={() => setActive((active + 1) % count)} aria-label="Next slide" className={ARROW}>
              <ChevronRight aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="absolute bottom-[10px] left-5 z-20 flex items-center gap-[10px] touch:gap-[17px] sm:bottom-[14px] sm:left-[38px] xl:left-[352px]">
            {slides.map(({ id }, index) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show slide ${index + 1}`}
                aria-current={index === active}
                className={`relative h-[7px] rounded-full transition-all before:absolute before:-inset-x-[8px] before:-inset-y-[12px] before:content-[''] duration-300 ease-standard ${index === active ? 'w-[16px] bg-primary' : 'w-[7px] bg-[#9fb3d6] hover:bg-white'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

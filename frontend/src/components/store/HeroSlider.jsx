import { ArrowRight, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore.js';
import Skeleton from '../admin/Skeleton.jsx';

const SLIDE_MS = 6000;

export default function HeroSlider() {
  const { site, siteLoaded } = useStore();
  const slides = site.banners.filter(({ placement }) => placement === 'HERO');
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(() => setActive((current) => (current + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!siteLoaded) return <Skeleton className="h-[323px] min-w-0 flex-1 rounded-2xl" />;
  const slide = slides[active];
  if (!slide) return null;

  return (
    <section aria-label="Featured promotions" className="relative flex min-h-[400px] min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-[linear-gradient(100deg,#02112e_0%,#01163a_60%,#021a44_100%)] lg:min-h-[323px]">
      {slide.imageUrl && (
        <img
          src={slide.imageUrl}
          alt=""
          className="absolute bottom-0 right-0 h-[42%] w-full object-contain object-right sm:h-[48%] lg:h-full lg:w-[59%] lg:object-cover lg:[mask-image:linear-gradient(90deg,transparent,#000_12%)]"
        />
      )}
      <div className="relative z-10 px-5 pt-6 sm:pl-[38px] sm:pt-[52px]">
        {slide.badgeText && (
          <span className="inline-flex h-[28px] items-center gap-[8px] rounded-full border border-[#2f6df0] bg-[#0b3fb0] px-[12px] text-[12px] font-semibold text-white">
            <Star aria-hidden="true" className="size-[15px] fill-[#fbbf24] text-[#fbbf24]" />
            {slide.badgeText}
          </span>
        )}
        <h1 className="mt-[12px] max-w-[390px] text-[30px] font-bold leading-[1.13] text-white sm:text-[41.5px] sm:leading-[48px]">
          {slide.title}{' '}
          {slide.highlight && <span className="bg-[linear-gradient(90deg,#2fa8ff,#1f7bff)] bg-clip-text text-transparent">{slide.highlight}</span>}
        </h1>
        {slide.subtitle && <p className="mt-[10px] text-[15px] text-white sm:mt-[12px] sm:text-[18px]">{slide.subtitle}</p>}
        {slide.buttonText && slide.linkUrl && (
          <Link to={slide.linkUrl} className="mt-[16px] inline-flex h-[40px] items-center gap-[8px] rounded-full bg-primary px-[25px] text-[13px] font-semibold text-white hover:bg-primary-dark sm:mt-[19px]">
            {slide.buttonText}
            <ArrowRight aria-hidden="true" className="size-[16px]" />
          </Link>
        )}
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-[10px] left-5 z-10 flex items-center gap-[10px] sm:left-[352px] sm:bottom-[14px]">
          {slides.map(({ id }, index) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show slide ${index + 1}`}
              aria-current={index === active}
              className={`h-[7px] rounded-full transition-all ${index === active ? 'w-[16px] bg-primary' : 'w-[7px] bg-[#9fb3d6]'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

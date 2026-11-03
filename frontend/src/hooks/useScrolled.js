import { useEffect, useState } from 'react';

// True once the page has scrolled past `threshold` pixels. Only re-renders when that changes.
export const useScrolled = (threshold) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
};

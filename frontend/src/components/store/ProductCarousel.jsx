import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard.jsx';

const ARROW =
  'absolute top-[58px] z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-navy shadow-raised transition hover:border-primary hover:text-primary-dark md:flex';

// Native scrolling, so swiping and keyboard scrolling work without extra code.
export default function ProductCarousel({ products, label }) {
  const rowRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const update = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    setCanGoBack(row.scrollLeft > 1);
    setCanGoForward(row.scrollLeft + row.clientWidth < row.scrollWidth - 1);
  }, []);

  useEffect(() => {
    update();
    const observer = new ResizeObserver(update);
    observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, [update, products]);

  const move = (direction) => rowRef.current.scrollBy({ left: direction * rowRef.current.clientWidth * 0.9 });

  return (
    <div className="relative">
      {canGoBack && (
        <button type="button" onClick={() => move(-1)} aria-label={`Previous ${label}`} className={`${ARROW} -left-3`}>
          <ChevronLeft aria-hidden="true" className="size-5" />
        </button>
      )}
      <ul
        ref={rowRef}
        onScroll={update}
        aria-label={label}
        className="flex snap-x gap-[10px] overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <li key={product.id} className="flex w-[calc(50%-5px)] shrink-0 snap-start md:w-[calc(33.333%-7px)] lg:w-[calc(25%-8px)] xl:w-[calc(20%-8px)]">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
      {canGoForward && (
        <button type="button" onClick={() => move(1)} aria-label={`Next ${label}`} className={`${ARROW} -right-3`}>
          <ChevronRight aria-hidden="true" className="size-5" />
        </button>
      )}
    </div>
  );
}

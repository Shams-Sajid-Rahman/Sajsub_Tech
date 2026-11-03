import { ArrowRight, ChevronDown, ImageOff } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { Link } from 'react-router-dom';
import { useDropdown } from '../../hooks/useDropdown.js';
import { useFetch } from '../../hooks/useFetch.js';
import { formatMoney } from '../../utils/format.js';
import { dropdown } from '../../utils/motion.js';
import { ALL_CATEGORIES_PATH, categoryIcon } from './categoryIcons.js';

const FEATURED_COUNT = 4;
const PRODUCT_COUNT = 4;
const COLUMN_TITLE = 'mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint';

function Panel({ onNavigate }) {
  const { data } = useFetch(ALL_CATEGORIES_PATH);
  const categories = data ?? [];
  const featured = useFetch(`/categories?featured=true&limit=${FEATURED_COUNT}`);
  const topRated = useFetch(`/products?sort=rating&limit=${PRODUCT_COUNT}`);
  const topLevel = categories.filter(({ parentId, showInMenu }) => !parentId && showInMenu);
  const childrenOf = (id) => categories.filter(({ parentId }) => parentId === id);

  return (
    <div className="grid gap-6 p-5 lg:grid-cols-[1fr_270px_250px]">
      <div>
        <p className={COLUMN_TITLE}>All categories</p>
        <ul className="columns-2 gap-x-4">
          {topLevel.map(({ id, slug, name, icon }) => {
            const Icon = categoryIcon(icon);
            return (
              <li key={id} className="mb-3 break-inside-avoid">
                <Link to={`/category/${slug}`} onClick={onNavigate} className="flex items-center gap-2 rounded text-[13px] font-semibold text-navy transition hover:text-primary-dark">
                  <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
                  {name}
                </Link>
                {childrenOf(id).length > 0 && (
                  <ul className="ml-6 mt-1 space-y-0.5">
                    {childrenOf(id).map((child) => (
                      <li key={child.id}>
                        <Link to={`/category/${child.slug}`} onClick={onNavigate} className="block rounded text-[12px] text-muted transition hover:text-primary-dark">
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <p className={COLUMN_TITLE}>Featured</p>
        <ul className="grid grid-cols-2 gap-2">
          {(featured.data ?? []).map(({ id, slug, name, imageUrl }) => (
            <li key={id}>
              <Link to={`/category/${slug}`} onClick={onNavigate} className="group block overflow-hidden rounded-control border border-line transition hover:border-primary">
                <span className="block h-[60px] overflow-hidden bg-page">
                  {imageUrl && <img src={imageUrl} alt="" loading="lazy" className="size-full object-cover transition duration-300 ease-standard group-hover:scale-105" />}
                </span>
                <span className="block truncate px-2 py-1 text-[11px] font-medium text-navy">{name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className={COLUMN_TITLE}>Top rated products</p>
        <ul className="space-y-1">
          {(topRated.data ?? []).map((product) => (
            <li key={product.id}>
              <Link to={`/product/${product.slug}`} onClick={onNavigate} className="flex items-center gap-2 rounded-control p-1 transition hover:bg-page">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-line bg-white">
                  {product.primaryImage ? (
                    <img src={product.primaryImage.url} alt="" loading="lazy" className="max-h-full max-w-full object-contain p-0.5" />
                  ) : (
                    <ImageOff aria-hidden="true" className="size-4 text-faint" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-medium text-navy">{product.name}</span>
                  <span className="block text-[11px] font-semibold tabular-nums text-primary-dark">{formatMoney(product.effectivePrice)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/shop" onClick={onNavigate} className="mt-2 inline-flex items-center gap-1 rounded text-[12px] font-semibold text-primary-dark hover:underline">
          View all products
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

// The panel lines up with the page content rather than with the button that opens it.
export default function MegaMenu({ buttonClass }) {
  const { open, toggle, close, containerRef } = useDropdown();

  return (
    <div ref={containerRef}>
      <button type="button" onClick={toggle} aria-expanded={open} className={buttonClass}>
        Categories
        <ChevronDown aria-hidden="true" className={`size-[13px] transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <m.div
            variants={dropdown}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-x-4 top-full z-40 max-h-[75dvh] overflow-y-auto rounded-b-card border border-t-0 border-line bg-white shadow-overlay min-[81.5rem]:inset-x-0"
          >
            <Panel onNavigate={close} />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

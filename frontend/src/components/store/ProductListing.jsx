import { SearchX, SlidersHorizontal, X } from 'lucide-react';
import * as m from 'motion/react-m';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import { formatMoney } from '../../utils/format.js';
import { fadeUp, stagger } from '../../utils/motion.js';
import Button from '../ui/Button.jsx';
import Drawer from '../ui/Drawer.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import Pagination from '../ui/Pagination.jsx';
import { ALL_CATEGORIES_PATH } from './categoryIcons.js';
import ProductCard, { ProductCardSkeleton } from './ProductCard.jsx';

const PAGE_SIZE = 12;
const GRID = 'grid grid-cols-2 gap-[10px] md:grid-cols-3 xl:grid-cols-4';
const SORTS = [
  ['newest', 'Newest'],
  ['price_asc', 'Price: Low to High'],
  ['price_desc', 'Price: High to Low'],
  ['rating', 'Top Rated'],
  ['name', 'Name'],
];
const RATINGS = [
  ['4', '4 stars and up'],
  ['3', '3 stars and up'],
];
const AVAILABILITY = { true: 'In stock', false: 'Out of stock' };

function Field({ label, children }) {
  return (
    <label className="block text-xs font-semibold text-navy">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function FilterPanel({ params, setFilters, fixedCategory, categories, brands, price, setPrice }) {
  const applyPrice = (event) => {
    event.preventDefault();
    setFilters(price);
  };

  return (
    <div className="space-y-4">
      {!fixedCategory && (
        <Field label="Category">
          <select className="input-field" value={params.get('category') ?? ''} onChange={({ target }) => setFilters({ category: target.value })}>
            <option value="">All categories</option>
            {categories.map(({ slug, name }) => (
              <option key={slug} value={slug}>{name}</option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Brand">
        <select className="input-field" value={params.get('brand') ?? ''} onChange={({ target }) => setFilters({ brand: target.value })}>
          <option value="">All brands</option>
          {brands.map(({ slug, name }) => (
            <option key={slug} value={slug}>{name}</option>
          ))}
        </select>
      </Field>
      <Field label="Availability">
        <select className="input-field" value={params.get('inStock') ?? ''} onChange={({ target }) => setFilters({ inStock: target.value })}>
          <option value="">Any</option>
          <option value="true">In stock</option>
          <option value="false">Out of stock</option>
        </select>
      </Field>
      <Field label="Rating">
        <select className="input-field" value={params.get('minRating') ?? ''} onChange={({ target }) => setFilters({ minRating: target.value })}>
          <option value="">Any rating</option>
          {RATINGS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </Field>
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-navy">
        <input
          type="checkbox"
          className="size-4 accent-primary"
          checked={params.get('onSale') === 'true'}
          onChange={({ target }) => setFilters({ onSale: target.checked ? 'true' : '' })}
        />
        On sale only
      </label>
      <form onSubmit={applyPrice} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Min price">
            <input type="number" min="0" className="input-field" value={price.minPrice} onChange={({ target }) => setPrice({ ...price, minPrice: target.value })} />
          </Field>
          <Field label="Max price">
            <input type="number" min="0" className="input-field" value={price.maxPrice} onChange={({ target }) => setPrice({ ...price, maxPrice: target.value })} />
          </Field>
        </div>
        <Button type="submit" variant="outline" fullWidth>Apply price</Button>
      </form>
    </div>
  );
}

// Filters live in the URL, so results can be shared and survive the back button.
// fixedCategory locks the category on category pages.
export default function ProductListing({ fixedCategory }) {
  const [params, setParams] = useSearchParams();
  const categories = useFetch(ALL_CATEGORIES_PATH);
  const brands = useFetch('/brands?limit=100');
  const [price, setPrice] = useState({ minPrice: params.get('minPrice') ?? '', maxPrice: params.get('maxPrice') ?? '' });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const query = useMemo(() => {
    const next = new URLSearchParams(params);
    if (fixedCategory) next.set('category', fixedCategory);
    next.set('limit', PAGE_SIZE);
    return next.toString();
  }, [params, fixedCategory]);
  const { data, meta, loading, error, reload } = useFetch(`/products?${query}`);

  const setFilters = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  const nameOf = (list, slug) => (list ?? []).find((item) => item.slug === slug)?.name ?? slug;
  const chips = [
    ['category', !fixedCategory && params.get('category') && nameOf(categories.data, params.get('category'))],
    ['brand', params.get('brand') && nameOf(brands.data, params.get('brand'))],
    ['inStock', AVAILABILITY[params.get('inStock')]],
    ['minRating', params.get('minRating') && `${params.get('minRating')}+ stars`],
    ['onSale', params.get('onSale') === 'true' && 'On sale'],
    ['featured', params.get('featured') === 'true' && 'Featured'],
    ['minPrice', params.get('minPrice') && `From ${formatMoney(params.get('minPrice'))}`],
    ['maxPrice', params.get('maxPrice') && `Up to ${formatMoney(params.get('maxPrice'))}`],
  ].filter(([, label]) => label);

  const removeChip = (key) => {
    if (key in price) setPrice({ ...price, [key]: '' });
    setFilters({ [key]: '' });
  };

  const clearAll = () => {
    setPrice({ minPrice: '', maxPrice: '' });
    setFilters(Object.fromEntries(chips.map(([key]) => [key, ''])));
  };

  const panel = (
    <FilterPanel
      params={params}
      setFilters={setFilters}
      fixedCategory={fixedCategory}
      categories={categories.data ?? []}
      brands={brands.data ?? []}
      price={price}
      setPrice={setPrice}
    />
  );

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[217px_1fr]">
      <aside aria-label="Filters" className="card sticky top-[102px] hidden p-4 lg:block">{panel}</aside>

      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" icon={SlidersHorizontal} onClick={() => setDrawerOpen(true)} className="lg:hidden">
              Filters{chips.length > 0 && ` (${chips.length})`}
            </Button>
            <p className="text-sm text-muted" aria-live="polite">{meta ? `${meta.total} ${meta.total === 1 ? 'product' : 'products'}` : ''}</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-navy">
            Sort by
            <select className="input-field w-auto" value={params.get('sort') ?? 'newest'} onChange={({ target }) => setFilters({ sort: target.value })}>
              {SORTS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>

        {chips.length > 0 && (
          <ul aria-label="Active filters" className="mb-3 flex flex-wrap items-center gap-2">
            {chips.map(([key, label]) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => removeChip(key)}
                  aria-label={`Remove filter: ${label}`}
                  className="flex min-h-7 items-center gap-1 rounded-full bg-primary-soft px-3 text-xs font-semibold text-primary-dark transition hover:bg-primary hover:text-white"
                >
                  {label}
                  <X aria-hidden="true" className="size-3" />
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={clearAll} className="min-h-7 rounded px-1 text-xs font-semibold text-muted underline hover:text-navy">
                Clear all filters
              </button>
            </li>
          </ul>
        )}

        {error && <ErrorState message={error} onRetry={reload} />}
        {!error && !loading && data?.length === 0 && (
          <div className="card">
            <EmptyState
              icon={SearchX}
              title="No products found"
              message="No products match your search. Try changing the filters."
              action={chips.length > 0 && <Button variant="outline" onClick={clearAll}>Clear all filters</Button>}
            />
          </div>
        )}
        {!error && loading && !data && (
          <div className={GRID}>
            {Array.from({ length: 8 }, (_, index) => <ProductCardSkeleton key={index} />)}
          </div>
        )}
        {!error && data?.length > 0 && (
          // The key replays the entrance when the results change.
          <m.div key={query} variants={stagger} initial="hidden" animate="visible" className={GRID}>
            {data.map((product) => (
              <m.div key={product.id} variants={fadeUp} className="flex min-w-0">
                <ProductCard product={product} />
              </m.div>
            ))}
          </m.div>
        )}
        <div className="card mt-4 overflow-hidden empty:hidden">
          <Pagination meta={meta} onPageChange={(page) => setFilters({ page: String(page) })} />
        </div>
      </div>

      {drawerOpen && (
        <Drawer label="Filters" onClose={() => setDrawerOpen(false)}>
          {(close) => (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-subheading font-semibold text-navy">Filters</h2>
                <button type="button" onClick={close} aria-label="Close filters" className="rounded p-1 text-navy">
                  <X aria-hidden="true" className="size-5" />
                </button>
              </div>
              {panel}
              <Button fullWidth className="mt-4" onClick={close}>
                Show {meta?.total ?? ''} {meta?.total === 1 ? 'product' : 'products'}
              </Button>
              {chips.length > 0 && (
                <Button variant="ghost" fullWidth className="mt-2" onClick={clearAll}>Clear all filters</Button>
              )}
            </>
          )}
        </Drawer>
      )}
    </div>
  );
}

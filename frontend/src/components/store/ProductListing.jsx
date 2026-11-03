import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import ErrorState from '../ui/ErrorState.jsx';
import Pagination from '../ui/Pagination.jsx';
import ProductCard, { ProductCardSkeleton } from './ProductCard.jsx';

const PAGE_SIZE = 12;
const CONTROL = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/30';
const SORTS = [
  ['newest', 'Newest'],
  ['price_asc', 'Price: Low to High'],
  ['price_desc', 'Price: High to Low'],
  ['rating', 'Top Rated'],
  ['name', 'Name'],
];

function Field({ label, children }) {
  return (
    <label className="block text-xs font-semibold text-navy">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

// Filters live in the URL, so results can be shared and survive the back button.
// fixedCategory locks the category on category pages.
export default function ProductListing({ fixedCategory }) {
  const [params, setParams] = useSearchParams();
  const categories = useFetch('/categories?limit=100');
  const brands = useFetch('/brands?limit=100');
  const [price, setPrice] = useState({ minPrice: params.get('minPrice') ?? '', maxPrice: params.get('maxPrice') ?? '' });

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

  const applyPrice = (event) => {
    event.preventDefault();
    setFilters(price);
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[217px_1fr]">
      <aside aria-label="Filters" className="space-y-4 rounded-xl border border-line bg-white p-4">
        {!fixedCategory && (
          <Field label="Category">
            <select className={CONTROL} value={params.get('category') ?? ''} onChange={({ target }) => setFilters({ category: target.value })}>
              <option value="">All categories</option>
              {(categories.data ?? []).map(({ slug, name }) => (
                <option key={slug} value={slug}>{name}</option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Brand">
          <select className={CONTROL} value={params.get('brand') ?? ''} onChange={({ target }) => setFilters({ brand: target.value })}>
            <option value="">All brands</option>
            {(brands.data ?? []).map(({ slug, name }) => (
              <option key={slug} value={slug}>{name}</option>
            ))}
          </select>
        </Field>
        <Field label="Availability">
          <select className={CONTROL} value={params.get('inStock') ?? ''} onChange={({ target }) => setFilters({ inStock: target.value })}>
            <option value="">Any</option>
            <option value="true">In stock</option>
            <option value="false">Out of stock</option>
          </select>
        </Field>
        <form onSubmit={applyPrice} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Min price">
              <input type="number" min="0" className={CONTROL} value={price.minPrice} onChange={({ target }) => setPrice({ ...price, minPrice: target.value })} />
            </Field>
            <Field label="Max price">
              <input type="number" min="0" className={CONTROL} value={price.maxPrice} onChange={({ target }) => setPrice({ ...price, maxPrice: target.value })} />
            </Field>
          </div>
          <button type="submit" className="w-full rounded-lg border border-primary py-2 text-sm font-semibold text-primary hover:bg-page">
            Apply price
          </button>
        </form>
      </aside>

      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">{meta ? `${meta.total} ${meta.total === 1 ? 'product' : 'products'}` : ''}</p>
          <label className="flex items-center gap-2 text-sm text-navy">
            Sort by
            <select className={`${CONTROL} w-auto`} value={params.get('sort') ?? 'newest'} onChange={({ target }) => setFilters({ sort: target.value })}>
              {SORTS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>

        {error && <ErrorState message={error} onRetry={reload} />}
        {!error && !loading && data?.length === 0 && (
          <p className="rounded-xl border border-line bg-white p-10 text-center text-sm text-muted">No products match your search. Try changing the filters.</p>
        )}
        {!error && (
          <div className="grid grid-cols-2 gap-[10px] md:grid-cols-3 xl:grid-cols-4">
            {loading && !data && Array.from({ length: 8 }, (_, index) => <ProductCardSkeleton key={index} />)}
            {(data ?? []).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="mt-4 overflow-hidden rounded-xl">
          <Pagination meta={meta} onPageChange={(page) => setFilters({ page: String(page) })} />
        </div>
      </div>
    </div>
  );
}

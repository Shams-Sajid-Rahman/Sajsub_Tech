import { Mail, Star } from 'lucide-react';
import { useInView } from 'motion/react';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { useStore } from '../../hooks/useStore.js';
import { apiPost } from '../../services/api.js';
import { RECENTLY_VIEWED_KEY, readStored } from '../../utils/storage.js';
import Button from '../ui/Button.jsx';
import Countdown from '../ui/Countdown.jsx';
import Reveal from '../ui/Reveal.jsx';
import ProductCarousel from './ProductCarousel.jsx';
import SectionHeading from './SectionHeading.jsx';
import StarRating from './StarRating.jsx';

// A row only appears when it has this many products not already shown, so the page never repeats itself.
const MIN_NEW_PRODUCTS = 4;
const MAX_PER_ROW = 8;
const MIN_RECENT = 2;
const MIN_BRANDS = 4;
const MIN_REVIEWS = 3;
const LIST_SIZE = 12;

function ProductRow({ title, linkTo, linkLabel = 'View All', products, extra }) {
  return (
    <Reveal as="section" className="mt-section xl:pl-[3px]">
      <SectionHeading title={title} linkTo={linkTo} linkLabel={linkLabel} extra={extra} />
      <ProductCarousel products={products} label={title} />
    </Reveal>
  );
}

function PromotionGrid({ banners }) {
  const withImages = banners.filter(({ imageUrl }) => imageUrl);
  if (withImages.length === 0) return null;
  return (
    <Reveal as="section" className="mt-section grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:pl-[3px]" aria-label="Promotions">
      {withImages.slice(0, 3).map(({ id, title, highlight, subtitle, imageUrl, linkUrl }) => (
        <Link key={id} to={linkUrl ?? '/shop'} className="group relative block h-44 overflow-hidden rounded-panel bg-navy">
          <img src={imageUrl} alt="" loading="lazy" className="size-full object-cover opacity-80 transition-transform duration-300 ease-standard group-hover:scale-105" />
          <span className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(0deg,rgb(7_26_61/0.85),transparent)] p-4 text-white">
            <span className="text-subheading font-bold">
              {title} {highlight && <span className="text-accent">{highlight}</span>}
            </span>
            {subtitle && <span className="text-sm">{subtitle}</span>}
          </span>
        </Link>
      ))}
    </Reveal>
  );
}

function Brands() {
  const { data } = useFetch('/brands?limit=12');
  const brands = (data ?? []).filter(({ logoUrl }) => logoUrl);
  if (brands.length < MIN_BRANDS) return null;
  return (
    <Reveal as="section" className="mt-section xl:pl-[3px]">
      <SectionHeading title="Featured Brands" linkTo="/shop" linkLabel="View All Products" />
      <ul className="grid grid-cols-2 gap-[10px] sm:grid-cols-3 lg:grid-cols-6">
        {brands.slice(0, 6).map(({ id, slug, name, logoUrl }) => (
          <li key={id}>
            <Link to={`/shop?brand=${slug}`} aria-label={name} className="card flex h-20 items-center justify-center p-4 transition duration-200 ease-standard hover:-translate-y-0.5 hover:border-primary hover:shadow-raised">
              <img src={logoUrl} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
            </Link>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

function RecentlyViewed() {
  const [slugs] = useState(() => readStored(RECENTLY_VIEWED_KEY, []));
  const { data } = useFetch(slugs.length >= MIN_RECENT ? `/products?slugs=${slugs.join(',')}&limit=${slugs.length}` : null);
  const products = useMemo(() => {
    const bySlug = new Map((data ?? []).map((product) => [product.slug, product]));
    return slugs.map((slug) => bySlug.get(slug)).filter(Boolean);
  }, [data, slugs]);
  if (products.length < MIN_RECENT) return null;
  return <ProductRow title="Recently Viewed" products={products} />;
}

function Reviews() {
  const { data } = useFetch('/reviews?limit=6');
  if (!data || data.length < MIN_REVIEWS) return null;
  return (
    <Reveal as="section" className="mt-section xl:pl-[3px]">
      <SectionHeading title="What Customers Say" />
      <ul className="grid gap-[10px] md:grid-cols-2 lg:grid-cols-3">
        {data.slice(0, 3).map(({ id, rating, comment, author, product }) => (
          <li key={id} className="card flex flex-col p-5">
            <StarRating value={rating} size={14} />
            <blockquote className="mt-3 line-clamp-4 flex-1 text-sm text-navy">{comment}</blockquote>
            <p className="mt-3 text-xs text-muted">
              <span className="font-semibold text-navy">{author}</span> on{' '}
              <Link to={`/product/${product.slug}`} className="rounded text-primary-dark hover:underline">{product.name}</Link>
            </p>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

function Newsletter() {
  const form = useForm({ email: '' });
  const [message, setMessage] = useState('');

  const onSubmit = form.submitWith(async ({ email }) => {
    const response = await apiPost('/newsletter', { email });
    setMessage(response.message);
    form.setValues({ email: '' });
  });
  const error = form.fieldErrors.email ?? form.error;

  return (
    <Reveal as="section" className="mt-section xl:pl-[3px]">
      <div className="relative overflow-hidden rounded-panel bg-[linear-gradient(100deg,var(--color-navy),#0b2c6e_70%,var(--color-primary-dark))] px-6 py-8 text-white sm:px-10">
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-lg">
            <h2 className="flex items-center gap-2 text-heading font-bold">
              <Mail aria-hidden="true" className="size-5 text-accent" />
              Stay in the loop
            </h2>
            <p className="mt-1 text-sm text-slate-200">New arrivals and offers from Sajsub Tech. Contact us any time to be removed.</p>
          </div>
          <form onSubmit={onSubmit} noValidate className="w-full lg:max-w-md">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Your email address"
                value={form.values.email}
                onChange={form.handleChange}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'newsletter-error' : undefined}
                className="input-field"
              />
              <Button type="submit" loading={form.submitting} className="sm:w-auto">Subscribe</Button>
            </div>
            {error && <p id="newsletter-error" role="alert" className="mt-2 text-xs text-red-200">{error}</p>}
            {message && !error && <p role="status" className="mt-2 flex items-center gap-1 text-xs text-accent"><Star aria-hidden="true" className="size-3 fill-accent" />{message}</p>}
          </form>
        </div>
      </div>
    </Reveal>
  );
}

function Sections({ shown }) {
  const { site } = useStore();
  const { data: catalog } = useFetch(`/products?sort=newest&limit=${LIST_SIZE}`);
  const shownIds = useMemo(() => new Set(shown.map(({ id }) => id)), [shown]);
  // Every other row is a subset of the catalog, so with too few new products the other requests are skipped.
  const hasMore = (catalog ?? []).filter(({ id }) => !shownIds.has(id)).length >= MIN_NEW_PRODUCTS;
  const { data: deals } = useFetch(hasMore ? `/products?onSale=true&sort=newest&limit=${LIST_SIZE}` : null);
  const { data: bestSellers } = useFetch(hasMore ? `/products/best-sellers?limit=${LIST_SIZE}` : null);
  const { data: topRated } = useFetch(hasMore ? `/products?sort=rating&limit=${LIST_SIZE}` : null);

  const rows = useMemo(() => {
    const seen = new Set(shownIds);
    const take = (products) => {
      const fresh = (products ?? []).filter(({ id }) => !seen.has(id)).slice(0, MAX_PER_ROW);
      if (fresh.length < MIN_NEW_PRODUCTS) return [];
      fresh.forEach(({ id }) => seen.add(id));
      return fresh;
    };
    return { deals: take(deals), newest: take(catalog), bestSellers: take(bestSellers), topRated: take(topRated) };
  }, [shownIds, deals, catalog, bestSellers, topRated]);

  const endsAt = site.settings.promo_ends_at;

  return (
    <>
      <PromotionGrid banners={site.banners.filter(({ placement }) => placement === 'PROMOTION')} />
      {rows.deals.length > 0 && (
        <ProductRow
          title="Flash Deals"
          linkTo="/shop?onSale=true"
          products={rows.deals}
          extra={endsAt && <Countdown endsAt={endsAt} label="Deals end in" unitClass="bg-navy text-white" />}
        />
      )}
      {rows.newest.length > 0 && <ProductRow title="New Arrivals" linkTo="/shop?sort=newest" products={rows.newest} />}
      {rows.bestSellers.length > 0 && <ProductRow title="Best Sellers" linkTo="/shop" products={rows.bestSellers} />}
      {rows.topRated.length > 0 && <ProductRow title="Top Rated" linkTo="/shop?sort=rating" products={rows.topRated} />}
      <Brands />
      <RecentlyViewed />
      <Reviews />
      <Newsletter />
    </>
  );
}

// Waits until the visitor nears the end of the main content, so these requests only run when needed.
export default function HomeSections({ shown }) {
  const ref = useRef(null);
  const near = useInView(ref, { once: true, margin: '200px' });

  return <div ref={ref}>{near && shown && <Sections shown={shown} />}</div>;
}

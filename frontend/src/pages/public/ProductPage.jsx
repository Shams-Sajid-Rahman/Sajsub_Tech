import { ImageOff, RotateCcw, ShieldCheck, ShoppingCart, Truck, Zap } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useId, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AnimatedButton from '../../components/ui/AnimatedButton.jsx';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton.jsx';
import FormMessage from '../../components/FormMessage.jsx';
import SubmitButton from '../../components/SubmitButton.jsx';
import ProductCarousel from '../../components/store/ProductCarousel.jsx';
import QuantitySelector from '../../components/store/QuantitySelector.jsx';
import StockStatus from '../../components/store/StockStatus.jsx';
import SectionHeading from '../../components/store/SectionHeading.jsx';
import StarRating from '../../components/store/StarRating.jsx';
import StorePage, { CARD } from '../../components/store/StorePage.jsx';
import WishlistButton from '../../components/store/WishlistButton.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { useStore } from '../../hooks/useStore.js';
import { apiPut } from '../../services/api.js';
import { formatDateTime, formatMoney } from '../../utils/format.js';
import { DURATION, EASE } from '../../utils/motion.js';
import { rememberViewedProduct } from '../../utils/storage.js';

function Gallery({ product }) {
  const [activeUrl, setActiveUrl] = useState(null);
  const [zoom, setZoom] = useState(null);
  const { images } = product;
  const active = images.find(({ url }) => url === activeUrl) ?? images[0];

  const followPointer = ({ currentTarget, clientX, clientY }) => {
    const box = currentTarget.getBoundingClientRect();
    setZoom(`${((clientX - box.left) / box.width) * 100}% ${((clientY - box.top) / box.height) * 100}%`);
  };

  return (
    <div>
      <div
        onMouseMove={followPointer}
        onMouseLeave={() => setZoom(null)}
        className={`${CARD} flex aspect-square items-center justify-center overflow-hidden p-8 ${active ? 'cursor-zoom-in' : ''}`}
      >
        {active ? (
          <AnimatePresence mode="wait" initial={false}>
            <m.img
              key={active.url}
              src={active.url}
              alt={active.altText ?? product.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.fast, ease: EASE }}
              style={zoom ? { transformOrigin: zoom } : undefined}
              className={`size-3/5 object-contain transition-transform duration-200 ease-standard ${zoom ? 'scale-[1.7]' : ''}`}
            />
          </AnimatePresence>
        ) : (
          <ImageOff aria-label="No image" className="size-12 text-slate-300" />
        )}
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map(({ url, altText }) => (
            <li key={url} className="shrink-0">
              <button
                type="button"
                onClick={() => setActiveUrl(url)}
                aria-label={`Show ${altText ?? 'image'}`}
                aria-current={url === active.url}
                className={`flex size-16 items-center justify-center rounded-control border bg-white p-1 transition ${url === active.url ? 'border-primary' : 'border-line hover:border-primary/50'}`}
              >
                <img src={url} alt="" className="max-h-full max-w-full object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DeliveryInfo() {
  const { settings } = useStore().site;
  const rows = [
    settings.free_shipping_threshold && [Truck, `Free shipping on orders over ${formatMoney(settings.free_shipping_threshold)}${settings.shipping_fee ? `, otherwise ${formatMoney(settings.shipping_fee)}` : ''}`],
    settings.return_policy_days && [RotateCcw, `${settings.return_policy_days} days return policy`],
    [ShieldCheck, 'Online payments are confirmed with the payment provider'],
  ].filter(Boolean);

  return (
    <ul className="mt-6 space-y-2 border-t border-line pt-4">
      {rows.map(([Icon, text]) => (
        <li key={text} className="flex items-center gap-2 text-sm text-muted">
          <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
          {text}
        </li>
      ))}
    </ul>
  );
}

function PurchasePanel({ product }) {
  const { addToCart } = useStore();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const buyNow = async () => {
    if (await addToCart(product.id, quantity)) navigate('/checkout');
  };

  return (
    <div>
      <p className="text-sm font-medium text-primary-dark">{product.brand.name}</p>
      <h1 className="mt-1 text-title font-bold text-navy lg:text-[30px]">{product.name}</h1>
      <div className="mt-2 flex items-center gap-2 text-sm text-muted">
        <StarRating value={product.ratingAverage} size={15} />
        {product.ratingAverage} ({product.ratingCount} reviews)
      </div>
      <p className="mt-4 flex flex-wrap items-baseline gap-3 text-3xl font-bold tabular-nums text-navy">
        {formatMoney(product.effectivePrice)}
        {product.discountPrice && (
          <>
            <span className="text-lg font-normal text-faint line-through">{formatMoney(product.price)}</span>
            <span className="rounded-full bg-sale px-2.5 py-0.5 text-sm font-bold text-white">-{product.discountPercent}%</span>
          </>
        )}
      </p>
      <div className="mt-3"><StockStatus product={product} /></div>
      {product.shortDescription && <p className="mt-4 text-sm text-muted">{product.shortDescription}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <QuantitySelector value={quantity} onChange={setQuantity} />
        <div className="min-w-44 flex-1">
          <AnimatedButton fullWidth size="lg" icon={ShoppingCart} disabled={!product.inStock} successLabel="Added" onClick={() => addToCart(product.id, quantity)}>
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </AnimatedButton>
        </div>
        <WishlistButton product={product} iconClass="size-[18px]" className="flex size-12 items-center justify-center rounded-control border border-line bg-white text-navy transition hover:border-primary" />
      </div>
      {product.inStock && (
        <AnimatedButton fullWidth size="lg" variant="dark" icon={Zap} onClick={buyNow} className="mt-3">
          Buy Now
        </AnimatedButton>
      )}
      <DeliveryInfo />
    </div>
  );
}

function ReviewForm({ slug, onSaved }) {
  const form = useForm({ rating: '5', comment: '' });
  const [saved, setSaved] = useState('');
  const onSubmit = form.submitWith(async ({ rating, comment }) => {
    setSaved('');
    await apiPut(`/products/${slug}/reviews`, { rating: Number(rating), ...(comment.trim() && { comment: comment.trim() }) });
    setSaved('Thanks for your review.');
    onSaved();
  });

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3 border-t border-line pt-4">
      <h3 className="font-semibold text-navy">Write a review</h3>
      <FormMessage>{form.error}</FormMessage>
      <FormMessage type="success">{saved}</FormMessage>
      <label className="block text-sm font-medium text-navy">
        Rating
        <select name="rating" value={form.values.rating} onChange={form.handleChange} className="mt-1 block w-auto input-field">
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>{value} {value === 1 ? 'star' : 'stars'}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-navy">
        Comment
        <textarea name="comment" rows={3} maxLength={2000} value={form.values.comment} onChange={form.handleChange} className="mt-1 w-full input-field" />
      </label>
      <div className="max-w-44"><SubmitButton submitting={form.submitting}>Submit review</SubmitButton></div>
    </form>
  );
}

// Tabs follow the standard keyboard pattern: arrow keys move between them.
function InfoTabs({ tabs }) {
  const [active, setActive] = useState(0);
  const baseId = useId();

  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    const next = (active + step + tabs.length) % tabs.length;
    setActive(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  };

  return (
    <section className={`${CARD} mt-8`}>
      <div role="tablist" aria-label="Product information" onKeyDown={onKeyDown} className="flex gap-1 overflow-x-auto border-b border-line px-3">
        {tabs.map(({ label }, index) => (
          <button
            key={label}
            id={`${baseId}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
            className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold transition ${index === active ? 'border-primary text-primary-dark' : 'border-transparent text-muted hover:text-navy'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tabs.map(({ label, content }, index) => (
        <div key={label} id={`${baseId}-panel-${index}`} role="tabpanel" aria-labelledby={`${baseId}-tab-${index}`} hidden={index !== active} className="p-5">
          {content}
        </div>
      ))}
    </section>
  );
}

function Reviews({ slug }) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, meta, loading, error, reload } = useFetch(`/products/${slug}/reviews?page=${page}&limit=5`);

  return (
    <div>
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && data?.length === 0 && <p className="text-sm text-muted">No customer reviews yet.</p>}
      <ul className="divide-y divide-line">
        {(data ?? []).map(({ id, author, rating, comment, createdAt }) => (
          <li key={id} className="py-3 first:pt-0">
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-navy">
              <StarRating value={rating} size={13} /> {author}
              <span className="text-xs font-normal text-muted">{formatDateTime(createdAt)}</span>
            </div>
            {comment && <p className="mt-1 text-sm text-muted">{comment}</p>}
          </li>
        ))}
      </ul>
      <Pagination meta={meta?.totalPages > 1 ? meta : null} onPageChange={setPage} />
      {user ? (
        <ReviewForm slug={slug} onSaved={reload} />
      ) : (
        !user && <p className="mt-4 text-sm text-muted"><Link to="/login" className="font-semibold text-primary-dark">Log in</Link> to review products you've received.</p>
      )}
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const { data: product, loading, error, reload } = useFetch(`/products/${slug}`);
  const related = useFetch(`/products/${slug}/related`);

  useEffect(() => {
    if (product) rememberViewedProduct(product.slug);
  }, [product]);

  if (error) {
    return (
      <StorePage>
        <ErrorState message={error} onRetry={reload} />
      </StorePage>
    );
  }
  if (loading && !product) {
    return (
      <StorePage>
        <div className="grid gap-6 md:grid-cols-2 lg:gap-10">
          <LoadingSkeleton className="aspect-square rounded-card" />
          <div className="space-y-3">
            <LoadingSkeleton className="h-8 w-3/4" />
            <LoadingSkeleton className="h-5 w-1/2" />
            <LoadingSkeleton className="h-10 w-1/3" />
            <LoadingSkeleton className="h-12" />
          </div>
        </div>
      </StorePage>
    );
  }
  if (!product) return null;

  return (
    <StorePage>
      <div className="mb-4">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: product.category.name, to: `/category/${product.category.slug}` }, { label: product.name }]} />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:gap-10">
        <Gallery key={product.id} product={product} />
        <PurchasePanel key={`buy-${product.id}`} product={product} />
      </div>

      <InfoTabs
        tabs={[
          { label: 'Description', content: <p className="whitespace-pre-line text-sm text-muted">{product.description || product.shortDescription || 'No description has been added yet.'}</p> },
          ...(product.specifications.length > 0
            ? [{
                label: 'Specifications',
                content: (
                  <dl className="max-w-2xl divide-y divide-line text-sm">
                    {product.specifications.map(({ name, value }) => (
                      <div key={name} className="flex justify-between gap-4 py-2">
                        <dt className="text-muted">{name}</dt>
                        <dd className="text-right font-medium text-navy">{value}</dd>
                      </div>
                    ))}
                  </dl>
                ),
              }]
            : []),
          { label: `Reviews (${product.ratingCount})`, content: <Reviews slug={slug} /> },
        ]}
      />

      {related.data?.length > 0 && (
        <section className="mt-8">
          <SectionHeading title="Related Products" />
          <ProductCarousel products={related.data} label="Related products" />
        </section>
      )}
    </StorePage>
  );
}

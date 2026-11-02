import { Heart, ImageOff, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorState from '../../components/admin/ErrorState.jsx';
import Pagination from '../../components/admin/Pagination.jsx';
import Skeleton from '../../components/admin/Skeleton.jsx';
import FormMessage from '../../components/FormMessage.jsx';
import SubmitButton from '../../components/SubmitButton.jsx';
import ProductCard from '../../components/store/ProductCard.jsx';
import SectionHeading from '../../components/store/SectionHeading.jsx';
import StarRating from '../../components/store/StarRating.jsx';
import StorePage, { CARD } from '../../components/store/StorePage.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { useStore } from '../../hooks/useStore.js';
import { apiPut } from '../../services/api.js';
import { formatDateTime, formatMoney } from '../../utils/format.js';

const MAX_QUANTITY = 99;

function Gallery({ product }) {
  const [activeUrl, setActiveUrl] = useState(null);
  const { images } = product;
  const active = images.find(({ url }) => url === activeUrl) ?? images[0];

  return (
    <div>
      <div className={`${CARD} flex aspect-square items-center justify-center p-6`}>
        {active ? <img src={active.url} alt={active.altText ?? product.name} className="max-h-full max-w-full object-contain" /> : <ImageOff aria-label="No image" className="size-12 text-slate-300" />}
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
                className={`flex size-16 items-center justify-center rounded-lg border bg-white p-1 ${url === active.url ? 'border-primary' : 'border-line'}`}
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

function Availability({ product }) {
  if (!product.inStock) return <p className="text-sm font-semibold text-red-700">Out of stock</p>;
  if (product.stockLeft) return <p className="text-sm font-semibold text-amber-800">Only {product.stockLeft} left in stock</p>;
  return <p className="text-sm font-semibold text-green-700">In stock</p>;
}

function PurchasePanel({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [quantity, setQuantity] = useState(1);
  const saved = isInWishlist(product.id);

  return (
    <div>
      <p className="text-sm font-medium text-primary">{product.brand.name}</p>
      <h1 className="mt-1 text-2xl font-bold text-navy lg:text-[30px]">{product.name}</h1>
      <div className="mt-2 flex items-center gap-2 text-sm text-muted">
        <StarRating value={product.ratingAverage} size={15} />
        {product.ratingAverage} ({product.ratingCount} reviews)
      </div>
      <p className="mt-4 flex flex-wrap items-baseline gap-3 text-3xl font-bold tabular-nums text-navy">
        {formatMoney(product.effectivePrice)}
        {product.discountPrice && (
          <>
            <span className="text-lg font-normal text-muted line-through">{formatMoney(product.price)}</span>
            <span className="rounded-full bg-[#e8112d] px-2.5 py-0.5 text-sm font-bold text-white">-{product.discountPercent}%</span>
          </>
        )}
      </p>
      <div className="mt-3"><Availability product={product} /></div>
      {product.shortDescription && <p className="mt-4 text-sm text-muted">{product.shortDescription}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border border-line bg-white">
          <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(quantity - 1)} className="p-3 text-navy disabled:opacity-40">
            <Minus aria-hidden="true" className="size-4" />
          </button>
          <span aria-live="polite" className="w-8 text-center text-sm font-semibold tabular-nums text-navy">{quantity}</span>
          <button type="button" aria-label="Increase quantity" disabled={quantity >= MAX_QUANTITY} onClick={() => setQuantity(quantity + 1)} className="p-3 text-navy disabled:opacity-40">
            <Plus aria-hidden="true" className="size-4" />
          </button>
        </div>
        <button
          type="button"
          disabled={!product.inStock}
          onClick={() => addToCart(product.id, quantity)}
          className="flex h-[46px] min-w-44 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <ShoppingCart aria-hidden="true" className="size-[18px]" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
        <button
          type="button"
          aria-pressed={saved}
          onClick={() => toggleWishlist(product.id)}
          className="flex h-[46px] items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-navy hover:border-primary"
        >
          <Heart aria-hidden="true" className={`size-[18px] ${saved ? 'fill-[#e8112d] text-[#e8112d]' : ''}`} />
          {saved ? 'Saved' : 'Add to Wishlist'}
        </button>
      </div>
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
        <select name="rating" value={form.values.rating} onChange={form.handleChange} className="mt-1 block rounded-lg border border-line bg-white px-3 py-2 text-sm">
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>{value} {value === 1 ? 'star' : 'stars'}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-navy">
        Comment
        <textarea name="comment" rows={3} maxLength={2000} value={form.values.comment} onChange={form.handleChange} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" />
      </label>
      <div className="max-w-44"><SubmitButton submitting={form.submitting}>Submit review</SubmitButton></div>
    </form>
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
      {user?.role === 'CUSTOMER' ? (
        <ReviewForm slug={slug} onSaved={reload} />
      ) : (
        !user && <p className="mt-4 text-sm text-muted"><Link to="/login" className="font-semibold text-primary">Log in</Link> to review products you've received.</p>
      )}
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const { data: product, loading, error, reload } = useFetch(`/products/${slug}`);
  const related = useFetch(`/products/${slug}/related`);

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
        <Skeleton className="h-96 rounded-xl" />
      </StorePage>
    );
  }
  if (!product) return null;

  return (
    <StorePage>
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted">
        <Link to="/" className="hover:text-primary">Home</Link> /{' '}
        <Link to={`/category/${product.category.slug}`} className="hover:text-primary">{product.category.name}</Link> /{' '}
        <span className="text-navy">{product.name}</span>
      </nav>
      <div className="grid gap-6 md:grid-cols-2 lg:gap-10">
        <Gallery key={product.id} product={product} />
        <PurchasePanel key={`buy-${product.id}`} product={product} />
      </div>

      <div className="mt-8 grid items-start gap-5 lg:grid-cols-2">
        <section className={`${CARD} p-5`}>
          <h2 className="mb-3 text-lg font-bold text-navy">Description</h2>
          <p className="whitespace-pre-line text-sm text-muted">{product.description || product.shortDescription || 'No description has been added yet.'}</p>
          {product.specifications.length > 0 && (
            <>
              <h2 className="mb-2 mt-5 text-lg font-bold text-navy">Specifications</h2>
              <dl className="divide-y divide-line text-sm">
                {product.specifications.map(({ name, value }) => (
                  <div key={name} className="flex justify-between gap-4 py-2">
                    <dt className="text-muted">{name}</dt>
                    <dd className="text-right font-medium text-navy">{value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </section>
        <section className={`${CARD} p-5`}>
          <h2 className="mb-3 text-lg font-bold text-navy">Reviews</h2>
          <Reviews slug={slug} />
        </section>
      </div>

      {related.data?.length > 0 && (
        <section className="mt-8">
          <SectionHeading title="Related Products" />
          <div className="grid grid-cols-2 gap-[10px] md:grid-cols-3 lg:grid-cols-6">
            {related.data.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </StorePage>
  );
}

import { ArrowRight, ImageOff, ShoppingCart } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import { useStore } from '../../hooks/useStore.js';
import { formatMoney } from '../../utils/format.js';
import { DURATION, EASE } from '../../utils/motion.js';
import { rememberViewedProduct } from '../../utils/storage.js';
import AnimatedButton from '../ui/AnimatedButton.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import LoadingSkeleton from '../ui/LoadingSkeleton.jsx';
import Modal from '../ui/Modal.jsx';
import QuantitySelector from './QuantitySelector.jsx';
import StarRating from './StarRating.jsx';
import StockStatus from './StockStatus.jsx';
import WishlistButton from './WishlistButton.jsx';

function Gallery({ product }) {
  const { images } = product;
  const [activeUrl, setActiveUrl] = useState(images[0]?.url);
  const active = images.find(({ url }) => url === activeUrl) ?? images[0];

  return (
    <div>
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-card border border-line bg-white p-6">
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
              className="size-3/4 object-contain"
            />
          </AnimatePresence>
        ) : (
          <ImageOff aria-label="No image" className="size-10 text-slate-300" />
        )}
      </div>
      {images.length > 1 && (
        <ul className="mt-2 flex gap-2 overflow-x-auto">
          {images.map(({ url, altText }) => (
            <li key={url} className="shrink-0">
              <button
                type="button"
                onClick={() => setActiveUrl(url)}
                aria-label={`Show ${altText ?? 'image'}`}
                aria-current={url === active.url}
                className={`flex size-14 items-center justify-center rounded-control border bg-white p-1 transition ${url === active.url ? 'border-primary' : 'border-line hover:border-primary/50'}`}
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

function Details({ product }) {
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col">
      <p className="text-sm font-medium text-primary-dark">{product.brand.name}</p>
      <div className="mt-2 flex items-center gap-2 text-sm text-muted">
        <StarRating value={product.ratingAverage} size={14} />
        {product.ratingAverage} ({product.ratingCount} reviews)
      </div>
      <p className="mt-3 flex flex-wrap items-baseline gap-2 text-2xl font-bold tabular-nums text-navy">
        {formatMoney(product.effectivePrice)}
        {product.discountPrice && (
          <>
            <span className="text-base font-normal text-faint line-through">{formatMoney(product.price)}</span>
            <span className="rounded-full bg-sale px-2 py-0.5 text-xs font-bold text-white">-{product.discountPercent}%</span>
          </>
        )}
      </p>
      <div className="mt-2"><StockStatus product={product} /></div>
      {product.shortDescription && <p className="mt-3 text-sm text-muted">{product.shortDescription}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <QuantitySelector value={quantity} onChange={setQuantity} />
        <div className="min-w-40 flex-1">
          <AnimatedButton fullWidth size="lg" icon={ShoppingCart} disabled={!product.inStock} successLabel="Added" onClick={() => addToCart(product.id, quantity)}>
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </AnimatedButton>
        </div>
        <WishlistButton product={product} iconClass="size-[18px]" className="flex size-12 items-center justify-center rounded-control border border-line bg-white text-navy transition hover:border-primary" />
      </div>

      <Link to={`/product/${product.slug}`} className="mt-5 inline-flex w-fit items-center gap-1 rounded text-sm font-semibold text-primary-dark hover:underline">
        View full details
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </div>
  );
}

export default function ProductQuickView({ slug, onClose }) {
  const { data: product, loading, error, reload } = useFetch(`/products/${slug}`);

  useEffect(() => {
    if (product) rememberViewedProduct(product.slug);
  }, [product]);

  return (
    <Modal title={product?.name ?? 'Quick view'} size="xl" onClose={onClose}>
      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && !product && (
        <div className="grid gap-5 md:grid-cols-2">
          <LoadingSkeleton className="aspect-square rounded-card" />
          <div className="space-y-3">
            <LoadingSkeleton className="h-5 w-24" />
            <LoadingSkeleton className="h-8 w-40" />
            <LoadingSkeleton className="h-24" />
          </div>
        </div>
      )}
      {product && (
        <div className="grid gap-5 md:grid-cols-2">
          <Gallery product={product} />
          <Details product={product} />
        </div>
      )}
    </Modal>
  );
}

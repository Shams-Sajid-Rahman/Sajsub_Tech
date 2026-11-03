import { Eye, ImageOff, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore.js';
import { formatMoney } from '../../utils/format.js';
import AnimatedButton from '../ui/AnimatedButton.jsx';
import LoadingSkeleton from '../ui/LoadingSkeleton.jsx';
import ProductQuickView from './ProductQuickView.jsx';
import StarRating from './StarRating.jsx';
import StockStatus from './StockStatus.jsx';
import WishlistButton from './WishlistButton.jsx';

const compactCount = (count) => (count >= 1000 ? `${(count / 1000).toFixed(1).replace('.0', '')}k` : count);

export function ProductCardSkeleton() {
  return <LoadingSkeleton className="h-[290px] rounded-xl lg:h-[212px]" />;
}

export default function ProductCard({ product }) {
  const { addToCart } = useStore();
  const [quickView, setQuickView] = useState(false);
  const to = `/product/${product.slug}`;

  return (
    <article className="group relative flex w-full flex-col rounded-[10px] border border-line bg-white px-[11px] pb-[10px] pt-[8px] transition duration-200 ease-standard hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-raised">
      {product.discountPercent > 0 && (
        <span className="absolute left-[11px] top-[11px] z-10 rounded-full bg-sale px-[8px] py-[1px] text-[10px] font-bold text-white">
          -{product.discountPercent}%
        </span>
      )}
      <WishlistButton product={product} className="absolute right-[10px] top-[6px] z-10 rounded p-1 text-muted transition-colors hover:text-sale" />

      <Link to={to} tabIndex={-1} aria-hidden="true" className="flex h-[96px] items-center justify-center overflow-hidden">
        {product.primaryImage ? (
          <img
            src={product.primaryImage.url}
            alt={product.primaryImage.altText ?? product.name}
            loading="lazy"
            className="max-h-full max-w-[75%] object-contain transition-transform duration-300 ease-standard group-hover:scale-105"
          />
        ) : (
          <ImageOff aria-label="No image" className="size-8 text-slate-300" />
        )}
      </Link>
      <button
        type="button"
        onClick={() => setQuickView(true)}
        aria-label={`Quick view of ${product.name}`}
        className="absolute left-1/2 top-[74px] z-10 flex h-[26px] -translate-x-1/2 items-center gap-1 rounded-full bg-navy/90 px-[10px] text-[11px] font-semibold whitespace-nowrap text-white opacity-0 shadow-raised transition duration-150 hover:bg-primary focus-visible:opacity-100 group-hover:opacity-100 touch:left-auto touch:right-[10px] touch:top-[34px] touch:h-[24px] touch:translate-x-0 touch:bg-white/90 touch:px-[4px] touch:text-muted touch:opacity-100 touch:shadow-none"
      >
        <Eye aria-hidden="true" className="size-[15px]" />
        <span className="touch:hidden">Quick View</span>
      </button>

      <h3 className="mt-[7px] line-clamp-2 min-h-[32px] text-[13px] sm:block sm:min-h-0 sm:truncate font-semibold leading-[16px] text-navy">
        <Link to={to} className="rounded hover:text-primary-dark">{product.name}</Link>
      </h3>
      <div className="mt-[3px] flex items-center gap-[3px] text-[9px] text-muted">
        <StarRating value={product.ratingAverage} size={9} />
        <span className="ml-[2px] truncate">
          {product.ratingAverage} ({compactCount(product.ratingCount)} reviews)
        </span>
      </div>
      <div className="mt-[1px] flex min-h-[19px] flex-wrap items-baseline gap-x-[7px] text-[14px] font-bold leading-[18px] tabular-nums text-navy">
        <span>{formatMoney(product.effectivePrice)}</span>
        {product.discountPrice && <span className="text-[11px] font-normal text-faint line-through">{formatMoney(product.price)}</span>}
        <StockStatus product={product} className="ml-auto whitespace-nowrap text-[9.5px] leading-[14px]" />
      </div>

      <div className="mt-auto pt-[5px]">
        <AnimatedButton fullWidth size="sm" icon={ShoppingCart} disabled={!product.inStock} successLabel="Added" onClick={() => addToCart(product.id)}>
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </AnimatedButton>
      </div>

      {quickView && <ProductQuickView slug={product.slug} onClose={() => setQuickView(false)} />}
    </article>
  );
}

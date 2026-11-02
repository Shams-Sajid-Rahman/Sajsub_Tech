import { Heart, ImageOff, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore.js';
import { formatMoney } from '../../utils/format.js';
import Skeleton from '../admin/Skeleton.jsx';
import StarRating from './StarRating.jsx';

const compactCount = (count) => (count >= 1000 ? `${(count / 1000).toFixed(1).replace('.0', '')}k` : count);

export function ProductCardSkeleton() {
  return <Skeleton className="h-[290px] rounded-xl lg:h-[212px]" />;
}

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const saved = isInWishlist(product.id);
  const to = `/product/${product.slug}`;

  return (
    <article className="relative flex flex-col rounded-[10px] border border-[#e6ecf7] bg-white px-[11px] pb-[10px] pt-[8px] transition hover:shadow-md">
      {product.discountPercent > 0 && (
        <span className="absolute left-[11px] top-[11px] z-10 rounded-full bg-[#e8112d] px-[8px] py-[1px] text-[10px] font-bold text-white">
          -{product.discountPercent}%
        </span>
      )}
      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        className="absolute right-[10px] top-[8px] z-10 p-1 text-[#5b6780] hover:text-[#e8112d]"
      >
        <Heart aria-hidden="true" className={`size-[16px] ${saved ? 'fill-[#e8112d] text-[#e8112d]' : ''}`} />
      </button>

      <Link to={to} className="flex h-[96px] items-center justify-center">
        {product.primaryImage ? (
          <img src={product.primaryImage.url} alt={product.primaryImage.altText ?? product.name} loading="lazy" className="max-h-full max-w-[75%] object-contain" />
        ) : (
          <ImageOff aria-label="No image" className="size-8 text-slate-300" />
        )}
      </Link>

      <h3 className="mt-[6px] truncate text-[13px] font-semibold leading-[16px] text-navy">
        <Link to={to} className="hover:text-primary">{product.name}</Link>
      </h3>
      <div className="mt-[2px] flex items-center gap-[3px] text-[9px] text-[#5b6780]">
        <StarRating value={product.ratingAverage} />
        <span className="ml-[2px] truncate">
          {product.ratingAverage} ({compactCount(product.ratingCount)} reviews)
        </span>
      </div>
      <p className="mt-[1px] flex flex-wrap items-baseline gap-x-[7px] text-[14px] font-bold leading-[18px] tabular-nums text-navy">
        {formatMoney(product.effectivePrice)}
        {product.discountPrice && <span className="text-[11px] font-normal text-[#7c879c] line-through">{formatMoney(product.price)}</span>}
      </p>

      <button
        type="button"
        onClick={() => addToCart(product.id)}
        disabled={!product.inStock}
        className="mt-[6px] flex h-[32px] items-center justify-center gap-[7px] rounded-[6px] bg-primary text-[12px] font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <ShoppingCart aria-hidden="true" className="size-[15px]" />
        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </article>
  );
}

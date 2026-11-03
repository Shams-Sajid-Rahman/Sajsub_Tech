import { Heart } from 'lucide-react';
import * as m from 'motion/react-m';
import { useStore } from '../../hooks/useStore.js';

export default function WishlistButton({ product, className = '', iconClass = 'size-[16px]', children }) {
  const { toggleWishlist, isInWishlist } = useStore();
  const saved = isInWishlist(product.id);

  return (
    <m.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={() => toggleWishlist(product.id)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      className={className}
    >
      {/* The key replays the small pop each time the heart changes. */}
      <m.span key={saved ? 'saved' : 'empty'} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="block">
        <Heart aria-hidden="true" className={`${iconClass} transition-colors ${saved ? 'fill-sale text-sale' : ''}`} />
      </m.span>
      {children}
    </m.button>
  );
}

import { useState } from 'react';
import { Heart } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Button from '../../components/ui/Button.jsx';
import ProductCard from '../../components/store/ProductCard.jsx';
import StorePage, { CARD } from '../../components/store/StorePage.jsx';
import { useStore } from '../../hooks/useStore.js';

export default function WishlistPage() {
  const { wishlist, moveToCart } = useStore();
  const [moving, setMoving] = useState(null);

  const handleMove = async (productId) => {
    setMoving(productId);
    await moveToCart(productId);
    setMoving(null);
  };

  return (
    <StorePage title="My wishlist">
      {wishlist.length === 0 ? (
        <div className={CARD}>
          <EmptyState icon={Heart} title="Your wishlist is empty" message="Save products you like and find them here later." action={<Button to="/shop">Browse products</Button>} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[10px] md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {wishlist.map((product) => (
            <div key={product.id} className="flex min-w-0 flex-col gap-2">
              <ProductCard product={product} />
              <Button
                variant="outline"
                size="sm"
                fullWidth
                disabled={!product.inStock}
                loading={moving === product.id}
                onClick={() => handleMove(product.id)}
                aria-label={`Move ${product.name} to cart`}
              >
                {moving === product.id ? 'Moving...' : 'Move to Cart'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </StorePage>
  );
}

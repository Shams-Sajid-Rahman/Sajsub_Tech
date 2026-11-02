import { useState } from 'react';
import { Link } from 'react-router-dom';
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
        <p className={`${CARD} p-10 text-center text-sm text-muted`}>
          Your wishlist is empty. <Link to="/shop" className="font-semibold text-primary">Browse products</Link>
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-[10px] md:grid-cols-3 lg:grid-cols-6">
          {wishlist.map((product) => (
            <div key={product.id} className="flex flex-col gap-2">
              <ProductCard product={product} />
              <button
                type="button"
                disabled={!product.inStock || moving === product.id}
                onClick={() => handleMove(product.id)}
                aria-label={`Move ${product.name} to cart`}
                className="rounded-[6px] border border-primary bg-white py-1.5 text-[12px] font-semibold text-primary hover:bg-page disabled:cursor-not-allowed disabled:border-line disabled:text-muted"
              >
                {moving === product.id ? 'Moving...' : 'Move to Cart'}
              </button>
            </div>
          ))}
        </div>
      )}
    </StorePage>
  );
}

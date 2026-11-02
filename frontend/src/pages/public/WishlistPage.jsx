import { Link } from 'react-router-dom';
import ProductCard from '../../components/store/ProductCard.jsx';
import StorePage, { CARD } from '../../components/store/StorePage.jsx';
import { useStore } from '../../hooks/useStore.js';

export default function WishlistPage() {
  const { wishlist } = useStore();
  return (
    <StorePage title="My wishlist">
      {wishlist.length === 0 ? (
        <p className={`${CARD} p-10 text-center text-sm text-muted`}>
          Your wishlist is empty. <Link to="/shop" className="font-semibold text-primary">Browse products</Link>
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-[10px] md:grid-cols-3 lg:grid-cols-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </StorePage>
  );
}

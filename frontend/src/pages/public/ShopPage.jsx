import ProductListing from '../../components/store/ProductListing.jsx';
import StorePage from '../../components/store/StorePage.jsx';

export default function ShopPage() {
  return (
    <StorePage title="Shop" subtitle="Browse everything in the Sajsub Tech store.">
      <ProductListing />
    </StorePage>
  );
}

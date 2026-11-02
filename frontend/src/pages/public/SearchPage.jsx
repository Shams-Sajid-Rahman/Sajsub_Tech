import { useSearchParams } from 'react-router-dom';
import ProductListing from '../../components/store/ProductListing.jsx';
import StorePage from '../../components/store/StorePage.jsx';

export default function SearchPage() {
  const [params] = useSearchParams();
  const term = params.get('search');
  return (
    <StorePage title={term ? `Results for "${term}"` : 'Search'}>
      <ProductListing />
    </StorePage>
  );
}

import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import ProductListing from '../../components/store/ProductListing.jsx';
import StorePage from '../../components/store/StorePage.jsx';
import { useFetch } from '../../hooks/useFetch.js';

export default function CategoryPage() {
  const { slug } = useParams();
  const { data: category, error, reload } = useFetch(`/categories/${slug}`);

  if (error) {
    return (
      <StorePage>
        <ErrorState message={error} onRetry={reload} />
      </StorePage>
    );
  }

  return (
    <StorePage title={category?.name ?? ' '} subtitle={category?.description}>
      <div className="-mt-3 mb-4">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, { label: category?.name ?? '...' }]} />
      </div>
      {category?.children?.length > 0 && (
        <nav aria-label="Subcategories" className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {category.children.map(({ slug: childSlug, name }) => (
            <Link key={childSlug} to={`/category/${childSlug}`} className="shrink-0 rounded-full border border-line bg-white px-4 py-1.5 text-sm font-medium text-navy transition hover:border-primary hover:text-primary-dark">
              {name}
            </Link>
          ))}
        </nav>
      )}
      <ProductListing key={slug} fixedCategory={slug} />
    </StorePage>
  );
}

import ErrorState from '../../components/admin/ErrorState.jsx';
import CategorySidebar from '../../components/store/CategorySidebar.jsx';
import CategoryTiles from '../../components/store/CategoryTiles.jsx';
import HeroSlider from '../../components/store/HeroSlider.jsx';
import ProductCard, { ProductCardSkeleton } from '../../components/store/ProductCard.jsx';
import SectionHeading from '../../components/store/SectionHeading.jsx';
import ServiceStrip from '../../components/store/ServiceStrip.jsx';
import { useFetch } from '../../hooks/useFetch.js';

const FEATURED_COUNT = 6;

export default function HomePage() {
  const featured = useFetch(`/products?featured=true&limit=${FEATURED_COUNT}&sort=oldest`);

  return (
    <main className="mx-auto max-w-[1272px] px-4 pt-3 lg:pt-0 xl:px-0">
      <div className="flex items-start gap-[14px]">
        <CategorySidebar />
        <HeroSlider />
      </div>
      <ServiceStrip />
      <CategoryTiles />
      <section className="mt-[22px] xl:pl-[3px]">
        <SectionHeading title="Featured Products" linkTo="/shop?featured=true" linkLabel="View All Products" />
        {featured.error && <ErrorState message={featured.error} onRetry={featured.reload} />}
        <div className="grid grid-cols-2 gap-[10px] md:grid-cols-3 xl:grid-cols-[212fr_211fr_212fr_211fr_200fr_173fr]">
          {featured.loading && !featured.data && Array.from({ length: FEATURED_COUNT }, (_, index) => <ProductCardSkeleton key={index} />)}
          {(featured.data ?? []).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}

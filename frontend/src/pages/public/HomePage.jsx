import * as m from 'motion/react-m';
import CategorySidebar from '../../components/store/CategorySidebar.jsx';
import CategoryTiles from '../../components/store/CategoryTiles.jsx';
import HeroSlider from '../../components/store/HeroSlider.jsx';
import HomeSections from '../../components/store/HomeSections.jsx';
import ProductCard, { ProductCardSkeleton } from '../../components/store/ProductCard.jsx';
import SectionHeading from '../../components/store/SectionHeading.jsx';
import ServiceStrip from '../../components/store/ServiceStrip.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { fadeUp, stagger } from '../../utils/motion.js';

const FEATURED_COUNT = 6;

export default function HomePage() {
  const featured = useFetch(`/products?featured=true&limit=${FEATURED_COUNT}&sort=oldest`);

  return (
    <main className="container-page pt-3 lg:pt-0">
      <div className="flex items-start gap-[14px]">
        <CategorySidebar />
        <HeroSlider />
      </div>
      <ServiceStrip />
      <CategoryTiles />
      <section className="mt-[22px] xl:pl-[3px]">
        <SectionHeading title="Featured Products" linkTo="/shop?featured=true" linkLabel="View All Products" />
        {featured.error && <ErrorState message={featured.error} onRetry={featured.reload} />}
        {featured.loading && !featured.data ? (
          <div className="grid grid-cols-2 gap-[10px] md:grid-cols-3 xl:grid-cols-[212fr_211fr_212fr_211fr_200fr_173fr]">
            {Array.from({ length: FEATURED_COUNT }, (_, index) => <ProductCardSkeleton key={index} />)}
          </div>
        ) : (
          <m.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-2 gap-[10px] md:grid-cols-3 xl:grid-cols-[212fr_211fr_212fr_211fr_200fr_173fr]"
          >
            {(featured.data ?? []).map((product) => (
              <m.div key={product.id} variants={fadeUp} className="flex min-w-0">
                <ProductCard product={product} />
              </m.div>
            ))}
          </m.div>
        )}
      </section>
      <HomeSections shown={featured.data} />
    </main>
  );
}

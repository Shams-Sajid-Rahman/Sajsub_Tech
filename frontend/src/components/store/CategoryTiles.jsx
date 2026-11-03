import { useFetch } from '../../hooks/useFetch.js';
import ErrorState from '../ui/ErrorState.jsx';
import LoadingSkeleton from '../ui/LoadingSkeleton.jsx';
import Reveal from '../ui/Reveal.jsx';
import CategoryCard, { CATEGORY_CARD_SIZE } from './CategoryCard.jsx';
import SectionHeading from './SectionHeading.jsx';

const SKELETON_COUNT = 8;
// The column proportions in the design reference. Phones and tablets swipe sideways instead.
const GRID =
  'flex snap-x gap-[11px] overflow-x-auto pb-2 [scrollbar-width:none] lg:grid lg:grid-cols-[166fr_165fr_165fr_166fr_149fr_134fr_126fr_112fr] lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden';

export default function CategoryTiles() {
  const { data, loading, error, reload } = useFetch('/categories?featured=true&limit=8');
  // Subcategories come first, so the top-level Fashion category ends the row as in the design.
  const categories = [...(data ?? [])].sort((a, b) => Number(!a.parentId) - Number(!b.parentId));

  return (
    <Reveal as="section" className="mt-[16px] xl:pl-[3px]">
      <SectionHeading title="Shop by Category" linkTo="/shop" linkLabel="View All Categories" />
      {error && <ErrorState message={error} onRetry={reload} />}
      <div className={GRID}>
        {loading && !data && Array.from({ length: SKELETON_COUNT }, (_, index) => <LoadingSkeleton key={index} className={CATEGORY_CARD_SIZE} />)}
        {categories.map((category) => (
          <CategoryCard key={category.slug} category={category} />
        ))}
      </div>
    </Reveal>
  );
}

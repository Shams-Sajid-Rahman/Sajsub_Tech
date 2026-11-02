import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import ErrorState from '../admin/ErrorState.jsx';
import Skeleton from '../admin/Skeleton.jsx';
import SectionHeading from './SectionHeading.jsx';

const SKELETON_COUNT = 8;
// The column proportions in the design reference.
const GRID = 'flex gap-[11px] overflow-x-auto pb-2 lg:grid lg:grid-cols-[166fr_165fr_165fr_166fr_149fr_134fr_126fr_112fr] lg:overflow-visible lg:pb-0';
const TILE = 'h-[142px] w-[130px] shrink-0 rounded-[10px] lg:w-auto';

// "Laptops & Computers" sits on two lines, breaking before the ampersand.
const labelLines = (name) => {
  const [first, second] = name.split(' & ');
  return second ? [first, `& ${second}`] : [name];
};

export default function CategoryTiles() {
  const { data, loading, error, reload } = useFetch('/categories?featured=true&limit=8');
  // Subcategories come first, so the top-level Fashion category ends the row as in the design.
  const categories = [...(data ?? [])].sort((a, b) => Number(!a.parentId) - Number(!b.parentId));

  return (
    <section className="mt-[18px]">
      <SectionHeading title="Shop by Category" linkTo="/shop" linkLabel="View All Categories" />
      {error && <ErrorState message={error} onRetry={reload} />}
      <div className={GRID}>
        {loading && !data && Array.from({ length: SKELETON_COUNT }, (_, index) => <Skeleton key={index} className={TILE} />)}
        {categories.map(({ slug, name, imageUrl }) => (
          <Link
            key={slug}
            to={`/category/${slug}`}
            className={`${TILE} flex flex-col items-center overflow-hidden border border-[#e6ecf7] bg-[#f1f6fe] text-center transition hover:border-primary`}
          >
            <span className="block h-[100px] w-full">
              {imageUrl && <img src={imageUrl} alt="" loading="lazy" className="size-full object-cover" />}
            </span>
            <span className="mt-[2px] text-[12px] font-semibold leading-[15px] text-navy">
              {labelLines(name).map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

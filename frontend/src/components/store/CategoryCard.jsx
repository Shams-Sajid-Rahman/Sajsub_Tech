import { Link } from 'react-router-dom';

// "Laptops & Computers" sits on two lines, breaking before the ampersand.
const labelLines = (name) => {
  const [first, second] = name.split(' & ');
  return second ? [first, `& ${second}`] : [name];
};

export const CATEGORY_CARD_SIZE = 'h-[143px] w-[130px] shrink-0 snap-start rounded-[10px] lg:w-auto';

export default function CategoryCard({ category: { slug, name, imageUrl } }) {
  return (
    <Link
      to={`/category/${slug}`}
      className={`${CATEGORY_CARD_SIZE} group relative flex flex-col items-center overflow-hidden border border-line bg-[#f1f6fe] text-center transition duration-200 ease-standard after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-raised hover:after:scale-x-100 focus-visible:after:scale-x-100`}
    >
      <span className="block h-[99px] w-full overflow-hidden">
        {imageUrl && <img src={imageUrl} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 ease-standard group-hover:scale-105" />}
      </span>
      <span className="mt-[2px] text-[12px] font-semibold leading-[15px] text-navy">
        {labelLines(name).map((line) => (
          <span key={line} className="block">{line}</span>
        ))}
      </span>
    </Link>
  );
}

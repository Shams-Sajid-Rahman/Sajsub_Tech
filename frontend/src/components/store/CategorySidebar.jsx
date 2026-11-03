import { ChevronRight, ListTree, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import LoadingSkeleton from '../ui/LoadingSkeleton.jsx';
import { ALL_CATEGORIES_PATH, categoryIcon } from './categoryIcons.js';

const MAX_ROWS = 8;
const ROW = 'flex h-[30.5px] items-center pl-[23px] pr-[10px] text-[12px] font-medium xl:text-[11.5px] text-navy transition hover:bg-page hover:pl-[26px] hover:text-primary-dark';
const CHEVRON = <ChevronRight aria-hidden="true" className="ml-auto size-[13px] shrink-0 text-muted" />;

export default function CategorySidebar() {
  const { data, loading } = useFetch(ALL_CATEGORIES_PATH);

  return (
    <aside className="hidden w-[217px] shrink-0 lg:block">
      <Link to="/shop" className="flex h-[37px] items-center gap-[13px] rounded-t-[10px] bg-primary pl-[21px] pr-[10px] text-[12px] font-semibold text-white">
        <Menu aria-hidden="true" className="size-[18px]" />
        All Categories
        <ChevronRight aria-hidden="true" className="ml-auto size-[15px]" />
      </Link>
      <nav aria-label="Categories" className="rounded-b-[10px] border border-t-0 border-line bg-white pb-[4px] pt-[6px]">
        {loading && !data && <LoadingSkeleton className="m-3 h-64" />}
        {(data ?? []).filter(({ showInMenu }) => showInMenu).slice(0, MAX_ROWS).map(({ slug, name, icon }) => {
          const Icon = categoryIcon(icon);
          return (
            <Link key={slug} to={`/category/${slug}`} className={ROW}>
              <Icon aria-hidden="true" className="mr-[14px] size-[16px] shrink-0" />
              <span className="whitespace-nowrap">{name}</span>
              {CHEVRON}
            </Link>
          );
        })}
        <Link to="/shop" className={ROW}>
          <ListTree aria-hidden="true" className="mr-[14px] size-[16px] shrink-0" />
          More Categories
          {CHEVRON}
        </Link>
      </nav>
    </aside>
  );
}

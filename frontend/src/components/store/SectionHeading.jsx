import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SectionHeading({ title, linkTo, linkLabel, extra }) {
  return (
    <div className="mb-[7px] flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
      <h2 className="relative pb-[5px] text-[20px] font-bold leading-[28px] text-navy after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-[24px] after:bg-primary lg:text-[21.5px] lg:leading-[26px]">
        {title}
      </h2>
      {extra && <div className="order-last w-full sm:order-none sm:mr-auto sm:w-auto">{extra}</div>}
      {linkTo && (
        <Link to={linkTo} className="group flex shrink-0 items-center gap-[7px] text-[11px] font-semibold text-primary-dark hover:underline">
          {linkLabel}
          <ArrowRight aria-hidden="true" className="size-[14px] transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

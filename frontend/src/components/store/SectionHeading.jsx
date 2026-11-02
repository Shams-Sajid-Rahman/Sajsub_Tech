import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SectionHeading({ title, linkTo, linkLabel }) {
  return (
    <div className="mb-[7px] flex items-center justify-between gap-3">
      <h2 className="relative pb-[5px] text-[20px] font-bold leading-[28px] text-navy after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-[24px] after:bg-primary lg:text-[21.5px] lg:leading-[26px]">
        {title}
      </h2>
      {linkTo && (
        <Link to={linkTo} className="flex shrink-0 items-center gap-[7px] text-[11px] font-semibold text-[#0b4ed8] hover:underline">
          {linkLabel}
          <ArrowRight aria-hidden="true" className="size-[14px]" />
        </Link>
      )}
    </div>
  );
}

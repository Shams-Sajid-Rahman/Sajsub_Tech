import { Star } from 'lucide-react';

export default function StarRating({ value, size = 10 }) {
  return (
    <span role="img" aria-label={`Rated ${value} out of 5`} className="inline-flex gap-[1px]">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          style={{ width: size, height: size }}
          className={star <= Math.round(value) ? 'fill-rating text-rating' : 'fill-slate-200 text-slate-200'}
        />
      ))}
    </span>
  );
}

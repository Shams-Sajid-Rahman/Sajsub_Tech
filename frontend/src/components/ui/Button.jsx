import { LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BASE =
  'inline-flex shrink-0 items-center justify-center whitespace-nowrap font-semibold transition duration-150 ease-standard disabled:cursor-not-allowed disabled:opacity-60';

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-dark hover:shadow-glow disabled:hover:bg-primary disabled:hover:shadow-none',
  dark: 'bg-navy text-white hover:bg-navy-light',
  outline: 'border border-line bg-white text-navy hover:border-primary hover:text-primary-dark',
  soft: 'bg-primary-soft text-primary-dark hover:bg-primary hover:text-white',
  ghost: 'text-navy hover:bg-page hover:text-primary-dark',
  danger: 'bg-danger text-white hover:bg-red-700',
};

const SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-6 text-sm',
};

const ICON_SIZES = { sm: 'size-3.5', md: 'size-4', lg: 'size-[18px]' };

// Renders a router link when given `to`, otherwise a button.
export default function Button({
  variant = 'primary',
  size = 'md',
  pill = false,
  fullWidth = false,
  to,
  icon: Icon,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${pill ? 'rounded-full' : 'rounded-control'} ${fullWidth ? 'w-full' : ''} ${className}`;
  const iconClass = ICON_SIZES[size];

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {Icon && <Icon aria-hidden="true" className={iconClass} />}
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={classes} {...props}>
      {loading ? <LoaderCircle aria-hidden="true" className={`${iconClass} animate-spin`} /> : Icon && <Icon aria-hidden="true" className={iconClass} />}
      {children}
    </button>
  );
}

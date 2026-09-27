import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';

const variants = {
  primary:
    'bg-brand text-white shadow-[0_1px_0_rgb(255_255_255/0.18)_inset,0_1px_2px_rgb(15_23_42/0.12)] hover:bg-brand-hover active:translate-y-px',
  dark: 'bg-night text-white hover:bg-night-soft dark:bg-white dark:text-night dark:hover:bg-white/90 active:translate-y-px',
  secondary:
    'bg-surface text-ink border border-line-strong shadow-[0_1px_2px_rgb(15_23_42/0.05)] hover:bg-surface-muted hover:border-line-strong active:translate-y-px',
  ghost: 'text-ink-soft hover:bg-surface-muted hover:text-ink',
  subtle: 'bg-brand-soft text-brand-ink hover:bg-brand-soft/70',
  danger: 'bg-danger text-white hover:bg-danger/90 active:translate-y-px',
  'danger-ghost': 'text-danger-ink hover:bg-danger-soft',
  success: 'bg-success text-white hover:bg-success/90 active:translate-y-px',
  link: 'text-brand hover:text-brand-hover underline-offset-4 hover:underline !h-auto !px-0',
  onDark: 'bg-white/10 text-white border border-white/15 hover:bg-white/15 backdrop-blur',
};

const sizes = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-[15px] gap-2 rounded-xl',
  xl: 'h-14 px-7 text-base gap-2.5 rounded-2xl',
};

/**
 * Button that renders a <button>, a router <Link> (`to`) or an <a> (`href`).
 * Always give icon-only buttons an `aria-label` — or use <IconButton>.
 */
export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, leftIcon: Left, rightIcon: Right, fullWidth, className, children, to, href, type = 'button', ...rest },
  ref,
) {
  const classes = cn(
    'relative inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
    'disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className,
  );

  const content = (
    <>
      {loading ? <Spinner className="size-4" /> : Left ? <Left className="size-4 shrink-0" aria-hidden="true" /> : null}
      {children && <span className={cn(loading && 'opacity-90')}>{children}</span>}
      {!loading && Right ? <Right className="size-4 shrink-0" aria-hidden="true" /> : null}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} aria-disabled={disabled || undefined} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
});

const iconSizes = { sm: 'size-9 rounded-lg', md: 'size-11 rounded-xl', lg: 'size-12 rounded-xl' };

export const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, variant = 'ghost', size = 'md', className, badge, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center transition-colors duration-150 disabled:opacity-50',
        variants[variant],
        iconSizes[size],
        className,
      )}
      {...rest}
    >
      <Icon className="size-[18px]" aria-hidden="true" />
      {badge ? (
        <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-surface">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </button>
  );
});

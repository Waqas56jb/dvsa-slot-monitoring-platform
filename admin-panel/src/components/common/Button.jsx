import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] disabled:bg-brand-600/50',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-subtle active:bg-muted shadow-[0_1px_1px_rgb(16_24_40/0.04)]',
  ghost: 'text-ink-2 hover:bg-subtle hover:text-ink active:bg-muted',
  danger: 'bg-danger-dot text-white hover:bg-danger active:brightness-95 disabled:opacity-50',
  'danger-ghost': 'text-danger hover:bg-danger-soft',
  subtle: 'bg-subtle text-ink hover:bg-muted',
  link: 'text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline px-0 h-auto dark:text-brand-300',
}
const SIZES = {
  xs: 'h-7 px-2 text-xs gap-1 rounded-md',
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-md',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-lg',
}
const ICON_SIZES = { xs: 'h-7 w-7', sm: 'h-8 w-8', md: 'h-9 w-9', lg: 'h-11 w-11' }

/**
 * <Button variant="primary|secondary|ghost|danger|danger-ghost|subtle|link" size="xs|sm|md|lg"
 *   icon={Icon} iconRight={Icon} loading to="/path" iconOnly aria-label="…">
 */
export const Button = forwardRef(function Button(
  { variant = 'secondary', size = 'md', icon: Icon, iconRight: IconRight, loading = false, iconOnly = false, to, href, className, children, disabled, type = 'button', ...props },
  ref,
) {
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap select-none transition-colors duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed',
    VARIANTS[variant],
    iconOnly ? cn(ICON_SIZES[size], 'rounded-lg px-0') : SIZES[size],
    className,
  )
  const iconCls = size === 'xs' || size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const content = (
    <>
      {loading ? <Loader2 className={cn(iconCls, 'animate-spin')} aria-hidden /> : Icon ? <Icon className={iconCls} aria-hidden /> : null}
      {!iconOnly && children}
      {!iconOnly && IconRight && !loading ? <IconRight className={iconCls} aria-hidden /> : null}
    </>
  )
  if (to) return <Link ref={ref} to={to} className={classes} {...props}>{content}</Link>
  if (href) return <a ref={ref} href={href} className={classes} {...props}>{content}</a>
  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  )
})

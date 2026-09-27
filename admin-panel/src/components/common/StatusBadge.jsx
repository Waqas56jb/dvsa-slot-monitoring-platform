import { toneFor, statusLabel } from '@/constants/status'
import { cn } from '@/utils/cn'

export const TONE_STYLES = {
  success: { pill: 'bg-success-soft text-success ring-success/15', dot: 'bg-success-dot' },
  warning: { pill: 'bg-warning-soft text-warning ring-warning/15', dot: 'bg-warning-dot' },
  danger: { pill: 'bg-danger-soft text-danger ring-danger/15', dot: 'bg-danger-dot' },
  info: { pill: 'bg-info-soft text-info ring-info/15', dot: 'bg-info-dot' },
  brand: { pill: 'bg-brand-50 text-brand-700 ring-brand-600/15 dark:text-brand-300', dot: 'bg-brand-500' },
  neutral: { pill: 'bg-neutral-soft text-neutral ring-neutral/15', dot: 'bg-neutral-dot' },
}

/** Generic pill. Prefer StatusBadge for anything that is a status. */
export function Badge({ tone = 'neutral', children, dot = false, pulse = false, className, size = 'md' }) {
  const t = TONE_STYLES[tone] || TONE_STYLES.neutral
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full font-medium whitespace-nowrap ring-1 ring-inset',
        size === 'sm' ? 'px-1.5 py-0 text-[11px] leading-[18px]' : 'px-2 py-0.5 text-xs leading-[18px]',
        t.pill,
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', t.dot, pulse && 'animate-pulse')} aria-hidden />}
      <span className="truncate">{children}</span>
    </span>
  )
}

/** Maps any known status string to its tone. <StatusBadge status="Running" /> */
export function StatusBadge({ status, tone, size, className, pulse = false }) {
  return (
    <Badge tone={tone || toneFor(status)} dot size={size} pulse={pulse} className={className}>
      {statusLabel(status)}
    </Badge>
  )
}

/** Small coloured dot with optional label (for dense lists). */
export function StatusDot({ status, tone, label, className }) {
  const t = TONE_STYLES[tone || toneFor(status)] || TONE_STYLES.neutral
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-ink-2', className)}>
      <span className={cn('h-2 w-2 rounded-full', t.dot)} aria-hidden />
      {label ?? statusLabel(status)}
    </span>
  )
}

import { cn } from '@/utils/cn';

/** Tone → classes. Shared by Badge, StatusIndicator and other status UI. */
export const toneClasses = {
  brand: { soft: 'bg-brand-soft text-brand-ink', dot: 'bg-brand', ring: 'ring-brand/20', text: 'text-brand-ink', solid: 'bg-brand text-white' },
  success: { soft: 'bg-success-soft text-success-ink', dot: 'bg-success', ring: 'ring-success/20', text: 'text-success-ink', solid: 'bg-success text-white' },
  warning: { soft: 'bg-warning-soft text-warning-ink', dot: 'bg-warning', ring: 'ring-warning/25', text: 'text-warning-ink', solid: 'bg-warning text-night' },
  danger: { soft: 'bg-danger-soft text-danger-ink', dot: 'bg-danger', ring: 'ring-danger/20', text: 'text-danger-ink', solid: 'bg-danger text-white' },
  info: { soft: 'bg-info-soft text-info-ink', dot: 'bg-info', ring: 'ring-info/20', text: 'text-info-ink', solid: 'bg-info text-white' },
  neutral: { soft: 'bg-surface-sunken text-ink-soft', dot: 'bg-subtle', ring: 'ring-line-strong', text: 'text-ink-soft', solid: 'bg-ink text-surface' },
};

export function Badge({ tone = 'neutral', variant = 'soft', dot = false, pulse = false, icon: Icon, size = 'md', className, children }) {
  const t = toneClasses[tone] || toneClasses.neutral;
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-semibold',
        size === 'sm' ? 'h-5 px-2 text-[11px]' : 'h-6 px-2.5 text-xs',
        variant === 'solid' ? t.solid : variant === 'outline' ? cn('bg-surface ring-1 ring-inset', t.ring, t.text) : t.soft,
        className,
      )}
    >
      {dot && (
        <span className="relative flex size-1.5">
          {pulse && <span className={cn('absolute inline-flex size-full animate-ping rounded-full opacity-60', t.dot)} />}
          <span className={cn('relative inline-flex size-1.5 rounded-full', t.dot)} />
        </span>
      )}
      {Icon && <Icon className="size-3.5" aria-hidden="true" />}
      {children}
    </span>
  );
}

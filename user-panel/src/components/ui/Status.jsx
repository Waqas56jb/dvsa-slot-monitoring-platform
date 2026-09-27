import { cn } from '@/utils/cn';
import { toneClasses } from './Badge';

/**
 * Animated radar-style pulse used for "monitoring active".
 * Respects prefers-reduced-motion via the global CSS rule.
 */
export function MonitoringPulse({ active = true, tone = 'success', size = 'md', className }) {
  const t = toneClasses[tone] || toneClasses.success;
  const dims = { sm: 'size-2', md: 'size-2.5', lg: 'size-3.5' }[size];
  return (
    <span className={cn('relative inline-flex shrink-0', dims, className)} aria-hidden="true">
      {active && (
        <>
          <span className={cn('absolute inset-0 rounded-full animate-pulse-ring', t.dot)} />
          <span className={cn('absolute inset-0 rounded-full animate-pulse-ring [animation-delay:0.9s]', t.dot)} />
        </>
      )}
      <span className={cn('relative inline-flex size-full rounded-full', active ? t.dot : 'bg-subtle')} />
    </span>
  );
}

const STATUS_MAP = {
  active: { tone: 'success', label: 'Monitoring active' },
  paused: { tone: 'warning', label: 'Monitoring paused' },
  stopped: { tone: 'neutral', label: 'Monitoring stopped' },
};

/** "● Monitoring active" indicator. */
export function StatusIndicator({ status = 'active', label, className, size = 'md' }) {
  const s = STATUS_MAP[status] || STATUS_MAP.stopped;
  const t = toneClasses[s.tone];
  return (
    <span className={cn('inline-flex items-center gap-2 font-medium', size === 'sm' ? 'text-xs' : 'text-sm', t.text, className)} role="status">
      <MonitoringPulse active={status === 'active'} tone={s.tone} size={size === 'sm' ? 'sm' : 'md'} />
      {label || s.label}
    </span>
  );
}

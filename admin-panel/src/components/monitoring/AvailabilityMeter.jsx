import { cn } from '@/utils/cn'

const LEVELS = { None: 0, Low: 1, Medium: 2, High: 3 }
const FILL = { 0: 'bg-muted', 1: 'bg-warning-dot', 2: 'bg-brand-500', 3: 'bg-success-dot' }

/** Three-bar signal meter + label for centre availability (None / Low / Medium / High). */
export function AvailabilityMeter({ level = 'None', showLabel = true, className }) {
  const n = LEVELS[level] ?? 0
  return (
    <span className={cn('inline-flex items-center gap-2', className)} title={`${level} availability`}>
      <span className="flex h-3.5 items-end gap-[3px]" role="img" aria-label={`${level} availability`}>
        {[1, 2, 3].map((i) => (
          <span key={i} className={cn('w-[5px] rounded-[1.5px]', i <= n ? FILL[n] : 'bg-muted')} style={{ height: `${33 * i + 1}%` }} />
        ))}
      </span>
      {showLabel && <span className={cn('text-[13px]', n ? 'text-ink-2' : 'text-ink-4')}>{level}</span>}
    </span>
  )
}

export const AVAILABILITY_LEVELS = ['High', 'Medium', 'Low', 'None']

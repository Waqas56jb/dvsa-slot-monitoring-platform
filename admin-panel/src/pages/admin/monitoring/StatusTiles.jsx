import { TONE_STYLES } from '@/components/common/StatusBadge'
import { Skeleton } from '@/components/common/LoadingSkeleton'
import { toneFor } from '@/constants/status'
import { formatNumber } from '@/utils/format'
import { cn } from '@/utils/cn'

export const TILE_STATUSES = ['Running', 'Paused', 'Failed', 'Completed', 'Expired', 'Cancelled']

/**
 * Compact status summary row. Clicking a tile filters the list to that status;
 * clicking the active tile clears it.
 */
export function StatusTiles({ counts, loading, error, selected = [], onSelect }) {
  const only = selected.length === 1 ? selected[0] : null
  return (
    <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6" role="group" aria-label="Filter by status">
      {TILE_STATUSES.map((s) => {
        const active = only === s
        const dimmed = selected.length > 0 && !selected.includes(s)
        const tone = TONE_STYLES[toneFor(s)] || TONE_STYLES.neutral
        const n = counts?.[s] ?? 0
        return (
          <button
            key={s}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(active ? null : s)}
            className={cn(
              'card group flex min-w-0 flex-col items-start px-3.5 py-3 text-left transition-[border-color,box-shadow,opacity] duration-150',
              'hover:border-line-strong hover:shadow-[0_4px_12px_-4px_rgb(16_24_40/0.08)]',
              active && 'border-brand-500 ring-1 ring-brand-500 hover:border-brand-500',
              dimmed && 'opacity-60 hover:opacity-100',
            )}
          >
            <span className="flex w-full items-center gap-1.5 text-[13px] font-medium text-ink-3">
              <span className={cn('h-2 w-2 shrink-0 rounded-full', tone.dot, s === 'Running' && 'animate-pulse')} aria-hidden />
              <span className="truncate">{s}</span>
            </span>
            {loading ? (
              <Skeleton className="mt-2 h-6 w-12" />
            ) : (
              <span className={cn('mt-1 text-xl font-semibold tracking-[-0.02em] tabular', s === 'Failed' && n > 0 ? 'text-danger' : 'text-ink')}>
                {error ? '—' : formatNumber(n)}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

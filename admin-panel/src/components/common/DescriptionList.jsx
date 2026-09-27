import { cn } from '@/utils/cn'

/**
 * Label/value pairs for detail pages.
 * <DescriptionList columns={2} items={[{ label: 'Email', value: 'x', mono?: true, full?: true }]} />
 */
export function DescriptionList({ items, columns = 2, className, dense = false }) {
  return (
    <dl className={cn('grid gap-x-6', dense ? 'gap-y-3' : 'gap-y-4', columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2', className)}>
      {items.filter(Boolean).map((it) => (
        <div key={typeof it.label === 'string' ? it.label : it.key} className={cn('min-w-0', it.full && 'sm:col-span-full')}>
          <dt className="text-xs font-medium text-ink-3">{it.label}</dt>
          <dd className={cn('mt-1 text-sm break-words text-ink', it.mono && 'font-mono text-[13px]')}>{it.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Horizontal metric strip inside a card: [{ label, value, hint }] */
export function MetricStrip({ items, className }) {
  return (
    <div className={cn('grid grid-cols-2 divide-line overflow-hidden rounded-lg border border-line bg-surface sm:grid-cols-4 sm:divide-x', className)}>
      {items.map((m, i) => (
        <div key={m.label} className={cn('min-w-0 px-4 py-3', i % 2 === 1 && 'border-l border-line sm:border-l-0', i >= 2 && 'border-t border-line sm:border-t-0')}>
          <p className="truncate text-xs text-ink-3">{m.label}</p>
          <p className="mt-1 truncate text-lg font-semibold tracking-tight text-ink tabular">{m.value}</p>
          {m.hint && <p className="mt-0.5 truncate text-xs text-ink-4">{m.hint}</p>}
        </div>
      ))}
    </div>
  )
}

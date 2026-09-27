import { BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { SkeletonChart } from '@/components/common/LoadingSkeleton'
import { EmptyState, ErrorState } from '@/components/common/States'
import { cn } from '@/utils/cn'
import { formatNumber } from '@/utils/format'

/**
 * Frame for every chart: header, legend, loading / empty / error states.
 * legend: [{ label, color, value? }]
 */
export function ChartCard({ title, description, actions, legend, loading, error, onRetry, empty, height = 280, children, className, footer }) {
  let body
  if (loading) body = <SkeletonChart height={height} />
  else if (error) body = <ErrorState compact message="Unable to load chart data." onRetry={onRetry} />
  else if (empty) body = <EmptyState compact icon={BarChart3} title="No data for this period" description="Try a wider date range." />
  // Entrance handled here (not by Recharts) so charts always render their final state.
  else body = <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }} style={{ height }} className="min-w-0">{children}</motion.div>
  return (
    <Card title={title} description={description} actions={actions} className={className} footer={footer}>
      {legend?.length > 0 && !loading && !error && !empty && <ChartLegend items={legend} className="mb-4" />}
      {body}
    </Card>
  )
}

export function ChartLegend({ items, className }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-5 gap-y-2', className)}>
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2 text-xs text-ink-3">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: it.color }} aria-hidden />
          <span>{it.label}</span>
          {it.value != null && <span className="font-semibold text-ink tabular">{typeof it.value === 'number' ? formatNumber(it.value) : it.value}</span>}
        </li>
      ))}
    </ul>
  )
}

/** Recharts custom tooltip content. Text stays in ink colours; the swatch carries identity. */
export function ChartTooltip({ active, payload, label, labelFormatter, valueFormatter = formatNumber }) {
  if (!active || !payload?.length) return null
  return (
    <div className="min-w-[160px] rounded-lg border border-line bg-surface px-3 py-2.5 text-xs shadow-pop">
      {label != null && <p className="mb-1.5 font-medium text-ink">{labelFormatter ? labelFormatter(label) : label}</p>}
      <ul className="space-y-1">
        {payload.map((p) => (
          <li key={p.dataKey ?? p.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-ink-3">
              <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} aria-hidden />
              {p.name}
            </span>
            <span className="font-semibold text-ink tabular">{valueFormatter(p.value, p)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

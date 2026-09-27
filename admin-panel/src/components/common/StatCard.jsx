import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, Info } from 'lucide-react'
import { MiniTrend } from '@/components/charts/MiniTrend'
import { Tooltip } from './Tooltip'
import { SkeletonStatCard } from './LoadingSkeleton'
import { cn } from '@/utils/cn'
import { formatDelta, formatNumber } from '@/utils/format'

/**
 * KPI tile.
 * <StatCard label="Total users" value={12842} unit="%" delta={8.4} deltaLabel="this month"
 *   icon={Users} spark={[{t,value}]} hint="…" to="/admin/users" invertDelta />
 */
export function StatCard({ label, value, unit, delta, deltaLabel = 'vs previous period', icon: Icon, spark, hint, to, loading, invertDelta = false, format, className, index = 0 }) {
  if (loading) return <SkeletonStatCard />
  const up = delta > 0
  const good = invertDelta ? !up : up
  const display = value == null ? '—' : format ? format(value) : typeof value === 'number' ? (unit === '%' ? value.toFixed(value % 1 ? 2 : 0).replace(/0$/, '') : formatNumber(value)) : value
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-[13px] font-medium text-ink-3">{label}</p>
          {hint && (
            <Tooltip content={hint}>
              <button type="button" className="rounded text-ink-4 hover:text-ink-2" aria-label={`About ${label}`} onClick={(e) => e.preventDefault()}>
                <Info className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          )}
        </div>
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-subtle text-ink-2">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-[26px] leading-none font-semibold tracking-[-0.025em] text-ink">
          {display}
          {unit && <span className="ml-0.5 text-lg font-medium text-ink-3">{unit}</span>}
        </p>
        {spark?.length > 1 && <MiniTrend data={spark} className="h-8 w-24 shrink-0" />}
      </div>
      {delta != null && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-3">
          <span className={cn('inline-flex items-center gap-0.5 font-semibold', good ? 'text-success' : 'text-danger')}>
            {up ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />}
            {formatDelta(delta)}
          </span>
          <span className="truncate">{deltaLabel}</span>
        </p>
      )}
    </>
  )
  const cls = cn('card block p-4 transition-[border-color,box-shadow] duration-200', to && 'hover:border-line-strong hover:shadow-[0_4px_12px_-4px_rgb(16_24_40/0.08)]', className)
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.03 }} className="min-w-0">
      {to ? <Link to={to} className={cls}>{body}</Link> : <div className={cls}>{body}</div>}
    </motion.div>
  )
}

import { Link } from 'react-router-dom'
import { ChevronRight, Radar } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Skeleton } from '@/components/common/LoadingSkeleton'
import { TONE_STYLES } from '@/components/common/StatusBadge'
import { toneFor } from '@/constants/status'
import { formatNumber } from '@/utils/format'
import { cn } from '@/utils/cn'

const ORDER = ['Running', 'Paused', 'Completed', 'Failed', 'Expired']

export function MonitoringStatusCard({ counts, loading }) {
  const total = counts ? ORDER.reduce((a, k) => a + (counts[k] || 0), 0) : 0
  return (
    <Card title="Monitoring Jobs" description={loading ? ' ' : `${formatNumber(total)} jobs across all states`} icon={Radar} padding="none"
      actions={<Link to="/admin/monitoring" className="text-[13px] font-medium text-brand-600 hover:underline dark:text-brand-300">View all</Link>}>
      {loading || !counts ? (
        <div className="space-y-3 p-5">{ORDER.map((k) => <Skeleton key={k} className="h-9" />)}</div>
      ) : (
        <>
          <div className="flex h-2 gap-0.5 overflow-hidden px-5 pt-5" aria-hidden>
            {ORDER.map((k) => (
              <span key={k} className={cn('h-2 rounded-full first:rounded-l-full last:rounded-r-full', TONE_STYLES[toneFor(k)].dot)} style={{ width: `${((counts[k] || 0) / total) * 100}%`, minWidth: counts[k] ? 4 : 0 }} />
            ))}
          </div>
          <ul className="px-2 py-3">
            {ORDER.map((k) => {
              const v = counts[k] || 0
              return (
                <li key={k}>
                  <Link to={`/admin/monitoring?status=${k}`} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-subtle">
                    <span className={cn('h-2.5 w-2.5 rounded-full', TONE_STYLES[toneFor(k)].dot)} aria-hidden />
                    <span className="flex-1 text-sm text-ink-2">{k}</span>
                    <span className="text-xs text-ink-4 tabular">{total ? ((v / total) * 100).toFixed(1) : 0}%</span>
                    <span className="w-16 text-right text-sm font-semibold text-ink tabular">{formatNumber(v)}</span>
                    <ChevronRight className="h-4 w-4 text-ink-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </Card>
  )
}

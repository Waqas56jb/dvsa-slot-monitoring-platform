import { useState } from 'react'
import { Link } from 'react-router-dom'
import { History } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { ActivityFeed } from '@/components/common/ActivityTimeline'
import { SkeletonText } from '@/components/common/LoadingSkeleton'
import { EmptyState, ErrorState } from '@/components/common/States'
import { useAsync } from '@/hooks/useAsync'
import { useRealtime } from '@/hooks/useUtils'
import { useLiveMode } from '@/context/RealtimeContext'
import { activityService } from '@/services/activityService'
import { cn } from '@/utils/cn'

const LIMIT = 7

export function LiveActivityCard({ className }) {
  const { live, setLive, mock } = useLiveMode()
  const { data, loading, error, reload, setData } = useAsync(() => activityService.getRecentActivity(LIMIT), [])
  const [flash, setFlash] = useState(false)

  useRealtime('activity', (evt) => {
    setData((list) => (list ? [evt, ...list.filter((x) => x.id !== evt.id)].slice(0, LIMIT) : list))
    setFlash(true)
    setTimeout(() => setFlash(false), 900)
  })

  return (
    <Card
      className={cn('flex flex-col', className)}
      bodyClassName="flex-1"
      title={
        <span className="flex items-center gap-2">
          Live System Activity
          <span className={cn('relative flex h-2 w-2', !live && 'opacity-40')} aria-hidden>
            {live && <span className={cn('absolute inline-flex h-full w-full rounded-full bg-success-dot opacity-60', flash ? 'animate-ping' : '')} />}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success-dot" />
          </span>
        </span>
      }
      description={live ? 'Streaming events as they happen' : 'Live updates paused'}
      actions={
        <>
          {mock && (
            <button type="button" onClick={() => setLive(!live)} className="rounded-md px-2 py-1 text-xs font-medium text-ink-3 hover:bg-subtle hover:text-ink" aria-pressed={live}>
              {live ? 'Pause' : 'Resume'}
            </button>
          )}
          <Link to="/admin/activity" className="text-[13px] font-medium text-brand-600 hover:underline dark:text-brand-300">View all</Link>
        </>
      }
    >
      {loading ? <SkeletonText lines={8} /> : error ? <ErrorState compact onRetry={reload} message="Unable to load activity." /> : !data?.length ? (
        <EmptyState compact icon={History} title="No activity yet" description="Platform events will stream in here." />
      ) : (
        <ActivityFeed items={data} />
      )}
    </Card>
  )
}

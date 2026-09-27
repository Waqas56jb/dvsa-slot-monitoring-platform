import { Radar, Sparkles, History, Play, Plus } from 'lucide-react';
import { Button, Card, CardHeader, EmptyState, ErrorState, Skeleton, MonitoringPulse } from '@/components/ui';
import { SessionStatusBadge } from '@/components/dashboard/StatusBadges';
import { SlotRow } from '@/components/dashboard/SlotCard';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { slotService, activityService } from '@/services';
import { useResource } from '@/hooks';
import { MONITORING_INTERVALS } from '@/config/app';
import { formatRelative, formatDate } from '@/utils/format';
import { paths } from '@/routes/paths';
import { DetailList } from './LearnerInfoCards';

function ListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MonitoringStatusCard({ learner, onStart, busy }) {
  const s = learner.session;
  const interval = MONITORING_INTERVALS.find((i) => i.value === String(s?.interval))?.label;
  return (
    <Card as="section" aria-labelledby="card-mon">
      <CardHeader icon={Radar} title={<span id="card-mon">Monitoring status</span>} action={s ? <SessionStatusBadge status={s.status} /> : null} />
      {learner.isMonitoring || s ? (
        <>
          {learner.isMonitoring && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-brand-soft/50 px-4 py-3">
              <MonitoringPulse tone="brand" />
              <p className="text-sm font-medium text-brand-ink">Watching for matching slots</p>
            </div>
          )}
          <DetailList
            items={[
              { label: 'Session', value: s?.name },
              { label: 'Check interval', value: interval },
              { label: 'Last checked', value: s?.lastCheckedAt ? formatRelative(s.lastCheckedAt) : 'Not yet' },
              { label: 'Checks · matches', value: s ? `${s.checksCount ?? 0} · ${s.matchesCount ?? 0}` : null },
            ]}
          />
          {!learner.isMonitoring && (
            <Button className="mt-5" fullWidth leftIcon={Play} onClick={onStart} loading={busy}>
              Resume monitoring
            </Button>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-line-strong px-5 py-8 text-center">
          <p className="font-semibold text-ink">Not being monitored</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted">Start monitoring to get alerted the moment a matching slot appears.</p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <Button leftIcon={Play} onClick={onStart} loading={busy}>
              Start monitoring
            </Button>
            <Button variant="secondary" leftIcon={Plus} to={`${paths.newMonitoring}?learner=${learner.id}`}>
              New session
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function SlotHistoryCard({ learnerId }) {
  const { data, loading, error, reload } = useResource(() => slotService.list({ learnerId, status: 'all' }), [learnerId], { topics: ['slots'] });
  const slots = data || [];
  return (
    <Card as="section" aria-labelledby="card-slots">
      <CardHeader
        icon={Sparkles}
        title={<span id="card-slots">Slot history</span>}
        description={data ? `${slots.length} matching ${slots.length === 1 ? 'slot' : 'slots'} found` : undefined}
        action={
          slots.length > 0 ? (
            <Button variant="ghost" size="sm" to={paths.slots}>
              All slots
            </Button>
          ) : null
        }
      />
      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} className="py-8" />
      ) : slots.length === 0 ? (
        <EmptyState compact icon={Sparkles} title="No slots found yet" description="Matching slots for this learner will appear here." className="py-8" />
      ) : (
        <div className="-mx-3 space-y-0.5">
          {slots.slice(0, 6).map((s) => (
            <SlotRow key={s.id} slot={s} />
          ))}
        </div>
      )}
    </Card>
  );
}

export function LearnerActivityCard({ learnerId }) {
  const { data, loading, error, reload } = useResource(() => activityService.forLearner(learnerId, 10), [learnerId], { topics: ['activity'] });
  return (
    <Card as="section" aria-labelledby="card-activity">
      <CardHeader
        icon={History}
        title={<span id="card-activity">Activity</span>}
        description="Recent events for this learner."
        action={
          <Button variant="ghost" size="sm" to={paths.history}>
            Full history
          </Button>
        }
      />
      {loading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} className="py-8" />
      ) : !data?.length ? (
        <EmptyState compact icon={History} title="No activity yet" description="Changes and alerts for this learner will be logged here." className="py-8" />
      ) : (
        <>
          <ActivityTimeline items={data} />
          <p className="mt-4 text-xs text-subtle">Showing the latest {data.length} events · since {formatDate(data[data.length - 1].createdAt)}</p>
        </>
      )}
    </Card>
  );
}

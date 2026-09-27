import { ArrowRight, History } from 'lucide-react';
import { Card, Button, Skeleton, EmptyState, ErrorState } from '@/components/ui';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { activityService } from '@/services';
import { useResource } from '@/hooks';
import { paths } from '@/routes/paths';

/** Latest activity entries with a link to the full history. */
export function RecentActivityCard({ limit = 6 }) {
  const { data, loading, error, reload } = useResource(() => activityService.recent(limit), [limit], { topics: ['activity'] });

  return (
    <Card as="section" aria-labelledby="recent-activity-title" className="h-full">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id="recent-activity-title" className="text-base font-semibold text-ink">
          Recent Activity
        </h2>
        <Button variant="link" size="sm" to={paths.history} rightIcon={ArrowRight}>
          View history
        </Button>
      </div>

      {error && !data ? (
        <ErrorState className="py-10" title="Couldn’t load activity" error={error} onRetry={reload} />
      ) : loading && !data ? (
        <div className="space-y-5" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-9 rounded-xl" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState compact icon={History} title="No activity yet" description="Monitoring events, matches and learner changes will appear here." className="border-none bg-transparent" />
      ) : (
        <ActivityTimeline items={data} />
      )}
    </Card>
  );
}

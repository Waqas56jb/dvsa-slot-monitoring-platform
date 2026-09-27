import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus, Users, ChevronRight } from 'lucide-react';
import { Card, Button, Avatar, Skeleton, EmptyState, ErrorState } from '@/components/ui';
import { LearnerStatusBadge } from '@/components/dashboard/StatusBadges';
import { learnerService } from '@/services';
import { useResource } from '@/hooks';
import { paths } from '@/routes/paths';

/** Top learners with their current monitoring status. */
export function LearnersSnapshot({ limit = 5 }) {
  const { data, loading, error, reload } = useResource(() => learnerService.list(), [], { topics: ['learners'] });
  const learners = (data || []).slice(0, limit);

  return (
    <Card as="section" aria-labelledby="learners-snapshot-title" padded={false}>
      <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
        <div>
          <h2 id="learners-snapshot-title" className="text-base font-semibold text-ink">
            Learners snapshot
          </h2>
          {data && <p className="mt-0.5 text-sm text-muted">{data.length} on your account</p>}
        </div>
        <Button variant="link" size="sm" to={paths.learners} rightIcon={ArrowRight}>
          All learners
        </Button>
      </div>

      <div className="p-2 sm:p-3">
        {error && !data ? (
          <ErrorState className="m-2 py-10" title="Couldn’t load learners" error={error} onRetry={reload} />
        ) : loading && !data ? (
          <div className="space-y-1 p-2" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2.5">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-44" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : learners.length === 0 ? (
          <EmptyState
            compact
            className="m-2"
            icon={Users}
            title="No learners yet"
            description="Add a learner with their preferred centres, dates and times to start monitoring."
            action={
              <Button size="sm" leftIcon={UserPlus} to={paths.newLearner}>
                Add Learner
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-line/70">
            {learners.map((l) => (
              <li key={l.id}>
                <Link to={paths.learner(l.id)} className="group flex min-h-14 items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-surface-muted">
                  <Avatar name={l.fullName} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{l.fullName}</span>
                    <span className="block truncate text-xs text-muted">
                      {l.centres[0]?.name || 'No centre selected'}
                      {l.centres.length > 1 && ` +${l.centres.length - 1}`}
                      {l.newSlotCount > 0 && ` · ${l.newSlotCount} new`}
                    </span>
                  </span>
                  <LearnerStatusBadge status={l.status} size="sm" />
                  <ChevronRight className="hidden size-4 text-subtle transition-transform group-hover:translate-x-0.5 sm:block" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

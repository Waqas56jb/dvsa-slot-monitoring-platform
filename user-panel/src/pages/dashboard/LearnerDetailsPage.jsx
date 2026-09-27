import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pencil, Play, PauseCircle, Plus, Trash2, UserX } from 'lucide-react';
import { Avatar, Breadcrumbs, Button, EmptyState, ErrorState, Skeleton, SkeletonCard } from '@/components/ui';
import { LearnerStatusBadge } from '@/components/dashboard/StatusBadges';
import { ProfileCard, PreferencesCard, CentresCard, NotificationsCard } from '@/components/dashboard/learners/LearnerInfoCards';
import { MonitoringStatusCard, SlotHistoryCard, LearnerActivityCard } from '@/components/dashboard/learners/LearnerActivityCards';
import { useLearnerActions } from '@/components/dashboard/learners/useLearnerActions';
import { learnerService } from '@/services';
import { useDocumentTitle, useResource } from '@/hooks';
import { formatRelative } from '@/utils/format';
import { paths } from '@/routes/paths';

function DetailsSkeleton() {
  return (
    <div aria-busy="true">
      <div className="mb-8 flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} lines={4} />
        ))}
      </div>
      <span className="sr-only" role="status">
        Loading learner…
      </span>
    </div>
  );
}

const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);

export default function LearnerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: learner, setData, loading, error, reload } = useResource(() => learnerService.get(id), [id], {
    topics: ['learners', 'slots', 'monitoring'],
  });
  useDocumentTitle(learner ? learner.fullName : 'Learner');

  const { toggleMonitoring, requestDelete, togglingId, dialog } = useLearnerActions({
    onDeleted: () => navigate(paths.learners, { replace: true }),
  });

  const toggle = async () => {
    const updated = await toggleMonitoring(learner);
    if (updated) setData(updated);
  };

  if (loading) return <DetailsSkeleton />;
  if (error?.code === 'not_found' || (!error && !learner)) {
    return (
      <>
        <Breadcrumbs items={[{ label: 'Learners', to: paths.learners }, { label: 'Not found' }]} className="mb-6" />
        <EmptyState
          icon={UserX}
          title="Learner not found"
          description="This learner may have been removed, or the link is incorrect."
          action={<Button to={paths.learners}>Back to learners</Button>}
        />
      </>
    );
  }
  if (error) return <ErrorState title="Couldn't load this learner" error={error} onRetry={reload} />;

  const busy = togglingId === learner.id;

  return (
    <>
      <Breadcrumbs items={[{ label: 'Learners', to: paths.learners }, { label: learner.fullName }]} className="mb-4" />

      <header className="mb-6 flex flex-col gap-5 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={learner.fullName} size="xl" className="hidden sm:inline-flex" />
          <Avatar name={learner.fullName} size="lg" className="sm:hidden" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="truncate text-2xl font-bold tracking-tight text-ink sm:text-[28px]">{learner.fullName}</h1>
              <LearnerStatusBadge status={learner.status} />
            </div>
            <p className="mt-1 truncate text-sm text-muted">
              {learner.email} · Last alert {lowerFirst(formatRelative(learner.lastAlertAt))}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" leftIcon={Pencil} to={paths.editLearner(learner.id)} className="flex-1 sm:flex-none">
            Edit Learner
          </Button>
          <Button
            variant={learner.isMonitoring ? 'secondary' : 'primary'}
            leftIcon={learner.isMonitoring ? PauseCircle : Play}
            onClick={toggle}
            loading={busy}
            className="flex-1 sm:flex-none"
          >
            {learner.isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <Button variant="ghost" leftIcon={Plus} to={`${paths.newMonitoring}?learner=${learner.id}`} className="flex-1 sm:flex-none">
            New monitoring session
          </Button>
          <Button variant="danger-ghost" leftIcon={Trash2} onClick={() => requestDelete(learner)} className="flex-1 sm:flex-none">
            Delete
          </Button>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="grid gap-5 lg:grid-cols-2 lg:gap-6"
      >
        <div className="space-y-5 lg:space-y-6">
          <ProfileCard learner={learner} />
          <PreferencesCard learner={learner} />
          <CentresCard learner={learner} />
          <NotificationsCard learner={learner} />
        </div>
        <div className="space-y-5 lg:space-y-6">
          <MonitoringStatusCard learner={learner} onStart={toggle} busy={busy} />
          <SlotHistoryCard learnerId={learner.id} />
          <LearnerActivityCard learnerId={learner.id} />
        </div>
      </motion.div>
      {dialog}
    </>
  );
}

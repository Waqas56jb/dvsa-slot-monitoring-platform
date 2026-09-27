import { useParams } from 'react-router-dom'
import { GitCommitVertical, IdCard, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Avatar } from '@/components/common/Avatar'
import { Card } from '@/components/common/Card'
import { StatusBadge } from '@/components/common/StatusBadge'
import { DescriptionList, MetricStrip } from '@/components/common/DescriptionList'
import { CopyId, MaskedValue } from '@/components/common/Misc'
import { ActivityTimeline } from '@/components/common/ActivityTimeline'
import { SkeletonDetail } from '@/components/common/LoadingSkeleton'
import { useAsync } from '@/hooks/useAsync'
import { usePermission } from '@/context/AdminAuthContext'
import { useToast } from '@/context/NotificationContext'
import { learnerService } from '@/services/learnerService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { formatDate, formatDateTime, formatNumber } from '@/utils/format'
import { DetailError } from '@/pages/admin/users/detailShared'
import { ReferenceStatusBadge } from './learnerUi'
import { LearnerNotificationsCard, LearnerSlotsTable, LearnerUserCard, MonitoringConfigCard } from './LearnerSections'

export default function LearnerDetailPage() {
  const { id } = useParams()
  const can = usePermission()
  const toast = useToast()
  const { data: learner, loading, error, reload } = useAsync(() => learnerService.getLearnerById(id), [id])

  if (loading && !learner) return <SkeletonDetail />
  if (error || !learner) {
    return (
      <>
        <PageHeader title="Learner" back={{ to: '/admin/learners', label: 'Learners' }} />
        <DetailError error={error} entity="Learner" onRetry={reload} backTo="/admin/learners" backLabel="Back to learners" />
      </>
    )
  }

  const jobs = learner.monitoring || []
  const slots = learner.slots || []
  const notifications = learner.notifications || []
  const reveal = async () => {
    try {
      return await learnerService.revealReference(learner.id)
    } catch (err) {
      toast.error(err?.message || 'Unable to reveal the reference. Please try again.')
      return null
    }
  }
  const running = jobs.filter((j) => j.status === 'Running').length

  return (
    <>
      <PageHeader
        title={learner.name}
        documentTitle={`${learner.name} · Learners`}
        back={{ to: '/admin/learners', label: 'Learners' }}
        leading={<Avatar name={learner.name} size="lg" />}
        meta={
          <>
            <StatusBadge status={learner.status} />
            <ReferenceStatusBadge status={learner.referenceStatus} />
          </>
        }
        description={`${learner.relationship} · ${learner.testType}${learner.user ? ` · Linked to ${learner.user.name}` : ''}`}
        actions={learner.user && <Button icon={UserRound} to={`/admin/users/${learner.user.id}`}>View user</Button>}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 space-y-6 xl:col-span-2">
          <MetricStrip
            className="bg-surface"
            items={[
              { label: 'Monitoring jobs', value: formatNumber(jobs.length), hint: `${running} running` },
              { label: 'Preferred centres', value: formatNumber(learner.centres.length) },
              { label: 'Slots detected', value: formatNumber(slots.length) },
              { label: 'Alerts sent', value: formatNumber(notifications.filter((n) => n.status !== 'Queued').length) },
            ]}
          />

          <Card title="Learner information" icon={IdCard}>
            <DescriptionList
              items={[
                { label: 'Full name', value: learner.name },
                { label: 'Learner ID', value: <CopyId value={learner.id} /> },
                { label: 'Relationship to account holder', value: learner.relationship },
                { label: 'Test type', value: learner.testType },
                {
                  label: 'Licence / reference',
                  value: (
                    <span className="flex flex-col items-start gap-1">
                      <MaskedValue masked={learner.licenceMasked} onReveal={reveal} canReveal={can(P.LEARNERS_REVEAL)} />
                      <span className="text-xs text-ink-4">{can(P.LEARNERS_REVEAL) ? 'Revealing is recorded in the audit log.' : 'Masked for privacy.'}</span>
                    </span>
                  ),
                },
                { label: 'Reference status', value: <ReferenceStatusBadge status={learner.referenceStatus} /> },
                { label: 'Status', value: <StatusBadge status={learner.status} /> },
                { label: 'Created', value: <time dateTime={learner.createdAt} title={formatDateTime(learner.createdAt)}>{formatDate(learner.createdAt)}</time> },
              ]}
            />
          </Card>

          <MonitoringConfigCard learner={learner} />
          <LearnerSlotsTable slots={slots} />
        </div>

        <aside className="min-w-0 space-y-6" aria-label="Learner context">
          <LearnerUserCard user={learner.user} />
          <Card title="Lifecycle" description="Key events for this learner, newest first." icon={GitCommitVertical}>
            <ActivityTimeline events={learner.timeline} emptyLabel="No lifecycle events yet." />
          </Card>
          <LearnerNotificationsCard notifications={notifications} />
        </aside>
      </div>
    </>
  )
}

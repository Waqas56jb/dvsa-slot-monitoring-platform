import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertTriangle, Pause, Pencil, Play, RefreshCw, Square, TerminalSquare } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SkeletonDetail } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/States'
import { Tooltip } from '@/components/common/Tooltip'
import { LogStream } from '@/components/monitoring/LogStream'
import { StatsCard, PreferencesCard, UserCard, LearnerCard, CentresCard, JobActivityTabs } from './JobDetailPanels'
import { JobEditModal } from './JobEditModal'
import { useJobActions } from './useJobActions'
import { useAsync } from '@/hooks/useAsync'
import { usePermission } from '@/context/AdminAuthContext'
import { useToast } from '@/context/NotificationContext'
import { monitoringService } from '@/services/monitoringService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { formatDate, formatRelative } from '@/utils/format'

const LOG_ANCHOR = 'job-live-activity'

export default function MonitoringDetailPage() {
  const { id } = useParams()
  const can = usePermission()
  const toast = useToast()
  const { data: job, loading, error, reload, setData } = useAsync(() => monitoringService.getJobById(id), [id])
  const [editing, setEditing] = useState(false)
  const [checking, setChecking] = useState(false)

  const merge = (updated) => setData((d) => ({ ...d, ...updated }))
  const actions = useJobActions(merge)

  if (loading && !job) return <SkeletonDetail />
  if (error || !job) {
    const missing = error?.status === 404
    return (
      <div className="card">
        <ErrorState
          title={missing ? 'Monitoring job not found' : 'Unable to load monitoring job.'}
          message={missing ? `We couldn’t find a monitoring job with ID ${id}. It may have been removed.` : 'Unable to load this monitoring job. Please try again.'}
          onRetry={missing ? undefined : reload}
          showBack
        />
      </div>
    )
  }

  const running = job.status === 'Running'
  const canCheck = can(P.MONITORING_PAUSE) || can(P.MONITORING_EDIT)
  const canEdit = can(P.MONITORING_EDIT) && !['Cancelled', 'Completed', 'Expired'].includes(job.status)

  const runCheck = async () => {
    setChecking(true)
    try {
      const updated = await monitoringService.triggerCheck(job.id)
      merge({ lastChecked: updated.lastChecked, nextCheck: updated.nextCheck, checksCount: updated.checksCount })
      toast.success('Check completed. Last checked time updated.')
    } catch (err) {
      toast.error(err?.message || 'Unable to run a check. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  const viewLogs = () => {
    const el = document.getElementById(LOG_ANCHOR)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    el.focus({ preventScroll: true })
  }

  const refreshButton = (
    <Button icon={RefreshCw} onClick={runCheck} loading={checking} disabled={!running}>Refresh</Button>
  )

  return (
    <>
      <PageHeader
        back={{ to: '/admin/monitoring', label: 'Monitoring' }}
        title={`Monitoring Job #${job.id}`}
        documentTitle={job.id}
        meta={<StatusBadge status={job.status} pulse={running} />}
        description={`${job.learner?.name || 'Unknown learner'} · ${job.user?.name || 'Unknown user'} · created ${formatDate(job.createdAt)}`}
        actions={
          <>
            <Button icon={TerminalSquare} variant="ghost" onClick={viewLogs}>View logs</Button>
            {canCheck && (running ? refreshButton : <Tooltip content="Checks only run while the job is running"><span className="inline-flex">{refreshButton}</span></Tooltip>)}
            {canEdit && <Button icon={Pencil} onClick={() => setEditing(true)}>Edit</Button>}
            {actions.canPause(job) && <Button icon={Pause} onClick={() => actions.pause(job)}>Pause</Button>}
            {actions.canResume(job) && <Button variant="primary" icon={Play} onClick={() => actions.resume(job)}>Resume</Button>}
            {actions.canStop(job) && <Button variant="danger-ghost" icon={Square} onClick={() => actions.stop(job)}>Stop</Button>}
          </>
        }
      />

      {job.status === 'Failed' && (
        <div role="alert" className="mb-6 flex flex-col gap-3 rounded-card border border-danger/20 bg-danger-soft p-4 sm:flex-row sm:items-center">
          <AlertTriangle className="h-5 w-5 shrink-0 text-danger" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-danger">This monitoring job has failed</p>
            <p className="mt-0.5 text-[13px] text-ink-2">
              {job.failureReason || 'The backend stopped checking after repeated errors.'}
              {job.updatedAt && <span className="text-ink-3"> · {formatRelative(job.updatedAt)}</span>}
            </p>
          </div>
          {actions.canResume(job) && <Button size="sm" variant="primary" icon={Play} onClick={() => actions.resume(job)} className="self-start sm:self-auto">Resume monitoring</Button>}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 space-y-6 xl:col-span-2">
          <StatsCard job={job} />
          <PreferencesCard job={job} />
          <LogStream id={LOG_ANCHOR} jobId={job.id} live={running} />
          <JobActivityTabs job={job} />
        </div>
        <div className="min-w-0 space-y-6">
          <UserCard user={job.user} />
          <LearnerCard learner={job.learner} />
          <CentresCard centres={job.centres} />
        </div>
      </div>

      <JobEditModal open={editing} job={job} onClose={() => setEditing(false)} onSaved={merge} />
      {actions.confirmElement}
    </>
  )
}

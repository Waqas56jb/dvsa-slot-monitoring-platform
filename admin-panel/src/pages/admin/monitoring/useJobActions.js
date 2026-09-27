import { useCallback } from 'react'
import { useConfirm } from '@/components/modals/ConfirmModal'
import { useToast } from '@/context/NotificationContext'
import { usePermission } from '@/context/AdminAuthContext'
import { monitoringService } from '@/services/monitoringService'
import { PERMISSIONS as P } from '@/constants/permissions'

/** Allowed transitions — mirrors the service/backend state machine. */
export const canPauseStatus = (s) => s === 'Running' || s === 'Failed'
export const canResumeStatus = (s) => s === 'Paused' || s === 'Failed'
export const canStopStatus = (s) => s === 'Running' || s === 'Paused' || s === 'Failed'

/**
 * Pause / resume / stop with confirmation, toasts and permission checks.
 * onUpdated(updatedJob) is called after a successful transition so the caller
 * can patch its local state immediately.
 */
export function useJobActions(onUpdated) {
  const can = usePermission()
  const toast = useToast()
  const { confirm, confirmElement } = useConfirm()

  const pause = useCallback((job) => confirm({
    title: `Pause ${job.id}?`,
    description: 'Checks stop immediately and no alerts are sent until the job is resumed. The customer can see that it was paused.',
    confirmLabel: 'Pause monitoring',
    tone: 'warning',
    requireReason: true,
    onConfirm: async (reason) => {
      const updated = await monitoringService.pauseJob(job.id, { reason })
      onUpdated?.(updated)
      toast.success('Monitoring job paused.')
    },
  }), [confirm, onUpdated, toast])

  const resume = useCallback(async (job) => {
    try {
      const updated = await monitoringService.resumeJob(job.id)
      onUpdated?.(updated)
      toast.success('Monitoring job resumed.')
    } catch (err) {
      toast.error(err?.message || 'Unable to resume this job.')
    }
  }, [onUpdated, toast])

  const stop = useCallback((job) => confirm({
    title: `Stop ${job.id}?`,
    description: 'This cancels the job permanently. The customer will need to create a new monitoring job to start again.',
    confirmLabel: 'Stop monitoring',
    tone: 'danger',
    requireReason: true,
    onConfirm: async (reason) => {
      const updated = await monitoringService.stopJob(job.id, { reason })
      onUpdated?.(updated)
      toast.success('Monitoring job stopped.')
    },
  }), [confirm, onUpdated, toast])

  return {
    pause,
    resume,
    stop,
    confirm,
    confirmElement,
    canPause: (job) => can(P.MONITORING_PAUSE) && canPauseStatus(job.status),
    canResume: (job) => can(P.MONITORING_PAUSE) && canResumeStatus(job.status),
    canStop: (job) => can(P.MONITORING_STOP) && canStopStatus(job.status),
  }
}

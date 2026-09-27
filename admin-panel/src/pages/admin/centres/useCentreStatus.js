import { useCallback } from 'react'
import { useConfirm } from '@/components/modals/ConfirmModal'
import { useToast } from '@/context/NotificationContext'
import { centreService } from '@/services/centreService'
import { pluralize } from '@/utils/format'

/**
 * Activate / deactivate a centre. Deactivating needs confirmation because it
 * stops checks for every monitoring job that includes the centre.
 * onUpdated(centre) is called with the updated record.
 */
export function useCentreStatus(onUpdated) {
  const toast = useToast()
  const { confirm, confirmElement } = useConfirm()

  const activate = useCallback(async (c) => {
    try {
      const updated = await centreService.setCentreStatus(c.id, 'Active')
      onUpdated?.(updated)
      toast.success(`${c.shortName || c.name} activated. Monitoring will resume on the next cycle.`)
    } catch (err) {
      toast.error(err?.message || 'Unable to activate this centre.')
    }
  }, [onUpdated, toast])

  const deactivate = useCallback((c) => confirm({
    title: `Deactivate ${c.shortName || c.name}?`,
    description: `Checks for this centre stop immediately${c.monitoringJobs ? ` — this affects ${pluralize(c.monitoringJobs, 'running monitoring job')}` : ''}. Users can’t add it to new jobs until it’s reactivated.`,
    confirmLabel: 'Deactivate centre',
    tone: 'danger',
    onConfirm: async () => {
      const updated = await centreService.setCentreStatus(c.id, 'Inactive')
      onUpdated?.(updated)
      toast.success('Test centre deactivated.')
    },
  }), [confirm, onUpdated, toast])

  const setActive = useCallback((c, active) => (active ? activate(c) : deactivate(c)), [activate, deactivate])

  return { activate, deactivate, setActive, confirmElement }
}

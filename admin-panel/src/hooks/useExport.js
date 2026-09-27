import { useCallback, useState } from 'react'
import { downloadCSV, exportStamp } from '@/utils/csv'
import { useToast } from '@/context/NotificationContext'

/**
 * Wraps a service export call + CSV download + toasts.
 * const { exporting, runExport } = useExport()
 * runExport({ name: 'users', fetch: () => userService.exportUsers(query), columns })
 */
export function useExport() {
  const toast = useToast()
  const [exporting, setExporting] = useState(false)
  const runExport = useCallback(async ({ name, fetch, columns }) => {
    setExporting(true)
    try {
      const rows = await fetch()
      if (!rows?.length) { toast.warning('Nothing to export for the current filters.'); return }
      downloadCSV(`slotpilot-${name}-${exportStamp()}.csv`, rows, columns)
      toast.success(`Export generated — ${rows.length.toLocaleString('en-GB')} rows.`)
    } catch (e) {
      toast.error(e?.message || 'Unable to complete export.')
    } finally {
      setExporting(false)
    }
  }, [toast])
  return { exporting, runExport }
}

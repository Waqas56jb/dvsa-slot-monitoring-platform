import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BellRing, CalendarSearch, Radar, RotateCw, User } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Identity } from '@/components/common/Avatar'
import { Tabs } from '@/components/common/Tabs'
import { CopyId, EntityLink } from '@/components/common/Misc'
import { DataTable } from '@/components/tables/DataTable'
import { FilterBar, buildChips } from '@/components/tables/FilterBar'
import { FilterDropdown } from '@/components/tables/FilterDropdown'
import { useListQuery } from '@/hooks/useListQuery'
import { useAsync } from '@/hooks/useAsync'
import { useNow } from '@/hooks/useUtils'
import { usePermission } from '@/context/AdminAuthContext'
import { useToast } from '@/context/NotificationContext'
import { notificationService, NOTIFICATION_TABS, NOTIFICATION_TYPES } from '@/services/notificationService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { ALERT_STATUSES, NOTIFICATION_CHANNELS } from '@/constants/status'
import { formatDateTime, formatRelative, pluralize } from '@/utils/format'
import { ChannelLabel } from './ChannelLabel'

const FILTER_KEYS = ['channel', 'type', 'status']
const TAB_DEFS = [
  { value: 'all', label: 'All' },
  { value: 'successful', label: 'Successful' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

export default function NotificationsPage() {
  const can = usePermission()
  const toast = useToast()
  const now = useNow(15000)
  const [params, setParams] = useSearchParams()
  const tab = NOTIFICATION_TABS[params.get('tab')] !== undefined ? params.get('tab') : 'all'
  const [selected, setSelected] = useState([])
  const [retrying, setRetrying] = useState(() => new Set())
  const timers = useRef([])
  const canManage = can(P.NOTIFICATIONS_MANAGE)

  const list = useListQuery(notificationService.getNotifications, {
    filterKeys: FILTER_KEYS, arrayKeys: ['channel', 'type', 'status'], defaultSort: 'createdAt', extraFilters: { tab },
  })
  const counts = useAsync(() => notificationService.getCounts(), [])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const setTab = (value) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === 'all') next.delete('tab')
      else next.set('tab', value)
      next.delete('status') // status filter is scoped to the tab
      return next
    }, { replace: true })
    list.setPage(1)
    setSelected([])
  }

  const refreshSoon = useCallback(() => {
    counts.reload({ silent: true })
    // Mock delivery completes a few seconds after a retry — refresh quietly.
    timers.current.push(setTimeout(() => { list.reload({ silent: true }); counts.reload({ silent: true }) }, 4500))
  }, [counts, list])

  const retry = async (n) => {
    setRetrying((s) => new Set(s).add(n.id))
    try {
      const updated = await notificationService.retryNotification(n.id)
      list.patchRow(n.id, { status: updated.status, error: null, attempts: updated.attempts })
      toast.success('Notification re-queued for delivery.')
      refreshSoon()
    } catch (e) {
      toast.error(e?.message || 'Unable to retry notification.')
    } finally {
      setRetrying((s) => { const x = new Set(s); x.delete(n.id); return x })
    }
  }

  const retryMany = async (ids, clear) => {
    const failed = list.rows.filter((r) => ids.includes(r.id) && r.status === 'Failed')
    if (!failed.length) { toast.warning('None of the selected notifications have failed.'); return }
    const results = await Promise.allSettled(failed.map((n) => notificationService.retryNotification(n.id)))
    const ok = results.filter((r) => r.status === 'fulfilled').length
    failed.forEach((n, i) => { if (results[i].status === 'fulfilled') list.patchRow(n.id, { status: 'Queued', error: null }) })
    clear()
    if (ok === failed.length) toast.success(`${pluralize(ok, 'notification')} re-queued for delivery.`)
    else toast.error(`${ok} of ${failed.length} notifications re-queued. Please try the rest again.`)
    refreshSoon()
  }

  const columns = [
    { key: 'id', header: 'Notification ID', sortable: true, cell: (n) => <CopyId value={n.id} /> },
    {
      key: 'userName', header: 'User', sortable: true,
      cell: (n) => (n.user ? <EntityLink to={`/admin/users/${n.user.id}`} className="block max-w-[180px] truncate">{n.user.name}</EntityLink> : <span className="text-ink-4">—</span>),
    },
    { key: 'type', header: 'Type', sortable: true, cell: (n) => <span className="whitespace-nowrap text-ink-2">{n.type}</span> },
    { key: 'channel', header: 'Channel', sortable: true, cell: (n) => <ChannelLabel channel={n.channel} /> },
    {
      key: 'message', header: 'Message', mobile: 'primary', hideable: false,
      cell: (n) => (
        <span className="block min-w-0 max-w-[320px]">
          <span className="block truncate text-ink" title={n.message}>{n.message}</span>
          {n.status === 'Failed' && n.error && (
            <span className="mt-0.5 block truncate text-xs text-danger" title={n.error}>{n.error}{n.attempts > 1 ? ` · ${n.attempts} attempts` : ''}</span>
          )}
        </span>
      ),
    },
    { key: 'status', header: 'Status', sortable: true, mobile: 'badge', cell: (n) => <StatusBadge status={n.status} pulse={n.status === 'Queued'} /> },
    { key: 'createdAt', header: 'Created', sortable: true, cell: (n) => <time dateTime={n.createdAt} title={formatDateTime(n.createdAt)} className="whitespace-nowrap text-ink-3 tabular">{formatRelative(n.createdAt, now)}</time> },
    { key: 'deliveredAt', header: 'Delivered', sortable: true, cell: (n) => <span className="whitespace-nowrap text-ink-3 tabular">{n.deliveredAt ? formatDateTime(n.deliveredAt) : '—'}</span> },
  ]

  const rowActions = (n) => [
    { label: retrying.has(n.id) ? 'Retrying…' : 'Retry delivery', icon: RotateCw, onSelect: () => retry(n), hidden: n.status !== 'Failed' || !canManage, disabled: retrying.has(n.id) },
    { label: 'View user', icon: User, to: `/admin/users/${n.userId}`, hidden: !n.userId },
    { label: 'View slot', icon: CalendarSearch, to: `/admin/slots/${n.slotId}`, hidden: !n.slotId },
    { label: 'View monitoring job', icon: Radar, to: `/admin/monitoring/${n.monitoringId}`, hidden: !n.monitoringId },
  ]

  const chips = buildChips(list, { channel: { label: 'Channel' }, type: { label: 'Type' }, status: { label: 'Status' } })
  const statusOptions = NOTIFICATION_TABS[tab] || ALERT_STATUSES
  const tabs = TAB_DEFS.map((t) => ({ ...t, count: counts.data?.[t.value] }))
  const bulkEnabled = canManage && tab === 'failed'

  return (
    <>
      <PageHeader title="Notifications" description="Alerts and account messages sent to platform users across every channel." />

      <Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-4" />

      <DataTable
        caption="User notifications"
        columns={columns}
        rows={list.rows}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        total={list.total}
        page={list.page}
        pageSize={list.pageSize}
        onPageChange={list.setPage}
        onPageSizeChange={list.setPageSize}
        sort={list.sort}
        onSort={list.setSort}
        selectable={bulkEnabled}
        selectedIds={selected}
        onSelectionChange={setSelected}
        bulkActions={(ids, clear) => <Button size="sm" icon={RotateCw} onClick={() => retryMany(ids, clear)}>Retry selected</Button>}
        rowActions={rowActions}
        filtered={list.activeFilterCount > 0}
        onResetFilters={list.resetFilters}
        emptyIcon={BellRing}
        emptyTitle={tab === 'failed' ? 'No failed notifications' : tab === 'pending' ? 'Nothing waiting to send' : 'No notifications yet'}
        emptyDescription={tab === 'failed' ? 'Every notification has been delivered successfully.' : 'Notifications appear here as alerts and account messages are sent.'}
        toolbar={
          <FilterBar
            search={list.searchInput}
            onSearch={list.setSearchInput}
            searchPlaceholder="Search ID, user, message…"
            chips={chips}
            onReset={list.resetFilters}
            filters={
              <>
                <FilterDropdown label="Channel" options={NOTIFICATION_CHANNELS} value={list.filters.channel} onChange={(v) => list.setFilter('channel', v)} />
                <FilterDropdown label="Type" options={NOTIFICATION_TYPES} value={list.filters.type} onChange={(v) => list.setFilter('type', v)} />
                {statusOptions.length > 1 && <FilterDropdown label="Status" options={statusOptions} value={list.filters.status} onChange={(v) => list.setFilter('status', v)} />}
              </>
            }
          />
        }
      />
    </>
  )
}

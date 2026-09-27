import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, CalendarSearch, Download, Eye, Radar, User } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Badge, StatusBadge } from '@/components/common/StatusBadge'
import { CopyId, EntityLink } from '@/components/common/Misc'
import { DataTable } from '@/components/tables/DataTable'
import { FilterBar, buildChips } from '@/components/tables/FilterBar'
import { FilterDropdown } from '@/components/tables/FilterDropdown'
import { PermissionGate } from '@/routes/guards'
import { useListQuery } from '@/hooks/useListQuery'
import { useExport } from '@/hooks/useExport'
import { useNow, useRealtime } from '@/hooks/useUtils'
import { useLiveMode } from '@/context/RealtimeContext'
import { slotService } from '@/services/slotService'
import { centreService } from '@/services/centreService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { SLOT_STATUSES, ALERT_STATUSES } from '@/constants/status'
import { formatDateTime, formatDayDate, formatRelative, pluralize } from '@/utils/format'
import { useSlotStatusAction, SlotLifecycleLegend } from './slotStatus'

const FILTER_KEYS = ['centreId', 'testDate', 'timeOfDay', 'status', 'alertStatus', 'detected']
const TEST_DATE = [{ value: '7', label: 'Next 7 days' }, { value: '14', label: 'Next 14 days' }, { value: '30', label: 'Next 30 days' }]
const TIME_OF_DAY = [{ value: 'morning', label: 'Morning (before 12:00)' }, { value: 'afternoon', label: 'Afternoon (12:00 onwards)' }]
const DETECTED = [{ value: '1h', label: 'Last hour' }, { value: '24h', label: 'Last 24 hours' }, { value: '7d', label: 'Last 7 days' }]
const labelOf = (opts) => (v) => opts.find((o) => o.value === v)?.label ?? v

const EXPORT_COLUMNS = [
  { label: 'Slot ID', key: 'id' }, { label: 'Centre', value: (s) => s.centre?.name }, { label: 'Test date', key: 'testDate' }, { label: 'Test time', key: 'testTime' },
  { label: 'User', value: (s) => s.user?.name }, { label: 'User ID', key: 'userId' }, { label: 'Learner', value: (s) => s.learner?.name },
  { label: 'Monitoring job', key: 'monitoringId' }, { label: 'Detected at', key: 'detectedAt' }, { label: 'Status', key: 'status' },
  { label: 'Alert status', key: 'alertStatus' }, { label: 'Source status', key: 'sourceStatus' }, { label: 'Detection latency (ms)', key: 'latencyMs' },
]

export default function SlotsPage() {
  const navigate = useNavigate()
  const now = useNow(15000)
  const { live } = useLiveMode()
  const { exporting, runExport } = useExport()
  const { menuItems, confirmElement } = useSlotStatusAction()
  const [centres, setCentres] = useState([])
  const [newCount, setNewCount] = useState(0)

  const list = useListQuery(slotService.getSlots, { filterKeys: FILTER_KEYS, arrayKeys: ['centreId', 'status', 'alertStatus'], defaultSort: 'detectedAt' })

  useEffect(() => {
    let cancelled = false
    centreService.getAllCentres().then((c) => { if (!cancelled) setCentres(c) }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  useRealtime('slot', () => setNewCount((n) => n + 1))

  const showNew = useCallback(() => {
    setNewCount(0)
    list.setPage(1)
    list.reload()
  }, [list])

  const centreOptions = centres.map((c) => ({ value: c.id, label: c.shortName || c.name }))
  const centreLabel = (id) => centres.find((c) => c.id === id)?.shortName ?? id

  const exportRows = () => runExport({ name: 'slots', columns: EXPORT_COLUMNS, fetch: () => slotService.exportSlots(list.query) })

  const columns = [
    { key: 'id', header: 'Slot ID', sortable: true, mobile: 'hidden', cell: (s) => <CopyId value={s.id} to={`/admin/slots/${s.id}`} /> },
    {
      key: 'centreName', header: 'Centre', sortable: true, mobile: 'primary', hideable: false,
      cell: (s) => (
        <span className="block min-w-0 max-w-[220px]">
          {s.centre ? <EntityLink to={`/admin/test-centres/${s.centre.id}`} className="block truncate font-medium">{s.centre.shortName || s.centre.name}</EntityLink> : <span className="text-ink-4">Unknown centre</span>}
          <span className="block truncate text-xs text-ink-3 md:hidden">{s.id}</span>
          {s.centre?.city && <span className="hidden truncate text-xs text-ink-3 md:block">{s.centre.city}</span>}
        </span>
      ),
    },
    { key: 'testDate', header: 'Test date', sortable: true, cell: (s) => <span className="whitespace-nowrap text-ink tabular">{formatDayDate(s.testDate)}</span> },
    { key: 'testTime', header: 'Test time', sortable: true, cell: (s) => <span className="font-mono text-[12.5px] text-ink">{s.testTime}</span> },
    { key: 'userName', header: 'User', sortable: true, cell: (s) => (s.user ? <EntityLink to={`/admin/users/${s.user.id}`} className="block max-w-[180px] truncate">{s.user.name}</EntityLink> : <span className="text-ink-4">—</span>) },
    { key: 'learnerName', header: 'Learner', sortable: true, cell: (s) => (s.learner ? <EntityLink to={`/admin/learners/${s.learner.id}`} className="block max-w-[160px] truncate text-ink-2">{s.learner.name}</EntityLink> : <span className="text-ink-4">—</span>) },
    {
      key: 'monitoringId', header: 'Monitoring job', sortable: true, mobile: 'hidden',
      cell: (s) => (
        <span className="inline-flex items-center gap-1.5">
          <EntityLink to={`/admin/monitoring/${s.monitoringId}`} mono>{s.monitoringId}</EntityLink>
          {s.matchedJobIds?.length > 1 && <Badge size="sm" tone="neutral">+{s.matchedJobIds.length - 1}</Badge>}
        </span>
      ),
    },
    {
      key: 'detectedAt', header: 'Detected', sortable: true,
      cell: (s) => <time dateTime={s.detectedAt} title={formatDateTime(s.detectedAt)} className="whitespace-nowrap text-ink-3 tabular">{formatRelative(s.detectedAt, now)}</time>,
    },
    { key: 'status', header: 'Status', sortable: true, mobile: 'badge', cell: (s) => <StatusBadge status={s.status} /> },
    { key: 'alertStatus', header: 'Alert', sortable: true, cell: (s) => <StatusBadge status={s.alertStatus} size="sm" /> },
  ]

  const rowActions = (s) => {
    const mark = menuItems(s, (updated) => list.patchRow(s.id, { status: updated.status, updatedAt: updated.updatedAt }))
    return [
      { label: 'View slot', icon: Eye, to: `/admin/slots/${s.id}` },
      { label: 'View user', icon: User, to: `/admin/users/${s.userId}`, hidden: !s.userId },
      { label: 'View monitoring job', icon: Radar, to: `/admin/monitoring/${s.monitoringId}`, hidden: !s.monitoringId },
      ...(mark.length ? [{ type: 'separator' }, ...mark] : []),
    ]
  }

  const chips = buildChips(list, {
    centreId: { label: 'Centre', format: centreLabel },
    testDate: { label: 'Test date', format: labelOf(TEST_DATE) },
    timeOfDay: { label: 'Time', format: labelOf(TIME_OF_DAY) },
    status: { label: 'Status' },
    alertStatus: { label: 'Alert' },
    detected: { label: 'Detected', format: labelOf(DETECTED) },
  })

  return (
    <>
      <PageHeader
        title="Slots"
        description="Every test slot detected by monitoring, and what happened next."
        meta={live ? <Badge tone="success" dot pulse>Live</Badge> : null}
        actions={
          <PermissionGate permission={P.EXPORT}>
            <Button icon={Download} onClick={exportRows} loading={exporting}>Export</Button>
          </PermissionGate>
        }
      />

      <SlotLifecycleLegend className="mb-4" />

      <AnimatePresence initial={false}>
        {newCount > 0 && (
          <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -6, height: 0 }} className="flex justify-center overflow-hidden">
            <button
              type="button"
              onClick={showNew}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-[13px] font-medium text-brand-700 shadow-card transition-colors hover:bg-brand-100 dark:text-brand-300"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" aria-hidden />
              {pluralize(newCount, 'new slot')} detected
              <span className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-300">· Show <ArrowUp className="h-3.5 w-3.5" aria-hidden /></span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="sr-only" aria-live="polite">{newCount > 0 ? `${pluralize(newCount, 'new slot')} detected.` : ''}</p>

      <DataTable
        caption="Detected slots"
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
        onRowClick={(s) => navigate(`/admin/slots/${s.id}`)}
        rowActions={rowActions}
        filtered={list.activeFilterCount > 0}
        onResetFilters={list.resetFilters}
        emptyIcon={CalendarSearch}
        emptyTitle="No slots detected yet"
        emptyDescription="Slots appear here as soon as monitoring finds availability matching a user’s preferences."
        toolbar={
          <FilterBar
            search={list.searchInput}
            onSearch={list.setSearchInput}
            searchPlaceholder="Search slot ID, centre, user, learner…"
            chips={chips}
            onReset={list.resetFilters}
            filters={
              <>
                <FilterDropdown label="Centre" options={centreOptions} value={list.filters.centreId} onChange={(v) => list.setFilter('centreId', v)} searchable width={260} />
                <FilterDropdown label="Test date" multiple={false} options={TEST_DATE} value={list.filters.testDate} onChange={(v) => list.setFilter('testDate', v)} />
                <FilterDropdown label="Time" multiple={false} options={TIME_OF_DAY} value={list.filters.timeOfDay} onChange={(v) => list.setFilter('timeOfDay', v)} width={248} />
                <FilterDropdown label="Status" options={SLOT_STATUSES} value={list.filters.status} onChange={(v) => list.setFilter('status', v)} />
                <FilterDropdown label="Alert" options={ALERT_STATUSES} value={list.filters.alertStatus} onChange={(v) => list.setFilter('alertStatus', v)} />
                <FilterDropdown label="Detected" multiple={false} options={DETECTED} value={list.filters.detected} onChange={(v) => list.setFilter('detected', v)} />
              </>
            }
          />
        }
      />
      {confirmElement}
    </>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, MapPin, Pencil, Plus, Power, PowerOff } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Toggle } from '@/components/forms/Fields'
import { DataTable } from '@/components/tables/DataTable'
import { FilterBar, buildChips } from '@/components/tables/FilterBar'
import { FilterDropdown } from '@/components/tables/FilterDropdown'
import { PermissionGate } from '@/routes/guards'
import { AvailabilityMeter, AVAILABILITY_LEVELS } from '@/components/monitoring/AvailabilityMeter'
import { CentreFormModal } from './CentreFormModal'
import { useCentreStatus } from './useCentreStatus'
import { useListQuery } from '@/hooks/useListQuery'
import { useNow } from '@/hooks/useUtils'
import { usePermission } from '@/context/AdminAuthContext'
import { centreService } from '@/services/centreService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { CENTRE_STATUSES, REGIONS } from '@/constants/status'
import { formatDateTime, formatNumber, formatRelative } from '@/utils/format'

const FILTER_KEYS = ['region', 'status', 'availability']

export default function TestCentresPage() {
  const navigate = useNavigate()
  const can = usePermission()
  const canManage = can(P.CENTRES_MANAGE)
  const now = useNow(10000)
  const [params, setParams] = useSearchParams()
  const [form, setForm] = useState({ open: false, centre: null })
  const [busyId, setBusyId] = useState(null)

  const list = useListQuery(centreService.getCentres, { filterKeys: FILTER_KEYS, arrayKeys: ['region', 'status', 'availability'], defaultSort: 'name', defaultOrder: 'asc' })
  const status = useCentreStatus((c) => list.patchRow(c.id, { status: c.status, availability: c.availability, updatedAt: c.updatedAt }))

  // ?new=1 (command palette "Add test centre") opens the create modal.
  const wantsNew = params.get('new') === '1'
  useEffect(() => {
    if (wantsNew && canManage) setForm({ open: true, centre: null })
  }, [wantsNew, canManage])

  const closeForm = () => {
    setForm({ open: false, centre: null })
    if (wantsNew) setParams((prev) => { const next = new URLSearchParams(prev); next.delete('new'); return next }, { replace: true })
  }

  const toggleActive = async (c, active) => {
    setBusyId(c.id)
    try { await status.setActive(c, active) } finally { setBusyId(null) }
  }

  const columns = [
    {
      key: 'name', header: 'Centre', sortable: true, mobile: 'primary', hideable: false,
      cell: (c) => (
        <span className="block min-w-0 max-w-[260px]">
          <span className="block truncate font-medium text-ink">{c.shortName}</span>
          <span className="block truncate font-mono text-[11.5px] text-ink-3">{c.code}</span>
        </span>
      ),
    },
    { key: 'city', header: 'City', sortable: true, cell: (c) => <span className="whitespace-nowrap text-ink-2">{c.city}</span> },
    { key: 'region', header: 'Region', sortable: true, cell: (c) => <span className="whitespace-nowrap text-ink-2">{c.region}</span> },
    { key: 'code', header: 'Centre code', sortable: true, defaultHidden: true, cell: (c) => <span className="whitespace-nowrap font-mono text-[12.5px] text-ink-2">{c.code}</span> },
    { key: 'status', header: 'Status', sortable: true, mobile: 'badge', cell: (c) => <StatusBadge status={c.status} /> },
    { key: 'monitoringJobs', header: 'Monitoring jobs', sortable: true, align: 'right', cell: (c) => <span className="tabular">{formatNumber(c.monitoringJobs)}</span> },
    {
      key: 'slotsDetected7d', header: 'Slots detected', sortable: true, align: 'right',
      cell: (c) => (
        <span className="whitespace-nowrap tabular" title="Last 7 days / all time">
          <span className="font-medium text-ink">{formatNumber(c.slotsDetected7d)}</span>
          <span className="text-ink-4"> 7d · {formatNumber(c.slotsDetected)}</span>
        </span>
      ),
    },
    {
      key: 'lastChecked', header: 'Last checked', sortable: true,
      cell: (c) => <time dateTime={c.lastChecked} title={formatDateTime(c.lastChecked)} className="whitespace-nowrap text-ink-3">{c.lastChecked ? formatRelative(c.lastChecked, now) : 'Never'}</time>,
    },
    { key: 'availability', header: 'Availability', sortable: true, cell: (c) => <AvailabilityMeter level={c.availability} /> },
    {
      key: 'active', header: 'Active', mobile: 'hidden',
      cell: (c) => (
        <span className="inline-flex items-center">
          <Toggle
            id={`centre-active-${c.id}`}
            size="sm"
            checked={c.status === 'Active'}
            disabled={!canManage || busyId === c.id}
            onChange={(v) => toggleActive(c, v)}
          />
          <label htmlFor={`centre-active-${c.id}`} className="sr-only">{c.status === 'Active' ? `Deactivate ${c.shortName}` : `Activate ${c.shortName}`}</label>
        </span>
      ),
    },
  ]

  const rowActions = (c) => [
    { label: 'View centre', icon: Eye, to: `/admin/test-centres/${c.id}` },
    { label: 'Edit', icon: Pencil, onSelect: () => setForm({ open: true, centre: c }), hidden: !canManage },
    { type: 'separator' },
    c.status === 'Active'
      ? { label: 'Deactivate', icon: PowerOff, onSelect: () => status.deactivate(c), danger: true, hidden: !canManage }
      : { label: 'Activate', icon: Power, onSelect: () => status.activate(c), hidden: !canManage },
  ]

  const chips = buildChips(list, {
    region: { label: 'Region' },
    status: { label: 'Status' },
    availability: { label: 'Availability' },
  })

  return (
    <>
      <PageHeader
        title="Test Centres"
        description="DVSA practical test centres available for monitoring, with detection activity."
        actions={
          <PermissionGate permission={P.CENTRES_MANAGE}>
            <Button variant="primary" icon={Plus} onClick={() => setForm({ open: true, centre: null })}>Add centre</Button>
          </PermissionGate>
        }
      />

      <DataTable
        caption="Test centres"
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
        onRowClick={(c) => navigate(`/admin/test-centres/${c.id}`)}
        rowActions={rowActions}
        filtered={list.activeFilterCount > 0}
        onResetFilters={list.resetFilters}
        emptyIcon={MapPin}
        emptyTitle="No test centres yet"
        emptyDescription={canManage ? 'Add a centre so users can include it in their monitoring.' : 'Centres appear here once an admin adds them.'}
        toolbar={
          <FilterBar
            search={list.searchInput}
            onSearch={list.setSearchInput}
            searchPlaceholder="Search name, city, code, postcode…"
            chips={chips}
            onReset={list.resetFilters}
            filters={
              <>
                <FilterDropdown label="Region" options={REGIONS} value={list.filters.region} onChange={(v) => list.setFilter('region', v)} />
                <FilterDropdown label="Status" options={CENTRE_STATUSES} value={list.filters.status} onChange={(v) => list.setFilter('status', v)} />
                <FilterDropdown label="Availability" options={AVAILABILITY_LEVELS} value={list.filters.availability} onChange={(v) => list.setFilter('availability', v)} />
              </>
            }
          />
        }
      />

      <CentreFormModal
        open={form.open}
        centre={form.centre}
        onClose={closeForm}
        onSaved={(c) => (form.centre ? list.patchRow(c.id, c) : list.reload({ silent: true }))}
      />
      {status.confirmElement}
    </>
  )
}

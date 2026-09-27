import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Eye, GraduationCap, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Identity } from '@/components/common/Avatar'
import { EntityLink } from '@/components/common/Misc'
import { DataTable } from '@/components/tables/DataTable'
import { FilterBar, buildChips } from '@/components/tables/FilterBar'
import { FilterDropdown } from '@/components/tables/FilterDropdown'
import { PermissionGate } from '@/routes/guards'
import { useListQuery } from '@/hooks/useListQuery'
import { useAsync } from '@/hooks/useAsync'
import { useExport } from '@/hooks/useExport'
import { learnerService } from '@/services/learnerService'
import { centreService } from '@/services/centreService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { formatDate } from '@/utils/format'
import { CentreList, LEARNER_STATUSES, REFERENCE_STATUSES, ReferenceCell, TEST_TYPES } from './learnerUi'

const FILTER_KEYS = ['status', 'referenceStatus', 'testType', 'centre']
const ARRAY_KEYS = ['status', 'referenceStatus', 'testType', 'centre']

const EXPORT_COLUMNS = [
  { label: 'Learner ID', key: 'id' }, { label: 'Name', key: 'name' }, { label: 'Relationship', key: 'relationship' },
  { label: 'User ID', key: 'userId' }, { label: 'User name', value: (l) => l.user?.name || '' }, { label: 'User email', value: (l) => l.user?.email || '' },
  { label: 'Licence reference (masked)', key: 'licenceMasked' }, { label: 'Reference status', key: 'referenceStatus' }, { label: 'Test type', key: 'testType' },
  { label: 'Preferred centres', value: (l) => (l.centres || []).map((c) => c.shortName).join('; ') },
  { label: 'Monitoring jobs', key: 'monitoringCount' }, { label: 'Slots found', key: 'slotsFound' }, { label: 'Status', key: 'status' }, { label: 'Created', key: 'createdAt' },
]

export default function LearnersPage() {
  const navigate = useNavigate()
  const { exporting, runExport } = useExport()
  const list = useListQuery(learnerService.getLearners, { filterKeys: FILTER_KEYS, arrayKeys: ARRAY_KEYS, defaultSort: 'createdAt' })
  const { data: allCentres } = useAsync(() => centreService.getAllCentres(), [])

  const centreOptions = useMemo(
    () => (allCentres || []).map((c) => ({ value: c.id, label: c.shortName || c.name })).sort((a, b) => a.label.localeCompare(b.label, 'en-GB')),
    [allCentres],
  )
  const centreLabel = (id) => centreOptions.find((o) => o.value === id)?.label ?? id

  const exportRows = () => runExport({ name: 'learners', columns: EXPORT_COLUMNS, fetch: () => learnerService.exportLearners(list.query) })

  const columns = [
    {
      key: 'name', header: 'Learner', sortable: true, mobile: 'primary', hideable: false,
      cell: (l) => <Identity name={l.name} subtitle={`${l.relationship} · ${l.testType}`} />,
    },
    {
      key: 'userName', header: 'User', sortable: true,
      cell: (l) => (l.user ? (
        <span className="block min-w-0 max-w-[14rem]">
          <EntityLink to={`/admin/users/${l.user.id}`} className="block truncate font-medium">{l.user.name}</EntityLink>
          <span className="block truncate text-xs text-ink-3">{l.user.email}</span>
        </span>
      ) : <span className="text-ink-4">Unlinked</span>),
    },
    {
      key: 'referenceStatus', header: 'Licence / reference', sortable: true,
      cell: (l) => <ReferenceCell masked={l.licenceMasked} status={l.referenceStatus} />,
    },
    { key: 'testType', header: 'Test type', sortable: true, defaultHidden: true, mobile: 'hidden', cell: (l) => <span className="whitespace-nowrap">{l.testType}</span> },
    { key: 'centres', header: 'Test centre preferences', cell: (l) => <CentreList centres={l.centres} /> },
    { key: 'monitoringCount', header: 'Monitoring jobs', sortable: true, align: 'right', cell: (l) => <span className="tabular">{l.monitoringCount}</span> },
    { key: 'slotsFound', header: 'Slots found', sortable: true, align: 'right', cell: (l) => <span className="tabular">{l.slotsFound}</span> },
    { key: 'status', header: 'Status', sortable: true, mobile: 'badge', cell: (l) => <StatusBadge status={l.status} /> },
    { key: 'createdAt', header: 'Created', sortable: true, cell: (l) => <span className="whitespace-nowrap text-ink-3">{formatDate(l.createdAt)}</span> },
  ]

  const rowActions = (l) => [
    { label: 'View learner', icon: Eye, to: `/admin/learners/${l.id}` },
    { label: 'View user', icon: UserRound, to: `/admin/users/${l.userId}`, hidden: !l.userId },
  ]

  const chips = buildChips(list, {
    status: { label: 'Status' },
    referenceStatus: { label: 'Reference' },
    testType: { label: 'Test type' },
    centre: { label: 'Centre', format: centreLabel },
  })

  return (
    <>
      <PageHeader
        title="Learners"
        description="Learners linked to user accounts, their reference status and monitoring preferences."
        actions={
          <PermissionGate permission={P.EXPORT}>
            <Button icon={Download} onClick={exportRows} loading={exporting}>Export</Button>
          </PermissionGate>
        }
      />

      <DataTable
        caption="Learners"
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
        onRowClick={(l) => navigate(`/admin/learners/${l.id}`)}
        rowActions={rowActions}
        filtered={list.activeFilterCount > 0}
        onResetFilters={list.resetFilters}
        emptyIcon={GraduationCap}
        emptyTitle="No learners yet"
        emptyDescription="Learners appear here once users add them to their account."
        toolbar={
          <FilterBar
            search={list.searchInput}
            onSearch={list.setSearchInput}
            searchPlaceholder="Search learner, user email or licence ref…"
            chips={chips}
            onReset={list.resetFilters}
            filters={
              <>
                <FilterDropdown label="Status" options={LEARNER_STATUSES} value={list.filters.status} onChange={(v) => list.setFilter('status', v)} />
                <FilterDropdown label="Reference" options={REFERENCE_STATUSES} value={list.filters.referenceStatus} onChange={(v) => list.setFilter('referenceStatus', v)} />
                <FilterDropdown label="Test type" options={TEST_TYPES} value={list.filters.testType} onChange={(v) => list.setFilter('testType', v)} />
                <FilterDropdown label="Centre" options={centreOptions} searchable value={list.filters.centre} onChange={(v) => list.setFilter('centre', v)} width={260} />
              </>
            }
          />
        }
      />
    </>
  )
}

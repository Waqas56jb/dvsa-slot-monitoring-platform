import { useSearchParams, useNavigate } from 'react-router-dom'
import { AlertCircle, Download, Eye, Info, PoundSterling, Receipt, RotateCcw, Undo2, User, CircleCheck } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Identity } from '@/components/common/Avatar'
import { CopyId, EntityLink } from '@/components/common/Misc'
import { Tooltip } from '@/components/common/Tooltip'
import { DataTable } from '@/components/tables/DataTable'
import { FilterBar, buildChips } from '@/components/tables/FilterBar'
import { FilterDropdown } from '@/components/tables/FilterDropdown'
import { PermissionGate } from '@/routes/guards'
import { useListQuery } from '@/hooks/useListQuery'
import { useAsync } from '@/hooks/useAsync'
import { useExport } from '@/hooks/useExport'
import { paymentService, PAYMENT_METHOD_TYPES } from '@/services/paymentService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { PAYMENT_STATUSES, SUBSCRIPTION_PLANS } from '@/constants/status'
import { formatCurrency, formatDate, formatDateTime, formatShortDate } from '@/utils/format'
import { DateRangeFilter, RANGE_PRESETS } from './DateRangeFilter'
import { downloadInvoice } from './invoice'
import { useRefund } from './useRefund'
import { MethodLabel } from './MethodLabel'

const FILTER_KEYS = ['status', 'methodType', 'plan', 'range', 'from', 'to']

const EXPORT_COLUMNS = [
  { label: 'Transaction ID', key: 'id' }, { label: 'Date', key: 'date' }, { label: 'User', value: (p) => p.user?.name }, { label: 'Email', value: (p) => p.user?.email },
  { label: 'Amount', value: (p) => p.amount.toFixed(2) }, { label: 'Currency', key: 'currency' }, { label: 'Payment method', key: 'method' },
  { label: 'Plan', key: 'plan' }, { label: 'Subscription', key: 'subscriptionId' }, { label: 'Status', key: 'status' }, { label: 'Invoice', key: 'invoiceNumber' },
  { label: 'Failure reason', key: 'failureReason' }, { label: 'Refunded at', key: 'refundedAt' },
]

export default function PaymentsPage() {
  const navigate = useNavigate()
  const [, setParams] = useSearchParams()
  const { exporting, runExport } = useExport()
  const { canRefund, refund, confirmElement } = useRefund()
  const summary = useAsync(() => paymentService.getSummary(), [])
  const list = useListQuery(paymentService.getPayments, { filterKeys: FILTER_KEYS, arrayKeys: ['status', 'methodType', 'plan'], defaultSort: 'date' })

  // range / from / to are mutually exclusive — write them in one URL update.
  const setDateRange = ({ range, from, to }) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [k, v] of Object.entries({ range, from, to })) { if (v) next.set(k, v); else next.delete(k) }
      return next
    }, { replace: true })
    list.setPage(1)
  }

  const onRefunded = (p) => (updated) => {
    list.patchRow(p.id, { status: updated.status, refundedAt: updated.refundedAt, refundAmount: updated.refundAmount, refundReason: updated.refundReason })
    summary.reload({ silent: true })
  }

  const exportRows = () => runExport({ name: 'payments', columns: EXPORT_COLUMNS, fetch: () => paymentService.exportPayments(list.query) })

  const s = summary.data
  const columns = [
    { key: 'id', header: 'Transaction ID', sortable: true, cell: (p) => <CopyId value={p.id} to={`/admin/payments/${p.id}`} /> },
    { key: 'userName', header: 'User', sortable: true, mobile: 'primary', hideable: false, cell: (p) => <Identity name={p.user?.name ?? 'Unknown user'} subtitle={p.user?.email} /> },
    { key: 'amount', header: 'Amount', sortable: true, align: 'right', cell: (p) => <span className={p.status === 'Refunded' ? 'font-medium text-ink-3 tabular line-through decoration-ink-4' : p.status === 'Failed' ? 'font-medium text-ink-3 tabular' : 'font-medium text-ink tabular'}>{formatCurrency(p.amount, p.currency)}</span> },
    { key: 'currency', header: 'Currency', mobile: 'hidden', cell: (p) => <span className="text-xs font-medium text-ink-3 uppercase">{p.currency}</span> },
    { key: 'method', header: 'Payment method', sortable: true, mobile: 'hidden', cell: (p) => <MethodLabel method={p.method} /> },
    { key: 'subscriptionId', header: 'Subscription', sortable: true, mobile: 'hidden', cell: (p) => <EntityLink to={`/admin/subscriptions/${p.subscriptionId}`} mono>{p.subscriptionId}</EntityLink> },
    {
      key: 'status', header: 'Status', sortable: true, mobile: 'badge',
      cell: (p) => (p.status === 'Failed' && p.failureReason
        ? <Tooltip content={p.failureReason}><span className="inline-flex" tabIndex={0}><StatusBadge status={p.status} /></span></Tooltip>
        : <StatusBadge status={p.status} />),
    },
    { key: 'date', header: 'Date', sortable: true, cell: (p) => <time dateTime={p.date} title={formatDateTime(p.date)} className="whitespace-nowrap text-ink-3 tabular">{formatDate(p.date)}</time> },
    {
      key: 'invoiceNumber', header: 'Invoice', sortable: true,
      cell: (p) => (
        <span className="inline-flex items-center gap-0.5">
          <span className="font-mono text-[12.5px] text-ink-2">{p.invoiceNumber}</span>
          <Tooltip content="Download invoice">
            <Button size="xs" variant="ghost" iconOnly icon={Download} aria-label={`Download invoice ${p.invoiceNumber}`} onClick={(e) => { e.stopPropagation(); downloadInvoice(p) }} />
          </Tooltip>
        </span>
      ),
    },
  ]

  const rowActions = (p) => [
    { label: 'View payment', icon: Eye, to: `/admin/payments/${p.id}` },
    { label: 'View user', icon: User, to: `/admin/users/${p.userId}` },
    { label: 'Download invoice', icon: Download, onSelect: () => downloadInvoice(p) },
    { type: 'separator', hidden: !canRefund(p) },
    { label: 'Refund', icon: Undo2, danger: true, onSelect: () => refund(p, onRefunded(p)), hidden: !canRefund(p) },
  ]

  const rangeLabel = (v) => RANGE_PRESETS.find((r) => r.value === v)?.label ?? v
  const chips = buildChips(list, {
    status: { label: 'Status' },
    methodType: { label: 'Method' },
    plan: { label: 'Plan' },
    range: { label: 'Date', format: rangeLabel },
    from: { label: 'From', format: formatShortDate },
    to: { label: 'To', format: formatShortDate },
  })

  const filteredByStatus = (st) => `/admin/payments?status=${st}&range=30`

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every transaction mirrored from the payment provider."
        actions={
          <PermissionGate permission={P.EXPORT}>
            <Button icon={Download} onClick={exportRows} loading={exporting}>Export</Button>
          </PermissionGate>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} loading={summary.loading} label="Gross volume (30 days)" value={s?.gross30d} format={formatCurrency} icon={PoundSterling} spark={s?.daily} hint="Total of paid transactions in the last 30 days." />
        <StatCard index={1} loading={summary.loading} label="Successful payments" value={s?.paid30d} icon={CircleCheck} hint="Paid transactions in the last 30 days." to={filteredByStatus('Paid')} />
        <StatCard index={2} loading={summary.loading} label="Failed payments" value={s?.failed30d} icon={AlertCircle} hint="Failed transactions in the last 30 days." to={filteredByStatus('Failed')} />
        <StatCard index={3} loading={summary.loading} label="Refunded (30 days)" value={s?.refunded30d} format={formatCurrency} icon={RotateCcw} hint="Value of refunded transactions in the last 30 days." to={filteredByStatus('Refunded')} />
      </div>
      {summary.error && !summary.loading && (
        <p className="-mt-3 mb-6 flex items-center gap-2 text-[13px] text-danger" role="alert">
          Unable to load payment summary.
          <button type="button" onClick={() => summary.reload()} className="font-medium underline underline-offset-2">Retry</button>
        </p>
      )}

      <DataTable
        caption="Payments"
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
        onRowClick={(p) => navigate(`/admin/payments/${p.id}`)}
        rowActions={rowActions}
        filtered={list.activeFilterCount > 0}
        onResetFilters={list.resetFilters}
        emptyIcon={Receipt}
        emptyTitle="No payments yet"
        emptyDescription="Transactions appear here once the payment provider reports them."
        toolbar={
          <FilterBar
            search={list.searchInput}
            onSearch={list.setSearchInput}
            searchPlaceholder="Search transaction, invoice, user…"
            chips={chips}
            onReset={list.resetFilters}
            filters={
              <>
                <FilterDropdown label="Status" options={PAYMENT_STATUSES} value={list.filters.status} onChange={(v) => list.setFilter('status', v)} />
                <FilterDropdown label="Method" options={PAYMENT_METHOD_TYPES} value={list.filters.methodType} onChange={(v) => list.setFilter('methodType', v)} />
                <FilterDropdown label="Plan" options={SUBSCRIPTION_PLANS} value={list.filters.plan} onChange={(v) => list.setFilter('plan', v)} />
                <DateRangeFilter value={{ range: list.filters.range, from: list.filters.from, to: list.filters.to }} onChange={setDateRange} />
              </>
            }
          />
        }
      />

      <p className="mt-4 flex items-start gap-1.5 text-xs text-ink-4">
        <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
        Payment records are mirrored from the payment provider. Refunds issued here are recorded in the audit log.
      </p>

      {confirmElement}
    </>
  )
}

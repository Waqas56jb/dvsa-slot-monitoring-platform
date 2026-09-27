import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CalendarPlus, CreditCard, Eye, Info, Layers, PoundSterling, Repeat, User, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Badge, StatusBadge } from '@/components/common/StatusBadge'
import { Identity } from '@/components/common/Avatar'
import { ProgressBar, CopyId } from '@/components/common/Misc'
import { DonutChartCard } from '@/components/charts/Charts'
import { DataTable } from '@/components/tables/DataTable'
import { FilterBar, buildChips } from '@/components/tables/FilterBar'
import { FilterDropdown } from '@/components/tables/FilterDropdown'
import { useListQuery } from '@/hooks/useListQuery'
import { useAsync } from '@/hooks/useAsync'
import { usePermission } from '@/context/AdminAuthContext'
import { subscriptionService } from '@/services/subscriptionService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUSES, PAYMENT_STATUSES, statusLabel } from '@/constants/status'
import { formatCurrency, formatDate } from '@/utils/format'
import { useSubscriptionActions } from './SubscriptionActions'
import { isEnded, PLAN_TONE } from './planMeta'

const FILTER_KEYS = ['plan', 'status', 'paymentStatus']
const STATUS_OPTIONS = SUBSCRIPTION_STATUSES.map((s) => ({ value: s, label: statusLabel(s) }))

export default function SubscriptionsPage() {
  const navigate = useNavigate()
  const can = usePermission()
  const canManage = can(P.SUBSCRIPTIONS_MANAGE)
  const summary = useAsync(() => subscriptionService.getSummary(), [])
  const list = useListQuery(subscriptionService.getSubscriptions, { filterKeys: FILTER_KEYS, arrayKeys: FILTER_KEYS, defaultSort: 'startDate' })

  const actions = useSubscriptionActions((updated) => {
    list.patchRow(updated.id, updated)
    summary.reload({ silent: true })
  })

  const s = summary.data
  const columns = [
    { key: 'userName', header: 'User', sortable: true, mobile: 'primary', hideable: false, cell: (r) => <Identity name={r.user?.name ?? 'Unknown user'} subtitle={r.user?.email} /> },
    { key: 'id', header: 'Subscription ID', sortable: true, defaultHidden: true, mobile: 'hidden', cell: (r) => <CopyId value={r.id} to={`/admin/subscriptions/${r.id}`} /> },
    { key: 'plan', header: 'Plan', sortable: true, cell: (r) => <Badge tone={PLAN_TONE[r.plan]}>{r.plan}</Badge> },
    {
      key: 'status', header: 'Status', sortable: true, mobile: 'badge',
      cell: (r) => (
        <span className="inline-flex flex-col items-start gap-0.5">
          <StatusBadge status={r.status} />
          {r.cancelAtPeriodEnd && !isEnded(r) && <span className="text-[11px] whitespace-nowrap text-warning">Cancels {formatDate(r.renewalDate)}</span>}
        </span>
      ),
    },
    { key: 'startDate', header: 'Started', sortable: true, mobile: 'hidden', cell: (r) => <span className="whitespace-nowrap text-ink-3">{formatDate(r.startDate)}</span> },
    { key: 'renewalDate', header: 'Renews', sortable: true, cell: (r) => <span className="whitespace-nowrap text-ink-3">{r.renewalDate ? formatDate(r.renewalDate) : '—'}</span> },
    { key: 'monitoringUsed', header: 'Monitoring', sortable: true, cell: (r) => <ProgressBar value={r.monitoringUsed} max={r.monitoringLimit} size="sm" className="w-24" /> },
    { key: 'learnersUsed', header: 'Learners', sortable: true, cell: (r) => <ProgressBar value={r.learnersUsed} max={r.learnerLimit} size="sm" className="w-24" /> },
    { key: 'paymentStatus', header: 'Payment', sortable: true, cell: (r) => <StatusBadge status={r.paymentStatus} size="sm" /> },
    { key: 'price', header: 'Price', sortable: true, align: 'right', defaultHidden: true, cell: (r) => <span className="text-ink tabular">{formatCurrency(r.price)}</span> },
  ]

  const rowActions = (r) => [
    { label: 'View subscription', icon: Eye, to: `/admin/subscriptions/${r.id}` },
    { label: 'View user', icon: User, to: `/admin/users/${r.userId}` },
    { type: 'separator', hidden: !canManage || isEnded(r) },
    { label: 'Change plan', icon: Layers, onSelect: () => actions.open('plan', r), hidden: !canManage || isEnded(r) },
    { label: 'Extend', icon: CalendarPlus, onSelect: () => actions.open('extend', r), hidden: !canManage || isEnded(r) },
    { label: 'Cancel subscription', icon: XCircle, danger: true, onSelect: () => actions.open('cancel', r), hidden: !canManage || isEnded(r) || r.cancelAtPeriodEnd },
  ]

  const chips = buildChips(list, { plan: { label: 'Plan' }, status: { label: 'Status', format: statusLabel }, paymentStatus: { label: 'Payment' } })

  return (
    <>
      <PageHeader title="Subscriptions" description="Plans, renewals and usage limits for every paying customer." />

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          <StatCard index={0} loading={summary.loading} label="Active subscriptions" value={s?.active} icon={Repeat} hint="Active and trialing subscriptions." to="/admin/subscriptions?status=Active,Trialing" />
          <StatCard index={1} loading={summary.loading} label="Monthly recurring revenue" value={s?.mrr} format={formatCurrency} icon={PoundSterling} hint="Sum of active (non-trial) subscription prices." />
          <StatCard index={2} loading={summary.loading} label="Past due" value={s?.pastDue} icon={AlertTriangle} hint="Renewal payment failed and is awaiting retry." to="/admin/subscriptions?status=Past_due" />
          <StatCard index={3} loading={summary.loading} label="Cancelled (30 days)" value={s?.cancelled30d} icon={XCircle} hint="Subscriptions cancelled in the last 30 days." to="/admin/subscriptions?status=Cancelled" />
        </div>
        <DonutChartCard
          title="Plan mix"
          description="Active and trialing subscriptions"
          data={s?.byPlan ?? []}
          loading={summary.loading}
          error={summary.error}
          onRetry={summary.reload}
          centerLabel="subscribers"
          height={200}
        />
      </div>

      <DataTable
        caption="Subscriptions"
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
        onRowClick={(r) => navigate(`/admin/subscriptions/${r.id}`)}
        rowActions={rowActions}
        filtered={list.activeFilterCount > 0}
        onResetFilters={list.resetFilters}
        emptyIcon={CreditCard}
        emptyTitle="No subscriptions yet"
        emptyDescription="Subscriptions appear here once customers choose a plan."
        toolbar={
          <FilterBar
            search={list.searchInput}
            onSearch={list.setSearchInput}
            searchPlaceholder="Search user, email, subscription ID…"
            chips={chips}
            onReset={list.resetFilters}
            filters={
              <>
                <FilterDropdown label="Plan" options={SUBSCRIPTION_PLANS} value={list.filters.plan} onChange={(v) => list.setFilter('plan', v)} />
                <FilterDropdown label="Status" options={STATUS_OPTIONS} value={list.filters.status} onChange={(v) => list.setFilter('status', v)} />
                <FilterDropdown label="Payment" options={PAYMENT_STATUSES} value={list.filters.paymentStatus} onChange={(v) => list.setFilter('paymentStatus', v)} />
              </>
            }
          />
        }
      />

      <p className="mt-4 flex items-start gap-1.5 text-xs text-ink-4">
        <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
        Billing data is mirrored from the payment provider. No provider is connected in this environment, so plan changes and cancellations are recorded here without charging or refunding the customer.
      </p>

      {actions.modals}
    </>
  )
}

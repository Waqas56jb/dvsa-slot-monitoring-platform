import { useParams } from 'react-router-dom'
import { AlertTriangle, CalendarPlus, Download, Layers, Receipt, User, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge, StatusBadge } from '@/components/common/StatusBadge'
import { Avatar } from '@/components/common/Avatar'
import { DescriptionList } from '@/components/common/DescriptionList'
import { SkeletonDetail } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/States'
import { CopyId, EntityLink, ProgressBar } from '@/components/common/Misc'
import { DataTable } from '@/components/tables/DataTable'
import { PermissionGate } from '@/routes/guards'
import { useAsync } from '@/hooks/useAsync'
import { subscriptionService } from '@/services/subscriptionService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format'
import { useSubscriptionActions } from './SubscriptionActions'
import { isEnded, PLAN_TONE } from './planMeta'
import { ChannelLabel } from '../notifications/ChannelLabel'
import { downloadInvoice } from '../payments/invoice'

const BACK = { to: '/admin/subscriptions', label: 'Subscriptions' }

export default function SubscriptionDetailPage() {
  const { id } = useParams()
  const { data: sub, error, loading, reload } = useAsync(() => subscriptionService.getSubscriptionById(id), [id])
  const actions = useSubscriptionActions(() => reload({ silent: true }))

  if (loading && !sub) return <><PageHeader title="Subscription" back={BACK} /><SkeletonDetail /></>
  if (error || !sub) {
    const nf = error?.status === 404
    return (
      <>
        <PageHeader title="Subscription" back={BACK} />
        <div className="card">
          <ErrorState
            title={nf ? 'Subscription not found' : 'Unable to load subscription'}
            message={nf ? `No subscription with ID ${id} exists.` : 'Unable to load this subscription. Please try again.'}
            onRetry={nf ? undefined : reload}
            showBack
          />
        </div>
      </>
    )
  }

  const plan = sub.planDetails
  const ended = isEnded(sub)
  const open = (kind) => actions.open(kind, sub)
  const pending = sub.cancelAtPeriodEnd && !ended

  const paymentColumns = [
    { key: 'id', header: 'Transaction', mobile: 'primary', cell: (p) => <CopyId value={p.id} to={`/admin/payments/${p.id}`} /> },
    { key: 'date', header: 'Date', cell: (p) => <span className="whitespace-nowrap text-ink-3">{formatDate(p.date)}</span> },
    { key: 'amount', header: 'Amount', align: 'right', cell: (p) => <span className="font-medium text-ink tabular">{formatCurrency(p.amount, p.currency)}</span> },
    { key: 'status', header: 'Status', mobile: 'badge', cell: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'invoiceNumber', header: 'Invoice',
      cell: (p) => (
        <span className="inline-flex items-center gap-1">
          <span className="font-mono text-[12.5px] text-ink-2">{p.invoiceNumber}</span>
          <Button size="xs" variant="ghost" iconOnly icon={Download} aria-label={`Download invoice ${p.invoiceNumber}`} onClick={() => downloadInvoice({ ...p, user: sub.user })} />
        </span>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        back={BACK}
        title={sub.user?.name ? `${sub.user.name}` : sub.id}
        documentTitle={`Subscription ${sub.id}`}
        meta={<><Badge tone={PLAN_TONE[sub.plan]}>{sub.plan}</Badge><StatusBadge status={sub.status} /></>}
        description={<span className="inline-flex flex-wrap items-center gap-x-1.5">Subscription <CopyId value={sub.id} /></span>}
        actions={
          !ended && (
            <PermissionGate permission={P.SUBSCRIPTIONS_MANAGE}>
              <>
                <Button icon={CalendarPlus} onClick={() => open('extend')}>Extend</Button>
                <Button icon={Layers} onClick={() => open('plan')}>Change plan</Button>
                {!pending && <Button variant="danger-ghost" icon={XCircle} onClick={() => open('cancel')}>Cancel</Button>}
              </>
            </PermissionGate>
          )
        }
      />

      {pending && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning/20 bg-warning-soft px-4 py-3 text-sm text-warning" role="status">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>Scheduled to cancel on <span className="font-semibold">{formatDate(sub.renewalDate)}</span>. The user keeps access until then and won’t be charged again.{sub.cancelReason && <span className="text-ink-3"> Reason: {sub.cancelReason}</span>}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card title="Plan details">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
              <div>
                <p className="text-[13px] text-ink-3">{sub.plan} plan</p>
                <p className="mt-1 text-3xl font-semibold tracking-[-0.025em] text-ink tabular">
                  {formatCurrency(sub.price, sub.currency)}<span className="ml-1 text-sm font-normal text-ink-3">/ {plan?.interval ?? 'month'}</span>
                </p>
              </div>
              <p className="text-[13px] text-ink-3">
                {ended ? <>Ended {formatDate(sub.cancelledAt)}</> : sub.renewalDate ? <>{pending ? 'Ends' : 'Renews'} <span className="font-medium text-ink">{formatDate(sub.renewalDate)}</span></> : 'No renewal scheduled'}
              </p>
            </div>
            <DescriptionList
              items={[
                { label: 'Monitoring jobs', value: `Up to ${sub.monitoringLimit}` },
                { label: 'Learners', value: `Up to ${sub.learnerLimit}` },
                { label: 'Centres per job', value: plan?.centreLimit != null ? `Up to ${plan.centreLimit}` : '—' },
                { label: 'Check interval', value: plan?.checkInterval ? `Every ${plan.checkInterval} seconds` : '—' },
                { label: 'Alert channels', full: true, value: plan?.channels?.length ? <span className="flex flex-wrap gap-1.5">{plan.channels.map((c) => <ChannelLabel key={c} channel={c} compact />)}</span> : '—' },
                { label: 'Started', value: formatDate(sub.startDate) },
                { label: 'Billing cycles', value: <span className="tabular">{sub.cycles ?? '—'}</span> },
                { label: 'Payment method', value: sub.paymentMethod },
                { label: 'Payment status', value: <StatusBadge status={sub.paymentStatus} /> },
                sub.cancelledAt && { label: ended ? 'Cancelled' : 'Cancellation requested', value: formatDateTime(sub.cancelledAt) },
                sub.cancelReason && { label: 'Cancellation reason', value: sub.cancelReason, full: true },
              ]}
            />
          </Card>

          <Card title="Usage" description="Current usage against plan limits.">
            <div className="grid gap-5 sm:grid-cols-2">
              <ProgressBar label="Active monitoring jobs" value={sub.monitoringUsed} max={sub.monitoringLimit} />
              <ProgressBar label="Learners" value={sub.learnersUsed} max={sub.learnerLimit} />
            </div>
          </Card>

          <DataTable
            caption="Billing history"
            columns={paymentColumns}
            rows={sub.payments || []}
            columnToggle={false}
            emptyIcon={Receipt}
            emptyTitle="No payments yet"
            emptyDescription="Payments appear here after the first billing cycle."
            toolbar={<div><h2 className="text-[15px] font-semibold text-ink">Billing history</h2><p className="mt-0.5 text-[13px] text-ink-3">Mirrored from the payment provider.</p></div>}
          />
        </div>

        <div className="min-w-0 space-y-6">
          <Card title="Customer">
            {sub.user ? (
              <div className="space-y-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={sub.user.name} size="lg" />
                  <div className="min-w-0">
                    <EntityLink to={`/admin/users/${sub.user.id}`} className="block truncate font-medium">{sub.user.name}</EntityLink>
                    <p className="truncate text-[13px] text-ink-3">{sub.user.email}</p>
                  </div>
                </div>
                <DescriptionList
                  columns={1}
                  dense
                  items={[
                    { label: 'Account status', value: <StatusBadge status={sub.user.status} /> },
                    sub.userDetails && { label: 'Learners', value: <span className="tabular">{sub.userDetails.learnersCount}</span> },
                    sub.userDetails && { label: 'Active monitoring', value: <span className="tabular">{sub.userDetails.activeMonitoring}</span> },
                  ]}
                />
                <Button icon={User} to={`/admin/users/${sub.user.id}`} className="w-full">View user</Button>
              </div>
            ) : (
              <p className="text-sm text-ink-3">The user for this subscription no longer exists.</p>
            )}
          </Card>
          <p className="px-1 text-xs leading-relaxed text-ink-4">Billing is mirrored from the payment provider. No provider is connected in this environment, so changes here are recorded without charging the customer.</p>
        </div>
      </div>

      {actions.modals}
    </>
  )
}

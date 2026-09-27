import { useParams } from 'react-router-dom'
import { AlertOctagon, Download, RotateCcw, Undo2, User } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge, StatusBadge } from '@/components/common/StatusBadge'
import { Avatar } from '@/components/common/Avatar'
import { DescriptionList } from '@/components/common/DescriptionList'
import { ActivityTimeline } from '@/components/common/ActivityTimeline'
import { SkeletonDetail } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/States'
import { CopyId, EntityLink } from '@/components/common/Misc'
import { useAsync } from '@/hooks/useAsync'
import { paymentService } from '@/services/paymentService'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format'
import { downloadInvoice } from './invoice'
import { useRefund } from './useRefund'
import { MethodLabel } from './MethodLabel'
import { PLAN_TONE } from '../subscriptions/planMeta'

const BACK = { to: '/admin/payments', label: 'Payments' }

const STATUS_LINE = {
  Paid: (p) => `Paid on ${formatDateTime(p.date)}`,
  Pending: () => 'Awaiting confirmation from the payment provider',
  Failed: (p) => `Attempted on ${formatDateTime(p.date)}`,
  Refunded: (p) => `Refunded on ${formatDateTime(p.refundedAt)}`,
}

function timelineFor(p) {
  const ev = [{ title: 'Payment initiated', description: `${p.plan} plan renewal · ${p.invoiceNumber}`, at: p.date, tone: 'neutral' }]
  if (p.status === 'Paid' || p.status === 'Refunded') ev.push({ title: 'Payment succeeded', description: p.method, at: p.date, tone: 'success' })
  if (p.status === 'Failed') ev.push({ title: 'Payment failed', description: p.failureReason || 'Declined', at: p.date, tone: 'danger' })
  if (p.status === 'Pending') ev.push({ title: 'Awaiting provider confirmation', at: p.date, tone: 'warning' })
  if (p.status === 'Refunded') ev.push({ title: 'Refund issued', description: p.refundReason ? `Reason: ${p.refundReason}` : `${formatCurrency(p.refundAmount ?? p.amount, p.currency)} returned to ${p.method}`, at: p.refundedAt, tone: 'info' })
  return ev
}

export default function PaymentDetailPage() {
  const { id } = useParams()
  const { data: p, error, loading, reload, setData } = useAsync(() => paymentService.getPaymentById(id), [id])
  const { canRefund, refund, confirmElement } = useRefund()

  if (loading && !p) return <><PageHeader title="Payment" back={BACK} /><SkeletonDetail /></>
  if (error || !p) {
    const nf = error?.status === 404
    return (
      <>
        <PageHeader title="Payment" back={BACK} />
        <div className="card">
          <ErrorState
            title={nf ? 'Payment not found' : 'Unable to load payment'}
            message={nf ? `No transaction with ID ${id} exists.` : 'Unable to load this payment. Please try again.'}
            onRetry={nf ? undefined : reload}
            showBack
          />
        </div>
      </>
    )
  }

  const onRefund = () => refund(p, (updated) => setData((x) => ({ ...x, ...updated, subscription: x.subscription })))
  const refunded = p.status === 'Refunded'
  const amount = formatCurrency(p.amount, p.currency)

  return (
    <>
      <PageHeader
        back={BACK}
        title={p.id}
        documentTitle={`Payment ${p.id}`}
        meta={<StatusBadge status={p.status} />}
        description={`${p.plan} plan · ${p.user?.name ?? p.userId}`}
        actions={
          <>
            <Button icon={Download} onClick={() => downloadInvoice(p)}>Download invoice</Button>
            {canRefund(p) && <Button variant="danger-ghost" icon={Undo2} onClick={onRefund}>Refund</Button>}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card padding="none">
            {/* Amount hero */}
            <div className="px-5 pt-6 pb-5 sm:px-7 sm:pt-7">
              <p className="text-[13px] font-medium text-ink-3">Amount</p>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <p className={refunded ? 'text-4xl font-semibold tracking-[-0.03em] text-ink-3 tabular line-through decoration-ink-4 decoration-2' : 'text-4xl font-semibold tracking-[-0.03em] text-ink tabular'}>{amount}</p>
                <span className="text-sm font-medium text-ink-4 uppercase">{p.currency}</span>
                <StatusBadge status={p.status} />
              </div>
              <p className="mt-2 text-[13px] text-ink-3">{STATUS_LINE[p.status]?.(p)}</p>
            </div>

            {p.status === 'Failed' && (
              <div className="mx-5 mb-5 flex items-start gap-3 rounded-lg border border-danger/20 bg-danger-soft px-3.5 py-3 text-sm sm:mx-7" role="status">
                <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
                <div className="min-w-0">
                  <p className="font-medium text-danger">Payment failed</p>
                  <p className="mt-0.5 text-[13px] text-ink-2">{p.failureReason || 'The payment was declined.'} The subscription is marked past due until a retry succeeds.</p>
                </div>
              </div>
            )}
            {refunded && (
              <div className="mx-5 mb-5 flex items-start gap-3 rounded-lg border border-line bg-subtle px-3.5 py-3 text-sm sm:mx-7" role="status">
                <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden />
                <div className="min-w-0">
                  <p className="font-medium text-ink">Refunded {formatCurrency(p.refundAmount ?? p.amount, p.currency)}</p>
                  <p className="mt-0.5 text-[13px] text-ink-3">Returned to {p.method} on {formatDateTime(p.refundedAt)}.{p.refundReason && <> Reason: {p.refundReason}</>}</p>
                </div>
              </div>
            )}

            {/* Receipt body */}
            <div className="border-t border-dashed border-line-strong px-5 py-5 sm:px-7">
              <DescriptionList
                items={[
                  { label: 'Transaction ID', value: <CopyId value={p.id} /> },
                  { label: 'Invoice number', value: <span className="font-mono text-[13px]">{p.invoiceNumber}</span> },
                  { label: 'Payment method', value: <MethodLabel method={p.method} className="text-ink" /> },
                  { label: 'Date', value: formatDateTime(p.date) },
                  { label: 'Subscription', value: <EntityLink to={`/admin/subscriptions/${p.subscriptionId}`} mono>{p.subscriptionId}</EntityLink> },
                  { label: 'Customer', value: p.user ? <EntityLink to={`/admin/users/${p.user.id}`}>{p.user.name}</EntityLink> : '—' },
                ]}
              />
            </div>

            {/* Line items */}
            <div className="border-t border-line px-5 py-5 sm:px-7">
              <table className="w-full text-sm">
                <caption className="sr-only">Line items</caption>
                <thead>
                  <tr className="text-xs text-ink-3">
                    <th scope="col" className="pb-2 text-left font-medium">Description</th>
                    <th scope="col" className="pb-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-line">
                    <td className="py-2.5 pr-4 text-ink">
                      {p.plan} plan <span className="text-ink-3">· monthly subscription</span>
                      <span className="block text-xs text-ink-4">{formatDate(p.date)}</span>
                    </td>
                    <td className="py-2.5 text-right text-ink tabular">{amount}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-line font-semibold text-ink">
                    <td className="pt-2.5">Total</td>
                    <td className="pt-2.5 text-right tabular">{amount}</td>
                  </tr>
                  {refunded && (
                    <tr className="text-ink-3">
                      <td className="pt-1.5">Refunded</td>
                      <td className="pt-1.5 text-right tabular">−{formatCurrency(p.refundAmount ?? p.amount, p.currency)}</td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          </Card>

          <Card title="Timeline">
            <ActivityTimeline events={timelineFor(p)} />
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card title="Customer">
            {p.user ? (
              <div className="space-y-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={p.user.name} size="lg" />
                  <div className="min-w-0">
                    <EntityLink to={`/admin/users/${p.user.id}`} className="block truncate font-medium">{p.user.name}</EntityLink>
                    <p className="truncate text-[13px] text-ink-3">{p.user.email}</p>
                  </div>
                </div>
                <Button icon={User} to={`/admin/users/${p.user.id}`} className="w-full">View user</Button>
              </div>
            ) : <p className="text-sm text-ink-3">This user no longer exists.</p>}
          </Card>

          <Card title="Subscription">
            {p.subscription ? (
              <DescriptionList
                columns={1}
                dense
                items={[
                  { label: 'Subscription', value: <EntityLink to={`/admin/subscriptions/${p.subscription.id}`} mono>{p.subscription.id}</EntityLink> },
                  { label: 'Plan', value: <span className="inline-flex items-center gap-2"><Badge tone={PLAN_TONE[p.subscription.plan]}>{p.subscription.plan}</Badge><span className="text-ink-3 tabular">{formatCurrency(p.subscription.price)}/month</span></span> },
                  { label: 'Status', value: <StatusBadge status={p.subscription.status} /> },
                  { label: 'Renews', value: p.subscription.renewalDate ? formatDate(p.subscription.renewalDate) : '—' },
                ]}
              />
            ) : <p className="text-sm text-ink-3">The subscription for this payment no longer exists.</p>}
          </Card>
        </div>
      </div>
      {confirmElement}
    </>
  )
}

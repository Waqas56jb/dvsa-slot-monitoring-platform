import { ArrowUpRight, CreditCard, UserRound } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { DescriptionList, MetricStrip } from '@/components/common/DescriptionList'
import { Badge, StatusBadge } from '@/components/common/StatusBadge'
import { CopyId, ProgressBar } from '@/components/common/Misc'
import { EmptyState } from '@/components/common/States'
import { Button } from '@/components/common/Button'
import { PLANS } from '@/data/subscriptions'
import { formatCurrency, formatDate, formatDateTime, formatNumber, formatRelative } from '@/utils/format'

export function UserOverviewTab({ user }) {
  const running = user.monitoring.filter((j) => j.status === 'Running').length
  const alertsSent = user.alertsSent ?? user.notifications.filter((n) => n.type === 'Slot alert' && n.status !== 'Queued').length
  const slotsDetected = user.slotsDetected ?? user.slots.length

  return (
    <div className="space-y-6">
      <MetricStrip
        className="bg-surface"
        items={[
          { label: 'Learners', value: formatNumber(user.learners.length), hint: `${user.learners.filter((l) => l.status === 'Active').length} active` },
          { label: 'Monitoring jobs', value: formatNumber(user.monitoring.length), hint: `${running} running` },
          { label: 'Alerts sent', value: formatNumber(alertsSent), hint: 'Across all channels' },
          { label: 'Slots detected', value: formatNumber(slotsDetected), hint: 'Matched to preferences' },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Account information" icon={UserRound} className="lg:col-span-2">
          <DescriptionList
            items={[
              { label: 'User ID', value: <CopyId value={user.id} /> },
              { label: 'Email', value: user.email },
              { label: 'Phone', value: user.phone || <span className="text-ink-4">Not provided</span> },
              { label: 'City', value: user.city || '—' },
              { label: 'Registration date', value: <time dateTime={user.createdAt}>{formatDateTime(user.createdAt)}</time> },
              {
                label: 'Last active',
                value: user.lastActive
                  ? <time dateTime={user.lastActive} title={formatDateTime(user.lastActive)}>{formatRelative(user.lastActive)}</time>
                  : <span className="text-ink-4">Never</span>,
              },
              { label: 'Acquisition source', value: user.source || '—' },
              {
                label: 'Email verified',
                value: user.emailVerified ? <Badge tone="success" dot>Verified</Badge> : <Badge tone="warning" dot>Not verified</Badge>,
              },
            ]}
          />
        </Card>

        <SubscriptionCard user={user} running={running} />
      </div>
    </div>
  )
}

function SubscriptionCard({ user, running }) {
  const sub = user.subscription
  if (!sub) {
    return (
      <Card title="Subscription" icon={CreditCard}>
        <EmptyState compact icon={CreditCard} title="No subscription" description="This user hasn’t started a plan yet. Monitoring requires an active subscription." />
      </Card>
    )
  }
  const plan = PLANS[sub.plan] || {}
  const learnerLimit = plan.learnerLimit ?? sub.learnerLimit
  const monitoringLimit = plan.monitoringLimit ?? sub.monitoringLimit
  const ended = ['Cancelled', 'Expired'].includes(sub.status)

  return (
    <Card
      title="Subscription"
      icon={CreditCard}
      actions={<Button variant="ghost" size="sm" iconRight={ArrowUpRight} to={`/admin/subscriptions/${sub.id}`}>View</Button>}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Badge tone={sub.plan === 'Premium' ? 'brand' : 'neutral'}>{sub.plan}</Badge>
          <StatusBadge status={sub.status} />
        </div>
        <p className="text-sm text-ink">
          <span className="font-semibold tabular">{formatCurrency(sub.price, sub.currency)}</span>
          <span className="text-ink-3"> / {plan.interval || 'month'}</span>
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div className="min-w-0">
          <dt className="text-xs font-medium text-ink-3">{ended ? 'Ended' : 'Renews'}</dt>
          <dd className="mt-0.5 text-ink">{ended ? formatDate(sub.cancelledAt) : formatDate(sub.renewalDate)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs font-medium text-ink-3">Payment method</dt>
          <dd className="mt-0.5 truncate text-ink">{sub.paymentMethod || '—'}</dd>
        </div>
      </dl>

      <div className="mt-5 space-y-3.5 border-t border-line pt-4">
        <p className="text-xs font-medium text-ink-3">Plan usage</p>
        <ProgressBar label="Learners" value={user.learners.length} max={learnerLimit} />
        <ProgressBar label="Active monitoring" value={running} max={monitoringLimit} />
        {plan.channels && <p className="text-xs text-ink-4">Alert channels: {plan.channels.join(', ')}</p>}
      </div>
    </Card>
  )
}

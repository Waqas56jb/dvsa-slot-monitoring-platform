import { Card } from '@/components/common/Card'
import { AreaChartCard, BarChartCard, DonutChartCard, LineChartCard } from '@/components/charts/Charts'
import { Skeleton } from '@/components/common/LoadingSkeleton'
import { cn } from '@/utils/cn'
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format'

const sum = (rows = [], k) => rows.reduce((a, d) => a + (d[k] || 0), 0)
const last = (rows = [], k) => rows[rows.length - 1]?.[k]
const wholePounds = (v) => formatCurrency(v).replace(/\.00$/, '')

/** Section wrapper with a visible heading (h2) and short description. */
export function Section({ id, title, description, children }) {
  return (
    <section aria-labelledby={`${id}-title`} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-line pb-2.5">
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="text-base font-semibold tracking-[-0.01em] text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-ink-3">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

/** Rows of label → value with an optional proportion meter. */
function RatioList({ items, loading }) {
  if (loading) return <div className="space-y-5">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-9 w-full" />)}</div>
  return (
    <ul className="space-y-4">
      {items.map((it) => (
        <li key={it.label} className="min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] text-ink-3">{it.label}</span>
            <span className="shrink-0 text-sm font-semibold text-ink tabular">{it.value}</span>
          </div>
          {it.pct != null && (
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted" role="img" aria-label={`${it.label}: ${formatPercent(it.pct)}`}>
              <div className={cn('h-full rounded-full', it.tone === 'danger' ? 'bg-danger-dot' : 'bg-brand-500')} style={{ width: `${Math.min(100, it.pct)}%` }} />
            </div>
          )}
          {it.hint && <p className="mt-1 text-xs text-ink-4">{it.hint}</p>}
        </li>
      ))}
    </ul>
  )
}

const rangeLabel = (days) => `last ${days} days`

export function UserGrowthSection({ data, loading, days }) {
  const rows = data?.userGrowth
  return (
    <Section id="growth" title="User growth" description={`Registrations and engagement over the ${rangeLabel(days)}.`}>
      <div className="grid gap-6 lg:grid-cols-3">
        <LineChartCard
          className="lg:col-span-2"
          title="Active and returning users"
          description="Daily unique users signed in"
          loading={loading}
          data={rows}
          series={[{ key: 'active', label: 'Active users' }, { key: 'returning', label: 'Returning users' }]}
          totals={{ active: last(rows, 'active'), returning: last(rows, 'returning') }}
        />
        <BarChartCard
          title="New registrations"
          description={`${formatNumber(sum(rows, 'registrations'))} in the ${rangeLabel(days)}`}
          loading={loading}
          data={rows}
          series={[{ key: 'registrations', label: 'Registrations', color: 'series3' }]}
        />
      </div>
    </Section>
  )
}

export function MonitoringSection({ data, loading, days }) {
  const rows = data?.monitoring
  return (
    <Section id="monitoring" title="Monitoring" description="Job lifecycle across all learners.">
      <div className="grid gap-6 lg:grid-cols-3">
        <BarChartCard
          className="lg:col-span-2"
          title="Jobs created, completed and failed"
          description="Per day"
          loading={loading}
          data={rows}
          series={[{ key: 'created', label: 'Created' }, { key: 'completed', label: 'Completed', color: 'series3' }, { key: 'failed', label: 'Failed', color: 'danger' }]}
          totals={{ created: sum(rows, 'created'), completed: sum(rows, 'completed'), failed: sum(rows, 'failed') }}
        />
        <LineChartCard
          title="Active jobs"
          description={`Running jobs at end of day · ${rangeLabel(days)}`}
          loading={loading}
          data={rows}
          series={[{ key: 'active', label: 'Active jobs', color: 'series5' }]}
        />
      </div>
    </Section>
  )
}

export function SlotSection({ data, loading, days }) {
  const rows = data?.slots
  const discovered = sum(rows, 'discovered')
  const matched = sum(rows, 'matched')
  const alerts = sum(rows, 'alerts')
  const actions = sum(rows, 'bookingActions')
  const cs = data?.centreSummary
  return (
    <Section id="slots" title="Slot detection" description="Availability observed by the monitoring engine and how it reached users.">
      <div className="grid gap-6 lg:grid-cols-3">
        <AreaChartCard
          className="lg:col-span-2"
          title="Slots discovered and matched"
          description="Matched = slot fits at least one active job's centres, dates and times"
          loading={loading}
          data={rows}
          series={[{ key: 'discovered', label: 'Discovered' }, { key: 'matched', label: 'Matched' }]}
          totals={{ discovered, matched }}
        />
        <Card title="Slot pipeline" description={`Totals for the ${rangeLabel(days)}`}>
          <RatioList
            loading={loading}
            items={[
              { label: 'Slots discovered', value: formatNumber(discovered) },
              { label: 'Matched to a job', value: formatNumber(matched), pct: discovered ? (matched / discovered) * 100 : 0, hint: `${formatPercent(discovered ? (matched / discovered) * 100 : 0)} of discovered` },
              { label: 'Alerts sent', value: formatNumber(alerts), hint: `${matched ? (alerts / matched).toFixed(1) : '0'} alerts per matched slot (all channels)` },
              { label: 'User booking actions', value: formatNumber(actions), pct: matched ? (actions / matched) * 100 : 0, hint: 'Users who followed an alert to book themselves' },
            ]}
          />
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <BarChartCard
          className="lg:col-span-2"
          title="Top test centres by detections"
          description={cs ? `Top 10 of ${formatNumber(cs.centres)} active centres · average ${formatNumber(cs.avgDetections)} detections per centre` : 'Top 10 active centres'}
          loading={loading}
          data={data?.centrePerformance}
          xKey="name"
          xType="category"
          layout="vertical"
          height={340}
          series={[{ key: 'slots', label: 'Slots detected' }]}
        />
        <BarChartCard
          title="User booking actions"
          description="Per day, initiated by users from an alert"
          loading={loading}
          data={rows}
          height={340}
          series={[{ key: 'bookingActions', label: 'Booking actions', color: 'series3' }]}
        />
      </div>
    </Section>
  )
}

export function NotificationSection({ data, loading, days }) {
  const rows = data?.notifications
  const sent = sum(rows, 'sent')
  const delivered = sum(rows, 'delivered')
  const failed = sum(rows, 'failed')
  const read = sum(rows, 'read')
  return (
    <Section id="notifications" title="Notifications" description="Alert delivery across Email, Browser and SMS.">
      <div className="grid gap-6 lg:grid-cols-3">
        <LineChartCard
          className="lg:col-span-2"
          title="Sent, delivered and read"
          description="Per day, all channels"
          loading={loading}
          data={rows}
          series={[{ key: 'sent', label: 'Sent' }, { key: 'delivered', label: 'Delivered' }, { key: 'read', label: 'Read' }]}
          totals={{ sent, delivered, read }}
        />
        <DonutChartCard
          title="Channel mix"
          description="Alerts sent by channel"
          loading={loading}
          data={data?.channelMix?.map((c) => ({ name: c.name, value: Math.round((sent * c.value) / 100) }))}
          centerValue={formatNumber(sent)}
          centerLabel="alerts sent"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <BarChartCard
          className="lg:col-span-2"
          title="Failed deliveries"
          description={`${formatNumber(failed)} in the ${rangeLabel(days)}`}
          loading={loading}
          data={rows}
          height={200}
          series={[{ key: 'failed', label: 'Failed', color: 'danger' }]}
        />
        <Card title="Delivery quality" description={`Rates for the ${rangeLabel(days)}`}>
          <RatioList
            loading={loading}
            items={[
              { label: 'Delivery rate', value: formatPercent(sent ? (delivered / sent) * 100 : 0, 2), pct: sent ? (delivered / sent) * 100 : 0 },
              { label: 'Read rate', value: formatPercent(delivered ? (read / delivered) * 100 : 0), pct: delivered ? (read / delivered) * 100 : 0 },
              { label: 'Failure rate', value: formatPercent(sent ? (failed / sent) * 100 : 0, 2), pct: sent ? (failed / sent) * 100 : 0, tone: 'danger' },
            ]}
          />
        </Card>
      </div>
    </Section>
  )
}

export function RevenueSection({ data, loading }) {
  const rows = data?.revenue
  return (
    <Section id="revenue" title="Revenue" description="Last 12 months, independent of the selected range.">
      <div className="grid gap-6 lg:grid-cols-3">
        <BarChartCard
          className="lg:col-span-2"
          title="Gross revenue"
          description="Per month"
          loading={loading}
          data={rows}
          xType="month"
          series={[{ key: 'gross', label: 'Gross revenue' }]}
          valueFormatter={wholePounds}
        />
        <BarChartCard
          title="Refunds"
          description={`${wholePounds(sum(rows, 'refunds'))} over 12 months`}
          loading={loading}
          data={rows}
          xType="month"
          series={[{ key: 'refunds', label: 'Refunds', color: 'series4' }]}
          valueFormatter={wholePounds}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <BarChartCard
          className="lg:col-span-2"
          title="Successful and failed payments"
          description="Payment attempts per month"
          loading={loading}
          data={rows}
          xType="month"
          series={[{ key: 'successful', label: 'Successful', color: 'success' }, { key: 'failed', label: 'Failed', color: 'danger' }]}
          totals={{ successful: sum(rows, 'successful'), failed: sum(rows, 'failed') }}
        />
        <DonutChartCard title="Subscriptions by plan" description="Active subscriptions" loading={loading} data={data?.planMix} centerLabel="active" />
      </div>
    </Section>
  )
}

export function UsageSection({ data, loading }) {
  const rows = data?.usage
  return (
    <Section id="usage" title="Platform usage" description="Hourly, last 24 hours.">
      <div className="grid gap-6 lg:grid-cols-3">
        <AreaChartCard
          className="lg:col-span-2"
          title="API requests and monitoring checks"
          description="Per hour"
          loading={loading}
          data={rows}
          xType="hour"
          series={[{ key: 'apiRequests', label: 'API requests' }, { key: 'checks', label: 'Monitoring checks' }]}
          totals={{ apiRequests: sum(rows, 'apiRequests'), checks: sum(rows, 'checks') }}
        />
        <LineChartCard
          title="Active workers"
          description="Workers reporting heartbeats"
          loading={loading}
          data={rows}
          xType="hour"
          series={[{ key: 'workers', label: 'Active workers', color: 'series5' }]}
        />
      </div>
    </Section>
  )
}

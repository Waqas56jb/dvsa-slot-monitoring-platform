import { useState } from 'react'
import { AreaChartCard } from '@/components/charts/Charts'
import { SegmentedControl } from '@/components/common/Tabs'
import { useAsync } from '@/hooks/useAsync'
import { analyticsService } from '@/services/analyticsService'

const METRICS = [
  { value: 'users', label: 'Users registered', short: 'Users', color: 'series1' },
  { value: 'jobs', label: 'Monitoring jobs', short: 'Jobs', color: 'series2' },
  { value: 'slots', label: 'Slots detected', short: 'Slots', color: 'series3' },
  { value: 'alerts', label: 'Alerts sent', short: 'Alerts', color: 'series4' },
]
const RANGES = [{ value: '24h', label: '24h' }, { value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }]

/** One metric at a time — the four metrics differ by 10× so they never share an axis. */
export function PlatformActivityCard() {
  const [metric, setMetric] = useState('slots')
  const [range, setRange] = useState('7d')
  const { data, loading, error, reload } = useAsync(() => analyticsService.getPlatformActivity(range), [range])
  const m = METRICS.find((x) => x.value === metric)
  const total = data?.reduce((a, d) => a + d[metric], 0)

  return (
    <AreaChartCard
      title="Platform Activity"
      description={total != null ? `${total.toLocaleString('en-GB')} ${m.label.toLowerCase()} in the selected period` : 'Registrations, monitoring, detections and alerts'}
      actions={
        <>
          <label className="sr-only" htmlFor="pa-metric">Metric</label>
          <select id="pa-metric" value={metric} onChange={(e) => setMetric(e.target.value)} className="h-8 rounded-lg border border-line bg-surface px-2 text-[13px] text-ink-2 sm:hidden">
            {METRICS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
          </select>
          <span className="hidden sm:block">
            <SegmentedControl label="Metric" options={METRICS.map(({ value, short }) => ({ value, label: short }))} value={metric} onChange={setMetric} />
          </span>
          <SegmentedControl label="Time range" options={RANGES} value={range} onChange={setRange} />
        </>
      }
      loading={loading}
      error={error}
      onRetry={reload}
      data={data || []}
      xType={range === '24h' ? 'hour' : 'day'}
      series={[{ key: metric, label: m.label, color: m.color }]}
      height={290}
    />
  )
}

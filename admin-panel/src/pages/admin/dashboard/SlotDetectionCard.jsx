import { ArrowRight } from 'lucide-react'
import { BarChartCard } from '@/components/charts/Charts'
import { formatNumber, formatPercent } from '@/utils/format'

/**
 * Slot pipeline. Bars: discovered vs matched (same scale). The full funnel —
 * including alerts and user-initiated booking actions — is summarised below
 * as numbers, since those measures differ in scale.
 */
export function SlotDetectionCard({ pipeline, loading }) {
  const sum = (k) => (pipeline || []).reduce((a, d) => a + d[k], 0)
  const t = { discovered: sum('discovered'), matched: sum('matched'), alerts: sum('alerts'), bookingActions: sum('bookingActions') }
  const steps = [
    { label: 'Slots discovered', value: t.discovered },
    { label: 'Slots matched', value: t.matched, rate: t.discovered && (t.matched / t.discovered) * 100, rateLabel: 'match rate' },
    { label: 'Alerts generated', value: t.alerts, rate: t.matched && t.alerts / t.matched, rateLabel: 'per match', ratio: true },
    { label: 'Booking actions initiated', value: t.bookingActions, rate: t.matched && (t.bookingActions / t.matched) * 100, rateLabel: 'of matches', hint: 'User-initiated, via the official service' },
  ]
  return (
    <BarChartCard
      title="Slot Detection Activity"
      description="Availability observed by the monitoring engine and matched to job preferences"
      loading={loading}
      data={pipeline || []}
      series={[{ key: 'discovered', label: 'Discovered', color: 'series1' }, { key: 'matched', label: 'Matched', color: 'series3' }]}
      totals={{ discovered: t.discovered, matched: t.matched }}
      height={240}
      footer={
        !loading && (
          <ol className="grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.label} className="relative min-w-0">
                <p className="flex items-center gap-1 truncate text-xs text-ink-3">{s.label}{i < steps.length - 1 && <ArrowRight className="hidden h-3 w-3 text-ink-4 lg:inline" aria-hidden />}</p>
                <p className="mt-0.5 text-base font-semibold text-ink tabular">{formatNumber(s.value)}</p>
                {s.rate != null && <p className="text-[11px] text-ink-4 tabular">{s.ratio ? `${s.rate.toFixed(1)}×` : formatPercent(s.rate)} {s.rateLabel}</p>}
              </li>
            ))}
          </ol>
        )
      }
    />
  )
}

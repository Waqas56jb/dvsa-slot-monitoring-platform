import { useId } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { ChartCard, ChartTooltip } from './ChartCard'
import { useChartColors, SERIES_ORDER, axisProps, tickFormatters } from './chartTheme'
import { formatNumber } from '@/utils/format'

/**
 * Shared props for the cartesian cards:
 *   data: rows, xKey: 't', xType: 'day'|'hour'|'month'|'category'
 *   series: [{ key, label, color? ('series1'…'series5' | 'success' | …) }]
 *   valueFormatter, height, stacked, …ChartCard props (title, description, actions, loading, error, onRetry)
 */
function useSeries(series) {
  const colors = useChartColors()
  const resolved = series.map((s, i) => ({ ...s, stroke: colors[s.color || SERIES_ORDER[i]] || s.color }))
  return { colors, resolved }
}

function xFormatter(xType) {
  return xType === 'category' ? undefined : tickFormatters[xType] || tickFormatters.day
}

const legendFrom = (resolved, totals) => resolved.map((s) => ({ label: s.label, color: s.stroke, value: totals?.[s.key] }))

export function AreaChartCard({ data = [], xKey = 't', xType = 'day', series, valueFormatter = formatNumber, height = 280, stacked = false, showLegend = true, totals, ...card }) {
  const { colors, resolved } = useSeries(series)
  const gid = useId().replace(/:/g, '')
  const xf = xFormatter(xType)
  return (
    <ChartCard {...card} height={height} empty={!card.loading && !data.length} legend={showLegend && series.length > 1 ? legendFrom(resolved, totals) : null}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
          <defs>
            {resolved.map((s) => (
              <linearGradient key={s.key} id={`${gid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.stroke} stopOpacity={series.length > 1 ? 0.14 : 0.22} />
                <stop offset="100%" stopColor={s.stroke} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis dataKey={xKey} {...axisProps(colors)} tickFormatter={xf} minTickGap={24} dy={6} />
          <YAxis {...axisProps(colors)} tickFormatter={tickFormatters.compact} width={48} />
          <Tooltip content={<ChartTooltip labelFormatter={xType === 'hour' ? (t) => `${tickFormatters.day(t)}, ${tickFormatters.hour(t)}` : xf} valueFormatter={valueFormatter} />} cursor={{ stroke: colors.axis, strokeDasharray: '3 3' }} />
          {resolved.map((s) => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.stroke} strokeWidth={2} fill={`url(#${gid}-${s.key})`} stackId={stacked ? 'a' : undefined} activeDot={{ r: 4, strokeWidth: 2, stroke: colors.surface }} dot={false} isAnimationActive={false} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function LineChartCard({ data = [], xKey = 't', xType = 'day', series, valueFormatter = formatNumber, height = 280, showLegend = true, totals, ...card }) {
  const { colors, resolved } = useSeries(series)
  const xf = xFormatter(xType)
  return (
    <ChartCard {...card} height={height} empty={!card.loading && !data.length} legend={showLegend && series.length > 1 ? legendFrom(resolved, totals) : null}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis dataKey={xKey} {...axisProps(colors)} tickFormatter={xf} minTickGap={24} dy={6} />
          <YAxis {...axisProps(colors)} tickFormatter={tickFormatters.compact} width={48} />
          <Tooltip content={<ChartTooltip labelFormatter={xf} valueFormatter={valueFormatter} />} cursor={{ stroke: colors.axis, strokeDasharray: '3 3' }} />
          {resolved.map((s) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.stroke} strokeWidth={2} strokeDasharray={s.dashed ? '4 4' : undefined} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: colors.surface }} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function BarChartCard({ data = [], xKey = 't', xType = 'day', series, valueFormatter = formatNumber, height = 280, stacked = false, layout = 'horizontal', showLegend = true, totals, barSize, ...card }) {
  const { colors, resolved } = useSeries(series)
  const xf = xFormatter(xType)
  const vertical = layout === 'vertical'
  return (
    <ChartCard {...card} height={height} empty={!card.loading && !data.length} legend={showLegend && series.length > 1 ? legendFrom(resolved, totals) : null}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={vertical ? 'vertical' : 'horizontal'} margin={{ top: 6, right: 6, left: vertical ? 0 : -12, bottom: 0 }} barGap={2} barCategoryGap={vertical ? '28%' : '22%'}>
          <CartesianGrid stroke={colors.grid} vertical={vertical} horizontal={!vertical} />
          {vertical ? (
            <>
              <XAxis type="number" {...axisProps(colors)} tickFormatter={tickFormatters.compact} />
              <YAxis type="category" dataKey={xKey} {...axisProps(colors)} width={112} tick={{ fill: colors.ink3, fontSize: 12 }} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} {...axisProps(colors)} tickFormatter={xf} minTickGap={16} dy={6} />
              <YAxis {...axisProps(colors)} tickFormatter={tickFormatters.compact} width={48} />
            </>
          )}
          <Tooltip content={<ChartTooltip labelFormatter={xf} valueFormatter={valueFormatter} />} cursor={{ fill: colors.grid, opacity: 0.5 }} />
          {resolved.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.stroke}
              stackId={stacked ? 'a' : undefined}
              barSize={barSize}
              radius={stacked ? (i === resolved.length - 1 ? (vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]) : 0) : vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              stroke={stacked ? colors.surface : undefined}
              strokeWidth={stacked ? 1 : 0}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/**
 * Donut for part-to-whole with ≤ 5 slices.
 * data: [{ name, value, color? }] — centerLabel / centerValue shown in the hole.
 */
export function DonutChartCard({ data = [], height = 220, centerLabel, centerValue, valueFormatter = formatNumber, ...card }) {
  const colors = useChartColors()
  const slices = data.map((d, i) => ({ ...d, fill: colors[d.color] || d.color || colors[SERIES_ORDER[i]] }))
  const total = slices.reduce((a, d) => a + d.value, 0)
  return (
    <ChartCard {...card} height={height} empty={!card.loading && !total}>
      <div className="flex h-full flex-col items-center gap-5 min-[520px]:flex-row">
        <div className="relative h-full min-h-[160px] w-full max-w-[220px] flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
              <Pie data={slices} dataKey="value" nameKey="name" innerRadius="66%" outerRadius="94%" paddingAngle={1.5} stroke={colors.surface} strokeWidth={2} isAnimationActive={false}>
                {slices.map((s) => <Cell key={s.name} fill={s.fill} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold tracking-tight text-ink tabular">{centerValue ?? valueFormatter(total)}</span>
            {centerLabel && <span className="text-xs text-ink-3">{centerLabel}</span>}
          </div>
        </div>
        <ul className="w-full min-w-0 flex-1 space-y-2.5">
          {slices.map((s) => (
            <li key={s.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-ink-2"><span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.fill }} aria-hidden /><span className="break-words">{s.name}</span></span>
              <span className="shrink-0 text-ink tabular"><span className="font-semibold">{valueFormatter(s.value)}</span> <span className="text-xs text-ink-4">{total ? Math.round((s.value / total) * 100) : 0}%</span></span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  )
}

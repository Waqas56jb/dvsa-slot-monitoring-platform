import { useEffect, useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { formatDate, formatShortDate, formatTime, formatCompact } from '@/utils/format'

const VARS = {
  series1: '--color-series-1', series2: '--color-series-2', series3: '--color-series-3', series4: '--color-series-4', series5: '--color-series-5',
  grid: '--color-chart-grid', axis: '--color-chart-axis', surface: '--color-surface', ink: '--color-ink', ink3: '--color-ink-3', line: '--color-line',
  success: '--color-success-dot', warning: '--color-warning-dot', danger: '--color-danger-dot', neutral: '--color-neutral-dot', brand: '--color-brand-500',
}

function read() {
  const cs = getComputedStyle(document.documentElement)
  return Object.fromEntries(Object.entries(VARS).map(([k, v]) => [k, cs.getPropertyValue(v).trim()]))
}

/** Resolved chart colours for the current theme (Recharts needs concrete values). */
export function useChartColors() {
  const { resolved } = useTheme()
  const [c, setC] = useState(read)
  useEffect(() => { setC(read()) }, [resolved])
  return c
}

/** Fixed categorical order — colour follows the series, never its rank. */
export const SERIES_ORDER = ['series1', 'series2', 'series3', 'series4', 'series5']

export const axisProps = (colors) => ({
  stroke: colors.axis,
  tick: { fill: colors.axis, fontSize: 11 },
  tickLine: false,
  axisLine: false,
})

export const tickFormatters = {
  day: (t) => formatShortDate(t),
  hour: (t) => formatTime(t),
  month: (t) => formatDate(t).split(' ')[1],
  compact: (v) => formatCompact(v),
}

import { memo, useEffect, useId, useRef, useState } from 'react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useChartColors } from './chartTheme'
import { cn } from '@/utils/cn'

/** Sparkline for KPI tiles. data: [{ t, value }]. Decorative — the tile states the number. */
export const MiniTrend = memo(function MiniTrend({ data, color = 'series1', className }) {
  const colors = useChartColors()
  const id = useId().replace(/:/g, '')
  const stroke = colors[color] || color
  // Only mount the chart while the box has a size (it may be hidden responsively).
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setVisible(el.clientWidth > 0 && el.clientHeight > 0)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn('h-8 w-24', className)} aria-hidden>
      {visible && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
            <defs>
              <linearGradient id={`mt-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.2} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke={stroke} strokeWidth={1.5} fill={`url(#mt-${id})`} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
})

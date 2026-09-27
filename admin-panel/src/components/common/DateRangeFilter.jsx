import { useState } from 'react'
import { CalendarRange, Check, ChevronDown } from 'lucide-react'
import { DropdownMenu } from './DropdownMenu'
import { Button } from './Button'
import { cn } from '@/utils/cn'
import { formatShortDate } from '@/utils/format'

export const DATE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

/**
 * Preset list + custom range behind a divider.
 * value: 'today'|'7d'|'30d'|'90d'|{ from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
 */
export function DateRangeFilter({ value, onChange, presets = DATE_PRESETS, className }) {
  const custom = typeof value === 'object' && value
  const [from, setFrom] = useState(custom?.from || '')
  const [to, setTo] = useState(custom?.to || '')
  const valid = from && to && from <= to
  const label = custom ? `${formatShortDate(custom.from)} – ${formatShortDate(custom.to)}` : presets.find((p) => p.value === value)?.label || 'Select range'

  return (
    <DropdownMenu
      align="end"
      width={260}
      trigger={<Button icon={CalendarRange} iconRight={ChevronDown} className={className}>{label}</Button>}
    >
      {({ close }) => (
        <div>
          <ul className="p-1" role="listbox" aria-label="Date range">
            {presets.map((p) => {
              const on = p.value === value
              return (
                <li key={p.value}>
                  <button type="button" role="option" aria-selected={on} onClick={() => { onChange(p.value); close() }} className={cn('flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-subtle', on ? 'font-semibold text-ink' : 'text-ink-2')}>
                    {p.label}
                    {on && <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />}
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="border-t border-line p-3">
            <p className="mb-2 text-[11px] font-semibold tracking-wide text-ink-4 uppercase">Custom range</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-ink-3">From<input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="mt-1 h-8 w-full rounded-md border border-line-strong bg-surface px-2 text-[13px] text-ink" /></label>
              <label className="text-xs text-ink-3">To<input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="mt-1 h-8 w-full rounded-md border border-line-strong bg-surface px-2 text-[13px] text-ink" /></label>
            </div>
            <Button size="sm" variant="primary" className="mt-2.5 w-full" disabled={!valid} onClick={() => { onChange({ from, to }); close() }}>Apply range</Button>
          </div>
        </div>
      )}
    </DropdownMenu>
  )
}

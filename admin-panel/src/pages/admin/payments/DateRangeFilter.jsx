import { useEffect, useId, useState } from 'react'
import { CalendarRange, Check, ChevronDown } from 'lucide-react'
import { DropdownMenu } from '@/components/common/DropdownMenu'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/forms/Fields'
import { cn } from '@/utils/cn'
import { formatShortDate } from '@/utils/format'

export const RANGE_PRESETS = [{ value: '7', label: 'Last 7 days' }, { value: '30', label: 'Last 30 days' }, { value: '90', label: 'Last 90 days' }]

export function describeRange({ range, from, to }) {
  if (range) return RANGE_PRESETS.find((r) => r.value === range)?.label ?? `Last ${range} days`
  if (from && to) return `${formatShortDate(from)} – ${formatShortDate(to)}`
  if (from) return `From ${formatShortDate(from)}`
  if (to) return `Until ${formatShortDate(to)}`
  return null
}

/**
 * Filter button with preset ranges plus a custom from/to date pair.
 * value: { range, from, to }  onChange({ range, from, to }) — unused keys are null.
 */
export function DateRangeFilter({ value, onChange, label = 'Date' }) {
  const id = useId()
  const [from, setFrom] = useState(value.from || '')
  const [to, setTo] = useState(value.to || '')
  useEffect(() => { setFrom(value.from || ''); setTo(value.to || '') }, [value.from, value.to])

  const summary = describeRange(value)
  const invalid = from && to && from > to

  return (
    <DropdownMenu
      align="start"
      width={272}
      trigger={
        <button
          type="button"
          className={cn(
            'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors',
            summary ? 'border-brand-200 bg-brand-50 text-brand-700 dark:text-brand-300' : 'border-dashed border-line-strong text-ink-2 hover:bg-subtle hover:text-ink',
          )}
        >
          <CalendarRange className={cn('h-3.5 w-3.5', !summary && 'text-ink-4')} aria-hidden />
          {label}
          {summary && <><span className="h-3.5 w-px bg-brand-200" aria-hidden /><span className="max-w-[140px] truncate font-normal">{summary}</span></>}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
        </button>
      }
    >
      {({ close }) => (
        <div>
          <ul className="p-1" aria-label="Preset ranges">
            {RANGE_PRESETS.map((r) => {
              const on = value.range === r.value
              return (
                <li key={r.value}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => { onChange({ range: on ? null : r.value, from: null, to: null }); close() }}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] text-ink-2 hover:bg-subtle hover:text-ink focus:bg-subtle focus:outline-none"
                  >
                    {r.label}
                    {on && <Check className="h-3.5 w-3.5 text-brand-600" aria-hidden />}
                  </button>
                </li>
              )
            })}
          </ul>
          <form
            className="space-y-2.5 border-t border-line p-3"
            onSubmit={(e) => { e.preventDefault(); if (invalid || (!from && !to)) return; onChange({ range: null, from: from || null, to: to || null }); close() }}
          >
            <p className="text-[11px] font-semibold tracking-wide text-ink-4 uppercase">Custom range</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="min-w-0">
                <label htmlFor={`${id}-from`} className="mb-1 block text-xs text-ink-3">From</label>
                <Input id={`${id}-from`} size="sm" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="min-w-0">
                <label htmlFor={`${id}-to`} className="mb-1 block text-xs text-ink-3">To</label>
                <Input id={`${id}-to`} size="sm" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
            {invalid && <p className="text-xs text-danger" role="alert">The start date must be before the end date.</p>}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              {summary ? (
                <button type="button" onClick={() => { onChange({ range: null, from: null, to: null }); close() }} className="text-[13px] text-ink-3 hover:text-ink">Clear</button>
              ) : <span />}
              <Button type="submit" size="sm" variant="primary" disabled={invalid || (!from && !to)}>Apply</Button>
            </div>
          </form>
        </div>
      )}
    </DropdownMenu>
  )
}

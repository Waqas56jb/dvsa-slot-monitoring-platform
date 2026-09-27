import { useMemo, useState } from 'react'
import { Check, ChevronDown, PlusCircle } from 'lucide-react'
import { DropdownMenu } from '@/components/common/DropdownMenu'
import { cn } from '@/utils/cn'

/**
 * Filter button + popover.
 * multiple=true → value is string[]; otherwise string.
 * options: [{ value, label, count? }] or string[]
 */
export function FilterDropdown({ label, options, value, onChange, multiple = true, searchable, width = 232 }) {
  const opts = useMemo(() => options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)), [options])
  const selected = multiple ? value || [] : value ? [value] : []
  const [q, setQ] = useState('')
  const showSearch = searchable ?? opts.length > 8
  const visible = q ? opts.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())) : opts

  const toggle = (v, close) => {
    if (multiple) onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])
    else { onChange(selected[0] === v ? '' : v); close() }
  }

  const summary = selected.length === 0 ? null : selected.length === 1 ? opts.find((o) => o.value === selected[0])?.label : `${selected.length} selected`

  return (
    <DropdownMenu
      align="start"
      width={width}
      onOpenChange={(o) => !o && setQ('')}
      trigger={
        <button
          type="button"
          className={cn(
            'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors',
            selected.length ? 'border-brand-200 bg-brand-50 text-brand-700 dark:text-brand-300' : 'border-dashed border-line-strong text-ink-2 hover:bg-subtle hover:text-ink',
          )}
        >
          {!selected.length && <PlusCircle className="h-3.5 w-3.5 text-ink-4" aria-hidden />}
          {label}
          {summary && <><span className="h-3.5 w-px bg-brand-200" aria-hidden /><span className="max-w-[120px] truncate font-normal">{summary}</span></>}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
        </button>
      }
    >
      {({ close }) => (
        <div>
          {showSearch && (
            <div className="border-b border-line p-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Filter ${label.toLowerCase()}…`} className="h-8 w-full rounded-md bg-subtle px-2.5 text-[13px] text-ink placeholder:text-ink-4 focus:outline-none" aria-label={`Search ${label}`} autoFocus />
            </div>
          )}
          <ul role="listbox" aria-multiselectable={multiple} aria-label={label} className="max-h-64 overflow-y-auto p-1">
            {visible.map((o) => {
              const on = selected.includes(o.value)
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => toggle(o.value, close)}
                    className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] text-ink-2 hover:bg-subtle hover:text-ink focus:bg-subtle focus:outline-none"
                  >
                    <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center border', multiple ? 'rounded' : 'rounded-full', on ? 'border-brand-600 bg-brand-600 text-white' : 'border-line-strong')}>
                      {on && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="flex-1 truncate">{o.label}</span>
                    {o.count != null && <span className="text-xs text-ink-4 tabular">{o.count}</span>}
                  </button>
                </li>
              )
            })}
            {!visible.length && <li className="px-2 py-3 text-center text-xs text-ink-3">No matches</li>}
          </ul>
          {selected.length > 0 && (
            <div className="border-t border-line p-1">
              <button type="button" onClick={() => { onChange(multiple ? [] : ''); close() }} className="w-full rounded-md px-2 py-1.5 text-center text-[13px] text-ink-3 hover:bg-subtle hover:text-ink">
                Clear filter
              </button>
            </div>
          )}
        </div>
      )}
    </DropdownMenu>
  )
}

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Badge } from '@/components/common/StatusBadge'
import { cn } from '@/utils/cn'

/**
 * Multi-select list of test centres with search and removable chips.
 * centres: [{ id, name, shortName, region, status }]; value: string[] of ids.
 * Inactive centres can't be newly selected (they're not being checked).
 */
export function CentrePicker({ centres = [], value = [], onChange, loading, error, id, describedBy, max = 5 }) {
  const [q, setQ] = useState('')
  const byId = useMemo(() => Object.fromEntries(centres.map((c) => [c.id, c])), [centres])
  const visible = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? centres.filter((c) => `${c.name} ${c.region}`.toLowerCase().includes(s)) : centres
  }, [centres, q])
  const toggle = (cid) => onChange(value.includes(cid) ? value.filter((x) => x !== cid) : [...value, cid])
  const atMax = value.length >= max

  return (
    <div className={cn('rounded-lg border bg-surface', error ? 'border-danger-dot' : 'border-line-strong')}>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-b border-line p-2">
          {value.map((cid) => (
            <span key={cid} className="inline-flex max-w-full items-center gap-1 rounded-full bg-brand-50 py-0.5 pr-1 pl-2.5 text-xs font-medium text-brand-700 dark:text-brand-300">
              <span className="truncate">{byId[cid]?.shortName || cid}</span>
              <button type="button" onClick={() => toggle(cid)} className="rounded-full p-0.5 hover:bg-brand-100" aria-label={`Remove ${byId[cid]?.shortName || cid}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative border-b border-line">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-ink-4" aria-hidden />
        <input
          id={id}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search centres…"
          aria-describedby={describedBy}
          className="h-9 w-full rounded-t-lg bg-transparent pr-3 pl-8 text-[13px] text-ink placeholder:text-ink-4 focus:outline-none"
        />
      </div>
      <ul role="listbox" aria-multiselectable="true" aria-label="Test centres" className="max-h-52 overflow-y-auto p-1">
        {loading && <li className="px-2 py-3 text-center text-xs text-ink-3">Loading centres…</li>}
        {!loading && !visible.length && <li className="px-2 py-3 text-center text-xs text-ink-3">No centres match “{q}”.</li>}
        {!loading && visible.map((c) => {
          const on = value.includes(c.id)
          const inactive = c.status !== 'Active'
          const disabled = !on && (inactive || atMax)
          return (
            <li key={c.id}>
              <button
                type="button"
                role="option"
                aria-selected={on}
                disabled={disabled}
                onClick={() => toggle(c.id)}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] text-ink-2 hover:bg-subtle focus:bg-subtle focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <input type="checkbox" readOnly tabIndex={-1} checked={on} className="h-4 w-4 shrink-0 accent-brand-600" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{c.shortName}</span>
                {inactive ? <Badge size="sm">Inactive</Badge> : <span className="shrink-0 text-xs text-ink-4">{c.region}</span>}
              </button>
            </li>
          )
        })}
      </ul>
      <p className="border-t border-line px-2.5 py-1.5 text-[11px] text-ink-4">{value.length} of {max} selected</p>
    </div>
  )
}

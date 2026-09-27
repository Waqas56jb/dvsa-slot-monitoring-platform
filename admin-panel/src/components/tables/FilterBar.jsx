import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { SearchInput } from './SearchInput'
import { Button } from '@/components/common/Button'
import { cn } from '@/utils/cn'

/**
 * Toolbar above a table: search + filter controls + right-side actions, then
 * a row of removable chips for active filters. On mobile, filters collapse
 * behind a "Filters" toggle.
 *
 * chips: [{ key, label, onRemove }]
 */
export function FilterBar({ search, onSearch, searchPlaceholder, filters, actions, chips = [], onReset, className }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {onSearch && <SearchInput value={search} onChange={onSearch} placeholder={searchPlaceholder} className="w-full lg:max-w-xs" />}
          {filters && (
            <Button variant="secondary" className="lg:hidden" icon={SlidersHorizontal} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
              Filters{chips.length ? ` (${chips.length})` : ''}
            </Button>
          )}
          {filters && <div className="hidden flex-wrap items-center gap-2 lg:flex">{filters}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {filters && open && <div className="flex flex-wrap items-center gap-2 lg:hidden">{filters}</div>}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((c) => (
            <span key={c.key} className="inline-flex items-center gap-1 rounded-full border border-line bg-surface py-0.5 pr-1 pl-2.5 text-xs text-ink-2">
              {c.label}
              <button type="button" onClick={c.onRemove} className="rounded-full p-0.5 text-ink-4 hover:bg-subtle hover:text-ink" aria-label={`Remove filter ${c.label}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {onReset && <button type="button" onClick={onReset} className="ml-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">Reset filters</button>}
        </div>
      )}
    </div>
  )
}

/**
 * Build chips from useListQuery state.
 * defs: { status: { label: 'Status', format?: (v) => string } }
 */
export function buildChips(list, defs) {
  const chips = []
  if (list.searchInput) chips.push({ key: 'search', label: `Search: “${list.searchInput}”`, onRemove: () => list.setSearchInput('') })
  for (const [key, val] of Object.entries(list.filters)) {
    const def = defs[key]
    if (!def) continue
    const vals = Array.isArray(val) ? val : [val]
    chips.push({ key, label: `${def.label}: ${vals.map((v) => (def.format ? def.format(v) : v)).join(', ')}`, onRemove: () => list.setFilter(key, null) })
  }
  return chips
}

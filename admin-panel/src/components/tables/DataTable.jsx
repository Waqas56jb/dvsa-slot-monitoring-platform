import { memo, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ChevronsUpDown, Columns3, SearchX } from 'lucide-react'
import { Checkbox } from '@/components/forms/Fields'
import { DropdownMenu } from '@/components/common/DropdownMenu'
import { Button } from '@/components/common/Button'
import { SkeletonTable } from '@/components/common/LoadingSkeleton'
import { EmptyState, ErrorState } from '@/components/common/States'
import { Pagination } from './Pagination'
import { ActionMenu } from './ActionMenu'
import { cn } from '@/utils/cn'

/**
 * Reusable data table.
 *
 * columns: [{
 *   key, header, cell?: (row) => node, sortable?, sortKey?, align?: 'left'|'right'|'center',
 *   width?, className?, hideable? (default true), defaultHidden?,
 *   mobile?: 'primary' | 'secondary' | 'badge' | 'hidden'   (card layout role below md)
 * }]
 *
 * Data props:   rows, loading, error, onRetry, getRowId (default row.id)
 * Paging:       total, page, pageSize, onPageChange, onPageSizeChange (omit to hide pagination)
 * Sorting:      sort = { key, order }, onSort(key)
 * Selection:    selectable, selectedIds, onSelectionChange(ids[]), bulkActions: (ids, clear) => node
 * Rows:         onRowClick(row), rowActions(row) → ActionMenu items
 * Empty:        emptyState (node) or emptyTitle / emptyDescription / emptyIcon; filtered (bool) switches copy
 * Chrome:       toolbar (node rendered above the table), title, columnToggle (default true), dense
 */
export function DataTable({
  columns, rows = [], loading, error, onRetry, getRowId = (r) => r.id,
  total, page, pageSize, onPageChange, onPageSizeChange,
  sort, onSort,
  selectable, selectedIds = [], onSelectionChange, bulkActions,
  onRowClick, rowActions,
  emptyState, emptyTitle = 'Nothing here yet', emptyDescription, emptyIcon, filtered = false, onResetFilters,
  toolbar, columnToggle = true, dense = false, className, caption,
}) {
  const [hidden, setHidden] = useState(() => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.key)))
  const visibleCols = useMemo(() => columns.filter((c) => !hidden.has(c.key)), [columns, hidden])
  const ids = rows.map(getRowId)
  const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id))
  const someSelected = ids.some((id) => selectedIds.includes(id))

  const toggleAll = () => onSelectionChange?.(allSelected ? selectedIds.filter((id) => !ids.includes(id)) : [...new Set([...selectedIds, ...ids])])
  const toggleOne = (id) => onSelectionChange?.(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id])

  const showEmpty = !loading && !error && rows.length === 0
  const hasPagination = onPageChange && total != null

  const columnMenu = columnToggle && columns.some((c) => c.hideable !== false) && (
    <DropdownMenu align="end" width={220} trigger={<Button variant="secondary" size="md" icon={Columns3}>Columns</Button>}>
      {() => (
        <div className="p-1.5">
          <p className="px-2 pt-1 pb-1.5 text-[11px] font-semibold tracking-wide text-ink-4 uppercase">Visible columns</p>
          {columns.filter((c) => c.hideable !== false && c.header).map((c) => (
            <div key={c.key} className="rounded-md px-2 py-1.5 hover:bg-subtle">
              <Checkbox
                checked={!hidden.has(c.key)}
                label={c.header}
                onChange={() => setHidden((h) => { const n = new Set(h); n.has(c.key) ? n.delete(c.key) : n.add(c.key); return n })}
              />
            </div>
          ))}
        </div>
      )}
    </DropdownMenu>
  )

  return (
    <div className={cn('card min-w-0 overflow-hidden', className)}>
      {(toolbar || columnMenu) && (
        <div className="flex items-start gap-2 border-b border-line p-3 sm:p-4">
          <div className="min-w-0 flex-1">{toolbar}</div>
          {columnMenu && <div className="hidden shrink-0 md:block">{columnMenu}</div>}
        </div>
      )}

      <AnimatePresence>
        {selectable && selectedIds.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-brand-100 bg-brand-50">
            <div className="flex flex-wrap items-center gap-3 px-4 py-2.5">
              <span className="text-[13px] font-medium text-brand-700 dark:text-brand-300">{selectedIds.length} selected</span>
              <div className="flex flex-wrap items-center gap-2">{bulkActions?.(selectedIds, () => onSelectionChange([]))}</div>
              <button type="button" onClick={() => onSelectionChange([])} className="ml-auto text-[13px] text-ink-3 hover:text-ink">Clear selection</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error ? (
        <ErrorState compact message={error.message || 'Unable to load data. Please try again.'} onRetry={onRetry} />
      ) : loading && rows.length === 0 ? (
        <SkeletonTable rows={Math.min(pageSize || 8, 8)} columns={Math.min(visibleCols.length, 6)} />
      ) : showEmpty ? (
        emptyState || (
          filtered ? (
            <EmptyState icon={SearchX} title="No results match your filters" description="Try a different search term or clear some filters." action={onResetFilters && <Button variant="secondary" onClick={onResetFilters}>Reset filters</Button>} />
          ) : (
            <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
          )
        )
      ) : (
        <div className={cn('relative transition-opacity', loading && 'pointer-events-none opacity-60')} aria-busy={loading}>
          {/* Desktop / tablet table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left text-sm">
              {caption && <caption className="sr-only">{caption}</caption>}
              <thead>
                <tr className="border-b border-line bg-subtle/70">
                  {selectable && (
                    <th scope="col" className="w-10 py-2.5 pl-4">
                      <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} aria-label="Select all rows on this page" />
                    </th>
                  )}
                  {visibleCols.map((c) => <HeaderCell key={c.key} col={c} sort={sort} onSort={onSort} />)}
                  {rowActions && <th scope="col" className="w-12 py-2.5 pr-3"><span className="sr-only">Actions</span></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => {
                  const id = getRowId(row)
                  return (
                    <Row key={id} row={row} id={id} cols={visibleCols} selectable={selectable} selected={selectedIds.includes(id)} onToggle={toggleOne} onRowClick={onRowClick} rowActions={rowActions} dense={dense} />
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-line md:hidden">
            {rows.map((row) => {
              const id = getRowId(row)
              return <MobileCard key={id} row={row} id={id} cols={columns} selectable={selectable} selected={selectedIds.includes(id)} onToggle={toggleOne} onRowClick={onRowClick} rowActions={rowActions} />
            })}
          </ul>
        </div>
      )}

      {hasPagination && !error && rows.length > 0 && (
        <div className="border-t border-line">
          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
        </div>
      )}
    </div>
  )
}

function HeaderCell({ col, sort, onSort }) {
  const sortKey = col.sortKey || col.key
  const active = sort?.key === sortKey
  const ariaSort = active ? (sort.order === 'asc' ? 'ascending' : 'descending') : col.sortable ? 'none' : undefined
  const align = col.align === 'right' ? 'text-right justify-end' : col.align === 'center' ? 'text-center justify-center' : ''
  return (
    <th scope="col" aria-sort={ariaSort} style={{ width: col.width }} className={cn('px-4 py-2.5 text-xs font-medium whitespace-nowrap text-ink-3', align, col.headerClassName)}>
      {col.sortable && onSort ? (
        <button type="button" onClick={() => onSort(sortKey)} className={cn('group inline-flex items-center gap-1 rounded hover:text-ink', align, active && 'text-ink')}>
          {col.header}
          {active ? (sort.order === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ChevronsUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />}
        </button>
      ) : col.header}
    </th>
  )
}

const Row = memo(function Row({ row, id, cols, selectable, selected, onToggle, onRowClick, rowActions, dense }) {
  const clickable = !!onRowClick
  return (
    <tr
      className={cn('group transition-colors', selected ? 'bg-brand-50/60' : 'hover:bg-subtle/60', clickable && 'cursor-pointer')}
      onClick={clickable ? (e) => { if (e.target.closest('a,button,input,label')) return; onRowClick(row) } : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' && e.target === e.currentTarget) onRowClick(row) } : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {selectable && (
        <td className="w-10 py-3 pl-4">
          <Checkbox checked={selected} onChange={() => onToggle(id)} aria-label={`Select row ${id}`} />
        </td>
      )}
      {cols.map((c) => (
        <td key={c.key} className={cn('px-4 align-middle text-ink-2', dense ? 'py-2' : 'py-3', c.align === 'right' && 'text-right', c.align === 'center' && 'text-center', c.className)}>
          {c.cell ? c.cell(row) : row[c.key] ?? '—'}
        </td>
      ))}
      {rowActions && (
        <td className="w-12 py-2 pr-3 text-right">
          <ActionMenu items={rowActions(row)} />
        </td>
      )}
    </tr>
  )
})

function MobileCard({ row, id, cols, selectable, selected, onToggle, onRowClick, rowActions }) {
  const primary = cols.find((c) => c.mobile === 'primary') || cols[0]
  const badge = cols.find((c) => c.mobile === 'badge')
  const secondary = cols.filter((c) => c !== primary && c !== badge && c.mobile !== 'hidden' && c.header).slice(0, 4)
  const render = (c) => (c.cell ? c.cell(row) : row[c.key] ?? '—')
  return (
    <li
      className={cn('flex gap-3 px-4 py-3.5', selected && 'bg-brand-50/60', onRowClick && 'cursor-pointer active:bg-subtle')}
      onClick={onRowClick ? (e) => { if (e.target.closest('a,button,input,label')) return; onRowClick(row) } : undefined}
    >
      {selectable && <div className="pt-0.5"><Checkbox checked={selected} onChange={() => onToggle(id)} aria-label={`Select row ${id}`} /></div>}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 text-sm">{render(primary)}</div>
          <div className="flex shrink-0 items-center gap-1">
            {badge && render(badge)}
            {rowActions && <ActionMenu items={rowActions(row)} size="xs" />}
          </div>
        </div>
        {secondary.length > 0 && (
          <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2">
            {secondary.map((c) => (
              <div key={c.key} className="min-w-0">
                <dt className="text-[11px] text-ink-4">{c.header}</dt>
                <dd className="mt-0.5 truncate text-[13px] text-ink-2">{render(c)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </li>
  )
}

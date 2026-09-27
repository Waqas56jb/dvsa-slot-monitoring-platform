import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatNumber } from '@/utils/format'
import { PAGE_SIZE_OPTIONS } from '@/constants/config'

function pageList(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  const set = new Set([1, pages, page - 1, page, page + 1])
  const arr = [...set].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b)
  const out = []
  arr.forEach((p, i) => { if (i && p - arr[i - 1] > 1) out.push('…'); out.push(p) })
  return out
}

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange, className }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total ? (page - 1) * pageSize + 1 : 0
  const to = Math.min(total, page * pageSize)
  const btn = 'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40'
  return (
    <nav aria-label="Pagination" className={cn('flex flex-col-reverse items-center justify-between gap-3 px-4 py-3 sm:flex-row', className)}>
      <div className="flex items-center gap-3 text-[13px] text-ink-3">
        <span className="tabular">
          Showing <span className="font-medium text-ink">{formatNumber(from)}–{formatNumber(to)}</span> of <span className="font-medium text-ink">{formatNumber(total)}</span>
        </span>
        {onPageSizeChange && (
          <label className="hidden items-center gap-1.5 sm:flex">
            <span className="sr-only">Rows per page</span>
            <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))} className="h-8 rounded-md border border-line bg-surface px-2 text-[13px] text-ink-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </label>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button type="button" className={cn(btn, 'text-ink-2 hover:bg-subtle')} onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="hidden items-center gap-1 sm:flex">
          {pageList(page, pages).map((p, i) =>
            p === '…' ? <span key={`e${i}`} className="px-1 text-ink-4">…</span> : (
              <button key={p} type="button" onClick={() => onPageChange(p)} aria-current={p === page ? 'page' : undefined} className={cn(btn, 'tabular', p === page ? 'bg-ink text-canvas' : 'text-ink-2 hover:bg-subtle')}>{p}</button>
            ),
          )}
        </div>
        <span className="px-2 text-[13px] text-ink-3 sm:hidden">{page} / {pages}</span>
        <button type="button" className={cn(btn, 'text-ink-2 hover:bg-subtle')} onClick={() => onPageChange(page + 1)} disabled={page >= pages} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}

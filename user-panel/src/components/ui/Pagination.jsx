import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

function pageList(page, count) {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const set = new Set([1, count, page - 1, page, page + 1]);
  const sorted = [...set].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push(`gap${p}`);
    out.push(p);
  });
  return out;
}

export function Pagination({ page, pageCount, onChange, total, pageSize, className }) {
  if (pageCount <= 1 && !total) return null;
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = total ? Math.min(total, page * pageSize) : 0;
  const btn = 'inline-flex size-10 items-center justify-center rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none';

  return (
    <nav aria-label="Pagination" className={cn('flex flex-col items-center justify-between gap-3 sm:flex-row', className)}>
      {total !== undefined && (
        <p className="text-sm text-muted">
          Showing <span className="font-medium text-ink">{from}</span>–<span className="font-medium text-ink">{to}</span> of{' '}
          <span className="font-medium text-ink">{total}</span>
        </p>
      )}
      <div className="flex items-center gap-1">
        <button type="button" className={cn(btn, 'text-ink-soft hover:bg-surface-muted')} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </button>
        {pageList(page, pageCount).map((p) =>
          typeof p === 'string' ? (
            <span key={p} className="px-1 text-subtle" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Page ${p}`}
              className={cn(btn, p === page ? 'bg-ink text-surface' : 'text-ink-soft hover:bg-surface-muted')}
            >
              {p}
            </button>
          ),
        )}
        <button type="button" className={cn(btn, 'text-ink-soft hover:bg-surface-muted')} onClick={() => onChange(page + 1)} disabled={page >= pageCount} aria-label="Next page">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}

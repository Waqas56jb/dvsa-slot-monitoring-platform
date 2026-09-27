import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Search input. Pair with `useDebounce` in the page for debounced queries.
 */
export const SearchBar = forwardRef(function SearchBar(
  { value, onChange, placeholder = 'Search…', label = 'Search', className, size = 'md', autoFocus, onKeyDown, id },
  ref,
) {
  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-subtle" aria-hidden="true" />
      <input
        ref={ref}
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        className={cn(
          'w-full rounded-xl border border-line-strong bg-surface pl-11 pr-10 text-[15px] text-ink placeholder:text-subtle outline-none transition-[border-color,box-shadow]',
          'focus:border-brand focus:ring-4 focus:ring-brand/12 [&::-webkit-search-cancel-button]:hidden',
          size === 'sm' ? 'h-10 text-sm' : 'h-11',
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-ink"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
});

/** Horizontal bar for search + filters that stacks on mobile. */
export function FilterBar({ children, className }) {
  return <div className={cn('flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center', className)}>{children}</div>;
}

/** Pill-style filter chips (single select). options: [{ value, label, count? }] */
export function FilterChips({ options, value, onChange, label = 'Filter' }) {
  return (
    <div role="radiogroup" aria-label={label} className="scrollbar-thin -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors',
              active ? 'bg-ink text-surface' : 'bg-surface text-ink-soft ring-1 ring-line hover:ring-line-strong hover:text-ink',
            )}
          >
            {o.label}
            {o.count !== undefined && <span className={cn('text-xs tabular-nums', active ? 'text-surface/70' : 'text-subtle')}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

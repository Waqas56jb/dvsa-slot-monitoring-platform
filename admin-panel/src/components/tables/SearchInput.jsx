import { forwardRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export const SearchInput = forwardRef(function SearchInput({ value, onChange, placeholder = 'Search…', className, label = 'Search', size = 'md', ...props }, ref) {
  return (
    <div className={cn('relative min-w-0', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-4" aria-hidden />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={cn(
          'w-full rounded-lg border border-line-strong bg-surface pr-8 pl-9 text-sm text-ink placeholder:text-ink-4 hover:border-ink-4',
          'focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/15 focus:outline-none [&::-webkit-search-cancel-button]:hidden',
          size === 'sm' ? 'h-8' : 'h-9',
        )}
        {...props}
      />
      {value && (
        <button type="button" onClick={() => onChange('')} className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-ink-4 hover:text-ink" aria-label="Clear search">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
})

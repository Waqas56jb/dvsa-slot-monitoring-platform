import { useId, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { formatNumber } from '@/utils/format'

/**
 * Underline tabs with keyboard support (←/→/Home/End).
 * tabs: [{ value, label, count?, icon? }]
 */
export function Tabs({ tabs, value, onChange, className, size = 'md' }) {
  const layoutId = useId()
  const listRef = useRef(null)
  const onKey = (e) => {
    const idx = tabs.findIndex((t) => t.value === value)
    let next = null
    if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length
    if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = tabs.length - 1
    if (next != null) {
      e.preventDefault()
      onChange(tabs[next].value)
      listRef.current?.querySelectorAll('[role=tab]')[next]?.focus()
    }
  }
  return (
    <div className={cn('relative -mb-px overflow-x-auto scrollbar-none', className)}>
      <div ref={listRef} role="tablist" onKeyDown={onKey} className="flex min-w-max gap-1 border-b border-line">
        {tabs.map((t) => {
          const active = t.value === value
          const Icon = t.icon
          return (
            <button
              key={t.value}
              role="tab"
              type="button"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(t.value)}
              className={cn(
                'relative flex items-center gap-2 px-3 font-medium whitespace-nowrap transition-colors focus-visible:outline-offset-[-2px]',
                size === 'sm' ? 'h-9 text-[13px]' : 'h-11 text-sm',
                active ? 'text-ink' : 'text-ink-3 hover:text-ink-2',
              )}
            >
              {Icon && <Icon className="h-4 w-4" aria-hidden />}
              {t.label}
              {t.count != null && (
                <span className={cn('rounded-full px-1.5 py-px text-[11px] tabular', active ? 'bg-brand-50 text-brand-700 dark:text-brand-300' : 'bg-subtle text-ink-3')}>{formatNumber(t.count)}</span>
              )}
              {active && <motion.span layoutId={layoutId} className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Compact pill switcher: <SegmentedControl options={[{value,label}]} value onChange size="sm" /> */
export function SegmentedControl({ options, value, onChange, size = 'sm', className, label }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex shrink-0 items-center rounded-lg border border-line bg-subtle p-0.5', className)}>
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-md font-medium whitespace-nowrap transition-all',
              size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-[13px]',
              active ? 'bg-surface text-ink shadow-[0_1px_2px_rgb(16_24_40/0.08)] ring-1 ring-line' : 'text-ink-3 hover:text-ink',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

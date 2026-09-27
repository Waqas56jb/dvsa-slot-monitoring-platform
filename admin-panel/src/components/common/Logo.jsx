import { cn } from '@/utils/cn'
import { APP_NAME } from '@/constants/config'

/** SlotPilot mark: a stylised route line ending in a signal dot. */
export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-8 w-8', className)} aria-hidden>
      <defs>
        <linearGradient id="sp-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f86ff" />
          <stop offset="1" stopColor="#2459d8" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#sp-g)" />
      <path d="M8.5 21.5c3.2 0 4.2-2.6 5.4-5.5 1.3-3.1 2.5-6 6.3-6h3.3" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="23.6" cy="10" r="2.6" fill="#fff" />
      <circle cx="8.5" cy="21.5" r="1.6" fill="#fff" opacity=".7" />
    </svg>
  )
}

export function Logo({ collapsed = false, className, inverse = false, subtitle = 'Admin' }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className="shrink-0" />
      {!collapsed && (
        <span className="flex min-w-0 flex-col leading-none">
          <span className={cn('text-[15px] font-semibold tracking-[-0.01em]', inverse ? 'text-white' : 'text-ink')}>{APP_NAME}</span>
          {subtitle && <span className={cn('mt-1 text-[11px] font-medium tracking-wide uppercase', inverse ? 'text-nav-ink-2' : 'text-ink-3')}>{subtitle}</span>}
        </span>
      )}
    </span>
  )
}

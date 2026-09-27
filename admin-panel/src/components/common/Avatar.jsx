import { initials } from '@/utils/format'
import { cn } from '@/utils/cn'

// Muted, harmonious avatar backgrounds (not status colours).
const PALETTE = [
  'bg-[#e8eefc] text-[#2a4fa8] dark:bg-[#1c2a4a] dark:text-[#9db8f5]',
  'bg-[#e9f5f0] text-[#1f6b50] dark:bg-[#15302a] dark:text-[#86d3b4]',
  'bg-[#f5ecfa] text-[#6b3a8f] dark:bg-[#2c1c38] dark:text-[#c9a3e6]',
  'bg-[#fbefe6] text-[#94502a] dark:bg-[#35231a] dark:text-[#eab58f]',
  'bg-[#eef0f3] text-[#434c5e] dark:bg-[#232b3a] dark:text-[#b5bdcb]',
  'bg-[#e6f4f8] text-[#1e6479] dark:bg-[#152c34] dark:text-[#8fcfe0]',
]
const hash = (s = '') => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
const SIZES = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-9 w-9 text-[13px]', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-xl' }

export function Avatar({ name, src, size = 'md', className, square = false }) {
  const cls = cn('inline-flex shrink-0 select-none items-center justify-center font-semibold', square ? 'rounded-lg' : 'rounded-full', SIZES[size], className)
  if (src) return <img src={src} alt="" loading="lazy" className={cn(cls, 'object-cover')} />
  return (
    <span className={cn(cls, PALETTE[hash(name) % PALETTE.length])} aria-hidden>
      {initials(name)}
    </span>
  )
}

/** Avatar + name + secondary line, used in table cells and headers. */
export function Identity({ name, subtitle, size = 'sm', className, avatar = true, to, LinkComponent }) {
  const Name = to && LinkComponent ? LinkComponent : 'span'
  return (
    <span className={cn('flex min-w-0 items-center gap-2.5', className)}>
      {avatar && <Avatar name={name} size={size} />}
      <span className="min-w-0">
        <Name {...(to ? { to } : {})} className={cn('block truncate font-medium text-ink', to && 'hover:text-brand-600 dark:hover:text-brand-300')}>{name}</Name>
        {subtitle && <span className="block truncate text-xs text-ink-3">{subtitle}</span>}
      </span>
    </span>
  )
}

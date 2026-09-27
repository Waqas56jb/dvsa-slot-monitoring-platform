import { Globe, Mail, MessageSquare, Webhook, Bell } from 'lucide-react'
import { cn } from '@/utils/cn'

export const CHANNEL_ICONS = { Browser: Globe, Email: Mail, SMS: MessageSquare, Webhook }

/** Notification channel with icon. `compact` renders a small bordered chip. */
export function ChannelLabel({ channel, compact = false, className }) {
  const Icon = CHANNEL_ICONS[channel] || Bell
  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1 rounded-md border border-line bg-subtle px-1.5 py-0.5 text-[11px] font-medium text-ink-2', className)}>
        <Icon className="h-3 w-3 text-ink-3" aria-hidden />
        {channel}
      </span>
    )
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-ink-2', className)}>
      <Icon className="h-3.5 w-3.5 shrink-0 text-ink-3" aria-hidden />
      {channel}
    </span>
  )
}

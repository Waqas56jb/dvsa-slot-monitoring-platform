import { useNavigate } from 'react-router-dom'
import { Bell, CalendarCheck2, CheckCheck, CreditCard, LifeBuoy, Radar, TriangleAlert } from 'lucide-react'
import { DropdownMenu } from '@/components/common/DropdownMenu'
import { Button } from '@/components/common/Button'
import { useInbox } from '@/context/NotificationContext'
import { formatRelative } from '@/utils/format'
import { cn } from '@/utils/cn'
import { useNow } from '@/hooks/useUtils'

const KIND = {
  slot: { icon: CalendarCheck2, cls: 'bg-brand-50 text-brand-600 dark:text-brand-300' },
  monitoring: { icon: Radar, cls: 'bg-danger-soft text-danger' },
  payment: { icon: CreditCard, cls: 'bg-warning-soft text-warning' },
  support: { icon: LifeBuoy, cls: 'bg-info-soft text-info' },
  system: { icon: TriangleAlert, cls: 'bg-warning-soft text-warning' },
}

export function NotificationDropdown() {
  const { items, unreadCount, markRead, markAllRead } = useInbox()
  const navigate = useNavigate()
  const now = useNow(20000)
  return (
    <DropdownMenu
      align="end"
      width={380}
      trigger={
        <button type="button" className="relative rounded-lg p-2 text-ink-3 transition-colors hover:bg-subtle hover:text-ink" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}>
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-dot px-1 text-[10px] font-semibold text-white ring-2 ring-surface">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
      }
    >
      {({ close }) => (
        <div>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Notifications</p>
              <p className="text-xs text-ink-3">{unreadCount ? `${unreadCount} unread` : 'You’re all caught up'}</p>
            </div>
            <Button variant="ghost" size="xs" icon={CheckCheck} onClick={markAllRead} disabled={!unreadCount}>Mark all read</Button>
          </div>
          <ul className="max-h-[380px] divide-y divide-line overflow-y-auto">
            {items.length === 0 && <li className="px-4 py-10 text-center text-sm text-ink-3">No notifications</li>}
            {items.map((n) => {
              const k = KIND[n.kind] || KIND.system
              const Icon = k.icon
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => { markRead(n.id); close(); navigate(n.href) }}
                    className={cn('flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-subtle', !n.read && 'bg-brand-50/40')}
                  >
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', k.cls)}><Icon className="h-4 w-4" aria-hidden /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className={cn('truncate text-[13px] text-ink', !n.read && 'font-semibold')}>{n.title}</span>
                        <span className="shrink-0 text-[11px] text-ink-4">{formatRelative(n.createdAt, now)}</span>
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-ink-3">{n.body}</span>
                    </span>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-label="Unread" />}
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="border-t border-line p-1.5">
            <button type="button" onClick={() => { close(); navigate('/admin/notifications') }} className="w-full rounded-md py-2 text-center text-[13px] font-medium text-brand-600 hover:bg-subtle dark:text-brand-300">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </DropdownMenu>
  )
}

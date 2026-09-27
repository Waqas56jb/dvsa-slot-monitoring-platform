import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, Moon, Search, Settings, Sun, User } from 'lucide-react'
import { Breadcrumbs } from './Breadcrumbs'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { DropdownMenu } from '@/components/common/DropdownMenu'
import { Avatar } from '@/components/common/Avatar'
import { Kbd } from '@/components/common/Misc'
import { Tooltip } from '@/components/common/Tooltip'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useTheme } from '@/context/ThemeContext'
import { PERMISSIONS } from '@/constants/permissions'
import { cn } from '@/utils/cn'

const STATUS_STYLE = {
  Operational: { dot: 'bg-success-dot', label: 'All systems operational' },
  Degraded: { dot: 'bg-warning-dot', label: 'Degraded performance' },
  Down: { dot: 'bg-danger-dot', label: 'Service disruption' },
}

export function AdminHeader({ onOpenNav, onOpenSearch, onLogout, systemStatus = 'Operational' }) {
  const { admin, roleLabel, can } = useAdminAuth()
  const { resolved, toggle } = useTheme()
  const navigate = useNavigate()
  const status = STATUS_STYLE[systemStatus] || STATUS_STYLE.Operational
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-md sm:px-6">
      <button type="button" onClick={onOpenNav} className="-ml-1 rounded-lg p-2 text-ink-2 hover:bg-subtle lg:hidden" aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </button>

      <Breadcrumbs className="hidden min-w-0 flex-1 md:block" />
      <div className="flex-1 md:hidden" />

      <button
        type="button"
        onClick={onOpenSearch}
        className="group hidden h-9 w-64 items-center gap-2 rounded-lg border border-line bg-subtle px-3 text-[13px] text-ink-4 transition-colors hover:border-line-strong hover:text-ink-3 sm:flex xl:w-80"
        aria-label="Search users, learners, jobs, slots and centres"
      >
        <Search className="h-4 w-4" aria-hidden />
        <span className="flex-1 truncate text-left">Search users, jobs, slots…</span>
        <span className="flex items-center gap-0.5"><Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd><Kbd>K</Kbd></span>
      </button>
      <button type="button" onClick={onOpenSearch} className="rounded-lg p-2 text-ink-3 hover:bg-subtle hover:text-ink sm:hidden" aria-label="Search">
        <Search className="h-[18px] w-[18px]" />
      </button>

      {can(PERMISSIONS.SYSTEM_VIEW) && (
        <Tooltip content={status.label} side="bottom">
          <button type="button" onClick={() => navigate('/admin/system-health')} className="hidden items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-ink-3 hover:bg-subtle hover:text-ink md:flex" aria-label={`System status: ${status.label}`}>
            <span className="relative flex h-2 w-2">
              <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-50', status.dot)} />
              <span className={cn('relative inline-flex h-2 w-2 rounded-full', status.dot)} />
            </span>
            <span className="hidden xl:inline">{systemStatus === 'Operational' ? 'Operational' : systemStatus}</span>
          </button>
        </Tooltip>
      )}

      <Tooltip content={resolved === 'dark' ? 'Light mode' : 'Dark mode'} side="bottom">
        <button type="button" onClick={toggle} className="rounded-lg p-2 text-ink-3 hover:bg-subtle hover:text-ink" aria-label={`Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode`}>
          {resolved === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>
      </Tooltip>

      <NotificationDropdown />

      <div className="mx-1 hidden h-6 w-px bg-line sm:block" aria-hidden />

      <DropdownMenu
        align="end"
        width={240}
        trigger={
          <button type="button" className="flex items-center gap-2.5 rounded-lg p-1 pr-1.5 hover:bg-subtle" aria-label="Account menu">
            <Avatar name={admin?.name} size="sm" />
            <span className="hidden min-w-0 text-left lg:block">
              <span className="block max-w-[140px] truncate text-[13px] leading-4 font-medium text-ink">{admin?.name}</span>
              <span className="block text-[11px] leading-4 text-ink-3">{roleLabel}</span>
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-ink-4 lg:block" aria-hidden />
          </button>
        }
        items={[
          { type: 'label', label: admin?.email },
          { label: 'Profile', icon: User, to: '/admin/profile' },
          { label: 'Settings', icon: Settings, to: '/admin/settings', hidden: !can(PERMISSIONS.SETTINGS_VIEW) },
          { type: 'separator' },
          { label: 'Log out', icon: LogOut, onSelect: onLogout, danger: true },
        ]}
      />
    </header>
  )
}

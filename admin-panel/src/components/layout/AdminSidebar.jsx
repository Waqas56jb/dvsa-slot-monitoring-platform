import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react'
import { NAV_GROUPS } from '@/constants/navigation'
import { Logo } from '@/components/common/Logo'
import { Avatar } from '@/components/common/Avatar'
import { Tooltip } from '@/components/common/Tooltip'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { cn } from '@/utils/cn'

/**
 * Navigation. Fixed + collapsible on desktop; rendered inside a Drawer on mobile.
 * `badges` maps badgeKey → number (e.g. failed monitoring jobs).
 */
export function AdminSidebar({ collapsed = false, onToggleCollapse, onNavigate, onLogout, badges = {}, mobile = false }) {
  const { admin, roleLabel, can } = useAdminAuth()

  return (
    <div className="flex h-full flex-col bg-nav text-nav-ink">
      <div className={cn('flex h-16 shrink-0 items-center border-b border-nav-line', collapsed ? 'justify-center px-0' : 'justify-between px-5')}>
        <NavLink to="/admin/dashboard" onClick={onNavigate} aria-label="SlotPilot dashboard">
          <Logo collapsed={collapsed} inverse />
        </NavLink>
      </div>

      <nav aria-label="Main" className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((i) => can(i.permission))
          if (!items.length) return null
          return (
            <div key={group.label} className="mb-5 last:mb-0">
              {collapsed ? <div className="mx-auto mb-2 h-px w-6 bg-nav-line" aria-hidden /> : (
                <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-[0.06em] text-nav-ink-2 uppercase">{group.label}</p>
              )}
              <ul className="space-y-0.5">
                {items.map((item) => <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} badge={badges[item.badgeKey]} />)}
              </ul>
            </div>
          )
        })}
      </nav>

      <div className="shrink-0 border-t border-nav-line p-3">
        {!mobile && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn('mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-nav-ink-2 transition-colors hover:bg-nav-2 hover:text-white', collapsed && 'justify-center px-0')}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" /> Collapse</>}
          </button>
        )}
        <div className={cn('flex items-center gap-3 rounded-lg', collapsed ? 'flex-col' : 'px-2 py-1.5')}>
          <NavLink to="/admin/profile" onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg" aria-label="Your profile">
            <Avatar name={admin?.name} size="sm" className="ring-2 ring-nav-line" />
            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-white">{admin?.name}</span>
                <span className="block truncate text-[11px] text-nav-ink-2">{roleLabel}</span>
              </span>
            )}
          </NavLink>
          <Tooltip content="Log out" side={collapsed ? 'right' : 'top'}>
            <button type="button" onClick={onLogout} className="rounded-lg p-2 text-nav-ink-2 transition-colors hover:bg-nav-2 hover:text-white" aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

function NavItem({ item, collapsed, onNavigate, badge }) {
  const Icon = item.icon
  const link = (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex h-9 items-center gap-3 rounded-lg text-[13.5px] font-medium transition-colors',
          collapsed ? 'justify-center px-0' : 'px-3',
          isActive ? 'bg-nav-2 text-white' : 'text-nav-ink hover:bg-nav-2/70 hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <motion.span layoutId="nav-active" className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-r-full bg-brand-400" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
          <Icon className={cn('h-[17px] w-[17px] shrink-0', isActive ? 'text-brand-300' : 'text-nav-ink-2 group-hover:text-nav-ink')} aria-hidden />
          {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
          {badge > 0 && (collapsed
            ? <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-danger-dot ring-2 ring-nav" aria-label={`${badge} need attention`} />
            : <span className="rounded-full bg-white/10 px-1.5 py-px text-[11px] font-semibold text-white tabular">{badge}</span>)}
        </>
      )}
    </NavLink>
  )
  return <li>{collapsed ? <Tooltip content={item.label} side="right" delay={80}>{link}</Tooltip> : link}</li>
}

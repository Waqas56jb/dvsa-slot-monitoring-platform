import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Avatar, MonitoringPulse, Tooltip } from '@/components/ui';
import { dashboardNav } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMonitoring } from '@/context/MonitoringContext';
import { fullName } from '@/utils/format';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

const statusCopy = {
  active: { label: 'Monitoring active', tone: 'success' },
  paused: { label: 'Monitoring paused', tone: 'warning' },
  stopped: { label: 'Monitoring stopped', tone: 'neutral' },
};

function NavItem({ item, collapsed, count, onNavigate }) {
  const Icon = item.icon;
  const link = (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex min-h-11 items-center gap-3 rounded-xl text-sm font-medium transition-colors',
          collapsed ? 'justify-center px-0' : 'px-3',
          isActive ? 'text-ink' : 'text-muted hover:bg-surface-muted hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-active"
              className="absolute inset-0 rounded-xl bg-surface shadow-soft ring-1 ring-line"
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          )}
          <Icon className={cn('relative size-[18px] shrink-0', isActive && 'text-brand')} aria-hidden="true" />
          {!collapsed && <span className="relative flex-1">{item.label}</span>}
          {count > 0 &&
            (collapsed ? (
              <span className="absolute right-2 top-2 size-2 rounded-full bg-danger ring-2 ring-canvas" aria-label={`${count} new`} />
            ) : (
              <span className="relative rounded-full bg-brand px-1.5 text-[11px] font-semibold leading-5 text-white tabular-nums" aria-label={`${count} new`}>
                {count}
              </span>
            ))}
        </>
      )}
    </NavLink>
  );
  return collapsed ? (
    <Tooltip content={item.label} side="right" className="w-full">
      {link}
    </Tooltip>
  ) : (
    link
  );
}

/**
 * Dashboard sidebar. `collapsed` renders an icon rail (tablet);
 * `onNavigate` closes the mobile drawer after navigation.
 */
export function Sidebar({ collapsed = false, onToggleCollapse, onNavigate, counts = {}, onLogout, className }) {
  const { user } = useAuth();
  const { status } = useMonitoring();
  const s = statusCopy[status] || statusCopy.stopped;
  const name = fullName(user) || 'Your account';

  return (
    <div className={cn('flex h-full flex-col gap-4 bg-canvas py-5', collapsed ? 'px-2.5' : 'px-4', className)}>
      <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between px-1')}>
        <Logo to={paths.dashboard} compact={collapsed} />
        {onToggleCollapse && !collapsed && (
          <button type="button" onClick={onToggleCollapse} className="hidden size-8 items-center justify-center rounded-lg text-subtle hover:bg-surface-muted hover:text-ink md:flex xl:hidden" aria-label="Collapse sidebar">
            <ChevronsLeft className="size-4" />
          </button>
        )}
      </div>

      <Link
        to={paths.monitoring}
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-2.5 rounded-xl border border-line bg-surface text-sm shadow-soft transition-colors hover:border-line-strong',
          collapsed ? 'justify-center p-3' : 'px-3 py-2.5',
        )}
        aria-label={s.label}
      >
        <MonitoringPulse active={status === 'active'} tone={s.tone} />
        {!collapsed && <span className="font-medium text-ink-soft">{s.label}</span>}
      </Link>

      <nav aria-label="Dashboard" className="scrollbar-thin -mx-1 flex-1 overflow-y-auto px-1">
        <ul className="flex flex-col gap-0.5">
          {dashboardNav.map((item) => (
            <li key={item.to}>
              <NavItem item={item} collapsed={collapsed} count={item.badgeKey ? counts[item.badgeKey] : 0} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </nav>

      {onToggleCollapse && collapsed && (
        <button type="button" onClick={onToggleCollapse} className="mx-auto hidden size-10 items-center justify-center rounded-xl text-subtle hover:bg-surface-muted hover:text-ink md:flex" aria-label="Expand sidebar">
          <ChevronsRight className="size-4" />
        </button>
      )}

      <div className={cn('flex items-center gap-3 rounded-2xl border border-line bg-surface shadow-soft', collapsed ? 'flex-col p-2' : 'p-2.5')}>
        <Link to={paths.profile} onClick={onNavigate} className={cn('flex min-w-0 flex-1 items-center gap-3 rounded-xl', collapsed && 'justify-center')} aria-label="Your profile">
          <Avatar name={name} src={user?.avatarUrl} size="sm" status="online" />
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-ink">{name}</span>
              <span className="block truncate text-xs text-muted">{user?.email}</span>
            </span>
          )}
        </Link>
        <Tooltip content="Log out" side={collapsed ? 'right' : 'top'}>
          <button type="button" onClick={onLogout} className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger-ink" aria-label="Log out">
            <LogOut className="size-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

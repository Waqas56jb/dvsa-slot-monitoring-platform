import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Menu, Search, UserRound, Settings, LifeBuoy, LogOut, BellRing, Radar, Users, CheckCheck } from 'lucide-react';
import { Avatar, Dropdown, IconButton, SearchBar } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useClickOutside, useResource } from '@/hooks';
import { notificationService } from '@/services';
import { fullName, formatRelative } from '@/utils/format';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

const typeIcon = { slot: BellRing, system: Radar, learner: Users };

function NotificationBell({ unread }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);
  const { data: latest } = useResource(() => notificationService.latest(5), [], { topics: ['notifications'], initialData: [] });

  const openItem = async (n) => {
    setOpen(false);
    if (!n.read) await notificationService.markRead(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <div ref={ref} className="relative">
      <IconButton
        icon={Bell}
        label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        badge={unread}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
      />
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Recent notifications"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,380px)] origin-top-right overflow-hidden rounded-3xl border border-line bg-surface shadow-float"
            onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="font-semibold text-ink">Notifications</p>
              {unread > 0 && (
                <button type="button" onClick={() => notificationService.markAllRead()} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand hover:bg-brand-soft">
                  <CheckCheck className="size-3.5" /> Mark all as read
                </button>
              )}
            </div>
            <ul className="max-h-96 overflow-y-auto p-1.5">
              {latest.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted">You're all caught up.</li>}
              {latest.map((n) => {
                const Icon = typeIcon[n.type] || Bell;
                return (
                  <li key={n.id}>
                    <button type="button" onClick={() => openItem(n)} className="flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-surface-muted">
                      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', n.type === 'slot' ? 'bg-success-soft text-success-ink' : 'bg-surface-muted text-ink-soft')}>
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-ink">{n.title}</span>
                          {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
                        </span>
                        <span className="line-clamp-2 text-[13px] text-muted">{n.message}</span>
                        <span className="text-xs text-subtle">{formatRelative(n.createdAt)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-line p-1.5">
              <Link to={paths.notifications} onClick={() => setOpen(false)} className="flex h-10 items-center justify-center rounded-xl text-sm font-semibold text-ink-soft hover:bg-surface-muted hover:text-ink">
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Topbar({ title, onOpenMenu, unread = 0, onLogout }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mobileSearch, setMobileSearch] = useState(false);
  const name = fullName(user);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `${paths.learners}?q=${encodeURIComponent(q)}` : paths.learners);
    setMobileSearch(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <IconButton icon={Menu} label="Open navigation" className="-ml-2 md:hidden" onClick={onOpenMenu} />
        <p className="min-w-0 flex-1 truncate font-display text-lg font-semibold text-ink md:flex-none">{title}</p>

        <form onSubmit={submitSearch} role="search" className="ml-auto hidden w-full max-w-sm md:block">
          <SearchBar id="global-search" size="sm" value={query} onChange={setQuery} placeholder="Search learners or centres…" label="Search learners" />
        </form>

        <div className="flex items-center gap-1 md:ml-2">
          <IconButton icon={Search} label="Search" className="md:hidden" onClick={() => setMobileSearch((v) => !v)} aria-expanded={mobileSearch} />
          <NotificationBell unread={unread} />
          <Dropdown
            width="w-64"
            header={
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{name}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
            }
            trigger={(props) => (
              <button type="button" {...props} className="ml-1 flex size-11 items-center justify-center rounded-full" aria-label="Account menu">
                <Avatar name={name} src={user?.avatarUrl} size="sm" />
              </button>
            )}
            items={[
              { label: 'Profile', icon: UserRound, to: paths.profile },
              { label: 'Settings', icon: Settings, to: paths.settings },
              { label: 'Help', icon: LifeBuoy, to: paths.help },
              { divider: true },
              { label: 'Log out', icon: LogOut, danger: true, onClick: onLogout },
            ]}
          />
        </div>
      </div>
      <AnimatePresence>
        {mobileSearch && (
          <motion.form
            onSubmit={submitSearch}
            role="search"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-4 md:hidden"
          >
            <div className="pb-3">
              <SearchBar id="global-search-mobile" value={query} onChange={setQuery} placeholder="Search learners or centres…" label="Search learners" autoFocus />
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </header>
  );
}

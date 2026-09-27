import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight, CalendarClock, CornerDownLeft, GraduationCap, LayoutDashboard, LogOut, MapPin, Plus, Radar, Search, Settings, ShieldPlus, Users,
} from 'lucide-react'
import { searchService } from '@/services/searchService'
import { useDebounce } from '@/hooks/useDebounce'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { PERMISSIONS as P } from '@/constants/permissions'
import { NAV_GROUPS } from '@/constants/navigation'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Kbd } from '@/components/common/Misc'
import { Spinner } from '@/components/common/Spinner'
import { cn } from '@/utils/cn'

const GROUPS = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'learners', label: 'Learners', icon: GraduationCap },
  { key: 'monitoring', label: 'Monitoring Jobs', icon: Radar },
  { key: 'slots', label: 'Slots', icon: CalendarClock },
  { key: 'centres', label: 'Centres', icon: MapPin },
]

/**
 * ⌘K / Ctrl+K palette: quick actions + grouped global search.
 * Results navigate to detail pages.
 */
export function CommandPalette({ open, onClose, onLogout }) {
  const [q, setQ] = useState('')
  const debounced = useDebounce(q, 180)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()
  const { can } = useAdminAuth()

  const actions = useMemo(() => [
    { id: 'go-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, run: () => navigate('/admin/dashboard') },
    { id: 'search-users', label: 'Search users', icon: Users, run: () => navigate('/admin/users'), perm: P.USERS_VIEW },
    { id: 'search-monitoring', label: 'Search monitoring jobs', icon: Radar, run: () => navigate('/admin/monitoring'), perm: P.MONITORING_VIEW },
    { id: 'search-slots', label: 'Search slots', icon: CalendarClock, run: () => navigate('/admin/slots'), perm: P.SLOTS_VIEW },
    { id: 'add-centre', label: 'Add test centre', icon: Plus, run: () => navigate('/admin/test-centres?new=1'), perm: P.CENTRES_MANAGE },
    { id: 'create-admin', label: 'Create admin', icon: ShieldPlus, run: () => navigate('/admin/admins?new=1'), perm: P.ADMINS_MANAGE },
    { id: 'settings', label: 'Open settings', icon: Settings, run: () => navigate('/admin/settings'), perm: P.SETTINGS_VIEW },
    ...NAV_GROUPS.flatMap((g) => g.items)
      .filter((i) => !['/admin/dashboard', '/admin/settings'].includes(i.to))
      .map((i) => ({ id: `nav-${i.to}`, label: `Go to ${i.label}`, icon: i.icon, run: () => navigate(i.to), perm: i.permission, nav: true })),
    { id: 'logout', label: 'Log out', icon: LogOut, run: onLogout },
  ].filter((a) => can(a.perm)), [navigate, can, onLogout])

  useEffect(() => {
    if (!open) return
    setQ(''); setResults(null); setActive(0)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  useEffect(() => {
    let cancelled = false
    if (debounced.trim().length < 2) { setResults(null); return }
    setLoading(true)
    searchService.globalSearch(debounced).then((r) => { if (!cancelled) { setResults(r); setActive(0) } }).finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [debounced])

  // Flatten into one keyboard-navigable list
  const items = useMemo(() => {
    const term = q.trim().toLowerCase()
    const matchedActions = (term ? actions.filter((a) => a.label.toLowerCase().includes(term)) : actions.filter((a) => !a.nav)).slice(0, term ? 5 : 8)
    const out = matchedActions.map((a) => ({ type: 'action', group: 'Actions', ...a }))
    if (results) {
      for (const g of GROUPS) for (const hit of results[g.key] || []) out.push({ type: 'hit', group: g.label, icon: g.icon, id: `${g.key}-${hit.id}`, label: hit.title, sub: hit.subtitle, meta: hit.meta, run: () => navigate(hit.href) })
    }
    return out
  }, [actions, results, q, navigate])

  const execute = (item) => { onClose(); item?.run?.() }

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(items.length - 1, i + 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)) }
    if (e.key === 'Enter') { e.preventDefault(); execute(items[active]) }
    if (e.key === 'Escape') { e.preventDefault(); onClose() }
  }

  useEffect(() => { listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' }) }, [active])

  let lastGroup = null
  const noResults = results && q.trim().length >= 2 && !loading && items.every((i) => i.type === 'action') && GROUPS.every((g) => !results[g.key]?.length)

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75] flex items-start justify-center p-3 pt-[10vh] sm:p-6 sm:pt-[12vh]">
          <motion.div className="absolute inset-0 bg-overlay backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.14 }}
            className="relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-pop"
            onKeyDown={onKey}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-4 w-4 shrink-0 text-ink-4" aria-hidden />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search users, learners, MON-1023, London…"
                className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-4 focus:outline-none"
                role="combobox"
                aria-expanded="true"
                aria-controls="cmdk-list"
                aria-activedescendant={items[active] ? `cmdk-${items[active].id}` : undefined}
              />
              {loading ? <Spinner /> : <Kbd>Esc</Kbd>}
            </div>
            <ul id="cmdk-list" ref={listRef} role="listbox" className="flex-1 overflow-y-auto p-2">
              {items.map((item, idx) => {
                const header = item.group !== lastGroup ? item.group : null
                lastGroup = item.group
                const Icon = item.icon || ArrowRight
                return (
                  <li key={item.id} role="presentation">
                    {header && <p className="px-2.5 pt-2.5 pb-1.5 text-[11px] font-semibold tracking-wide text-ink-4 uppercase">{header}</p>}
                    <button
                      id={`cmdk-${item.id}`}
                      type="button"
                      role="option"
                      aria-selected={idx === active}
                      data-index={idx}
                      onMouseMove={() => setActive(idx)}
                      onClick={() => execute(item)}
                      className={cn('flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left', idx === active ? 'bg-subtle' : '')}
                    >
                      <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line', idx === active ? 'bg-surface text-ink' : 'text-ink-3')}><Icon className="h-3.5 w-3.5" aria-hidden /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">{item.label}</span>
                        {item.sub && <span className="block truncate text-xs text-ink-3">{item.sub}</span>}
                      </span>
                      {item.meta && <StatusBadge status={item.meta} size="sm" />}
                      {idx === active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-ink-4" aria-hidden />}
                    </button>
                  </li>
                )
              })}
              {noResults && <li className="px-4 py-8 text-center text-sm text-ink-3">No records match “{q}”.</li>}
            </ul>
            <div className="hidden items-center gap-4 border-t border-line bg-subtle/60 px-4 py-2.5 text-[11px] text-ink-4 sm:flex">
              <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
              <span className="flex items-center gap-1"><Kbd>↵</Kbd> open</span>
              <span className="flex items-center gap-1"><Kbd>Esc</Kbd> close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

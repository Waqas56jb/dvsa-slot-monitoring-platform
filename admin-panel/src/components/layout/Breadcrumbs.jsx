import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { SEGMENT_LABELS } from '@/constants/navigation'

/** Derived from the URL: /admin/users/usr_01001 → Admin › Users › usr_01001 */
export function Breadcrumbs({ className }) {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean).slice(1) // drop "admin"
  const crumbs = parts.map((seg, i) => ({ label: SEGMENT_LABELS[seg] || decodeURIComponent(seg), to: `/admin/${parts.slice(0, i + 1).join('/')}` }))
  if (!crumbs.length) return null
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex min-w-0 items-center gap-1 text-[13px] text-ink-3">
        <li className="shrink-0"><Link to="/admin/dashboard" className="hover:text-ink">Admin</Link></li>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1
          return (
            <li key={c.to} className="flex min-w-0 items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-4" aria-hidden />
              {last ? <span aria-current="page" className="truncate font-medium text-ink">{c.label}</span> : <Link to={c.to} className="truncate hover:text-ink">{c.label}</Link>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

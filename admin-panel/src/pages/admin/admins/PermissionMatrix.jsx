import { Fragment, useState } from 'react'
import { Check, Minus } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { SegmentedControl } from '@/components/common/Tabs'
import { ROLE_LABELS, roleHas } from '@/constants/permissions'
import { cn } from '@/utils/cn'
import { MATRIX_GROUPS, ALL_MATRIX_PERMS, ROLE_ORDER, RoleBadge, grantedCount } from './adminShared'

// Column order for the single-role matrix: the union of every action label.
const ACTIONS = ['View', 'Edit', 'Manage', 'Pause', 'Stop', 'Suspend', 'Reply', 'Refund', 'Reveal ref.', 'Export', 'Delete']
const COLUMNS = [...ACTIONS, ...new Set(MATRIX_GROUPS.flatMap((g) => g.perms.map(([a]) => a)).filter((a) => !ACTIONS.includes(a)))]
  .filter((a) => MATRIX_GROUPS.some((g) => g.perms.some(([x]) => x === a)))

function Cell({ granted, label }) {
  return granted ? (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-soft text-success" title={`${label}: granted`}>
      <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
      <span className="sr-only">Granted</span>
    </span>
  ) : (
    <span className="inline-flex h-5 w-5 items-center justify-center text-ink-4" title={`${label}: not granted`}>
      <Minus className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only">Not granted</span>
    </span>
  )
}

/** Permission matrix for one role, with a compare-all-roles mode. */
export function PermissionMatrix({ role }) {
  const [mode, setMode] = useState('role')
  const count = grantedCount(role)
  return (
    <Card
      title="Permissions"
      description={mode === 'role'
        ? <>Granted by the <span className="font-medium text-ink-2">{ROLE_LABELS[role]}</span> role · {count} of {ALL_MATRIX_PERMS.length} permissions. Enforced server-side.</>
        : 'Every role side by side. The highlighted column is this admin’s role.'}
      actions={<SegmentedControl label="Matrix view" value={mode} onChange={setMode} options={[{ value: 'role', label: 'This role' }, { value: 'compare', label: 'Compare roles' }]} />}
      padding="none"
    >
      {mode === 'role' ? <RoleMatrix role={role} /> : <CompareMatrix role={role} />}
    </Card>
  )
}

function RoleMatrix({ role }) {
  return (
    <>
      {/* md+: true matrix */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Permissions granted to the {ROLE_LABELS[role]} role</caption>
          <thead>
            <tr className="border-b border-line bg-subtle/70">
              <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-ink-3">Area</th>
              {COLUMNS.map((c) => <th key={c} scope="col" className="px-2 py-2.5 text-center text-xs font-medium whitespace-nowrap text-ink-3">{c}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {MATRIX_GROUPS.map((g) => {
              const byAction = Object.fromEntries(g.perms)
              return (
                <tr key={g.key} className="hover:bg-subtle/60">
                  <th scope="row" className="px-4 py-2.5 text-left font-medium whitespace-nowrap text-ink">{g.label}</th>
                  {COLUMNS.map((c) => (
                    <td key={c} className="px-2 py-2.5 text-center">
                      {byAction[c] ? <Cell granted={roleHas(role, byAction[c])} label={`${g.label} · ${c}`} /> : <span className="sr-only">Not applicable</span>}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* mobile: one row per area, actions as chips */}
      <ul className="divide-y divide-line md:hidden" aria-label={`Permissions granted to the ${ROLE_LABELS[role]} role`}>
        {MATRIX_GROUPS.map((g) => (
          <li key={g.key} className="px-4 py-3">
            <p className="text-sm font-medium text-ink">{g.label}</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {g.perms.map(([action, perm]) => {
                const ok = roleHas(role, perm)
                return (
                  <li key={perm} className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ring-1 ring-inset', ok ? 'bg-success-soft text-success ring-success/15' : 'bg-subtle text-ink-4 ring-line')}>
                    {ok ? <Check className="h-3 w-3" aria-hidden /> : <Minus className="h-3 w-3" aria-hidden />}
                    {action}
                    <span className="sr-only">{ok ? ' granted' : ' not granted'}</span>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
    </>
  )
}

function CompareMatrix({ role }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <caption className="sr-only">Permissions by role</caption>
        <thead>
          <tr className="border-b border-line bg-subtle/70">
            <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-ink-3">Permission</th>
            {ROLE_ORDER.map((r) => (
              <th key={r} scope="col" className={cn('px-2 py-2.5 text-center text-xs font-medium text-ink-3', r === role && 'bg-brand-50 text-brand-700 dark:text-brand-300')}>
                <span className="block leading-tight">{ROLE_LABELS[r]}</span>
                <span className="mt-0.5 block font-normal tabular text-ink-4">{grantedCount(r)}/{ALL_MATRIX_PERMS.length}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MATRIX_GROUPS.map((g) => (
            <Fragment key={g.key}>
              <tr className="border-t border-line bg-subtle/40">
                <th scope="colgroup" colSpan={ROLE_ORDER.length + 1} className="px-4 pt-3 pb-1.5 text-left text-[11px] font-semibold tracking-wide text-ink-3 uppercase">{g.label}</th>
              </tr>
              {g.perms.map(([action, perm]) => (
                <tr key={perm} className="hover:bg-subtle/60">
                  <th scope="row" className="py-2 pr-2 pl-6 text-left text-[13px] font-normal text-ink-2">{action}</th>
                  {ROLE_ORDER.map((r) => (
                    <td key={r} className={cn('px-2 py-2 text-center', r === role && 'bg-brand-50/60')}>
                      <Cell granted={roleHas(r, perm)} label={`${ROLE_LABELS[r]} · ${g.label} · ${action}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3 text-xs text-ink-3">
        This admin: <RoleBadge role={role} size="sm" />
      </div>
    </div>
  )
}

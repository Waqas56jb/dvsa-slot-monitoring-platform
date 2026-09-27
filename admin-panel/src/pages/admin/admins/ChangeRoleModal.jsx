import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Minus, Plus, UserCog } from 'lucide-react'
import { Modal } from '@/components/modals/Modal'
import { Button } from '@/components/common/Button'
import { RadioCards } from '@/components/forms/Fields'
import { adminService } from '@/services/adminService'
import { useToast } from '@/context/NotificationContext'
import { ROLES, ROLE_LABELS } from '@/constants/permissions'
import { ROLE_OPTIONS, RoleBadge, permLabel, roleDiff } from './adminShared'

/** Change an admin's role with a preview of permissions gained / lost. onChanged(admin). */
export function ChangeRoleModal({ open, admin, onClose, onChanged }) {
  const [role, setRole] = useState(admin?.role)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  useEffect(() => { if (open && admin) { setRole(admin.role); setError(null) } }, [open, admin])

  const diff = useMemo(() => (admin && role ? roleDiff(admin.role, role) : { gained: [], lost: [] }), [admin, role])
  const unchanged = !admin || role === admin.role

  const submit = async (e) => {
    e?.preventDefault()
    if (unchanged) return
    setSaving(true)
    setError(null)
    try {
      const updated = await adminService.changeRole(admin.id, role)
      toast.success(`${admin.name} is now ${/^[AEIOU]/.test(ROLE_LABELS[role]) ? 'an' : 'a'} ${ROLE_LABELS[role]}.`)
      onChanged?.(updated)
      onClose()
    } catch (err) {
      setError(err.message || 'Unable to change role. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      dismissible={!saving}
      title="Change role"
      description={admin ? `Choose what ${admin.name} can access. The change applies at their next request and is recorded in the audit log.` : undefined}
      icon={UserCog}
      tone="brand"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving} disabled={unchanged}>Change role</Button>
        </>
      }
    >
      {admin && (
        <form onSubmit={submit} className="space-y-5">
          <fieldset className="min-w-0">
            <legend className="mb-1.5 text-[13px] font-medium text-ink-2">New role</legend>
            <RadioCards name="change-role" value={role} onChange={setRole} options={ROLE_OPTIONS} />
          </fieldset>

          <section aria-live="polite" className="rounded-lg border border-line bg-subtle/60 p-4">
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <RoleBadge role={admin.role} />
              <ArrowRight className="h-3.5 w-3.5 text-ink-4" aria-label="to" />
              <RoleBadge role={role} />
            </div>
            {unchanged ? (
              <p className="mt-3 text-[13px] text-ink-3">Select a different role to preview the change.</p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <PermList title="Gains" items={diff.gained} tone="gain" />
                <PermList title="Loses" items={diff.lost} tone="lose" />
              </div>
            )}
            {!unchanged && role === ROLES.SUPER_ADMIN && (
              <p className="mt-4 rounded-md bg-warning-soft px-3 py-2 text-[13px] text-warning">Super Admins can manage other admins and platform settings. Only grant this to people who need it.</p>
            )}
          </section>

          {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">{error}</p>}
          <button type="submit" hidden />
        </form>
      )}
    </Modal>
  )
}

function PermList({ title, items, tone }) {
  const Icon = tone === 'gain' ? Plus : Minus
  return (
    <div className="min-w-0">
      <h3 className="text-xs font-semibold tracking-wide text-ink-3 uppercase">{title} <span className="font-normal tabular text-ink-4">({items.length})</span></h3>
      {items.length === 0 ? (
        <p className="mt-2 text-[13px] text-ink-4">No permissions {tone === 'gain' ? 'gained' : 'lost'}.</p>
      ) : (
        <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto pr-1">
          {items.map((p) => {
            const l = permLabel(p)
            return (
              <li key={p} className="flex items-center gap-2 text-[13px] text-ink-2">
                <span className={tone === 'gain' ? 'flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success-soft text-success' : 'flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger'}>
                  <Icon className="h-3 w-3" aria-hidden />
                </span>
                <span className="min-w-0 truncate"><span className="text-ink">{l.group}</span> · {l.action}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

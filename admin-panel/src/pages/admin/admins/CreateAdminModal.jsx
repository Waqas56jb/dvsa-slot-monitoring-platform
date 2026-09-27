import { useEffect, useState } from 'react'
import { ShieldPlus } from 'lucide-react'
import { Modal } from '@/components/modals/Modal'
import { Button } from '@/components/common/Button'
import { FormField, Input, RadioCards } from '@/components/forms/Fields'
import { adminService } from '@/services/adminService'
import { useToast } from '@/context/NotificationContext'
import { ROLES } from '@/constants/permissions'
import { ROLE_OPTIONS, grantedCount, ALL_MATRIX_PERMS } from './adminShared'

const EMPTY = { name: '', email: '', role: ROLES.SUPPORT_ADMIN, title: '' }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Invite a new internal admin. onCreated(admin) receives the new record. */
export function CreateAdminModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => { if (open) { setForm(EMPTY); setErrors({}) } }, [open])

  const set = (k) => (e) => { const v = e?.target ? e.target.value : e; setForm((f) => ({ ...f, [k]: v })); setErrors((x) => ({ ...x, [k]: null })) }

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 2) e.name = 'Enter the admin’s full name.'
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email address.'
    if (!form.role) e.role = 'Choose a role.'
    if (form.title.length > 60) e.title = 'Keep the job title under 60 characters.'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async (e) => {
    e?.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const created = await adminService.createAdmin({ name: form.name.trim(), email: form.email.trim().toLowerCase(), role: form.role, title: form.title.trim() })
      toast.success(`Invitation sent to ${created.email}.`)
      onCreated?.(created)
      onClose()
    } catch (err) {
      if (err.details) setErrors(err.details)
      else toast.error(err.message || 'Unable to create admin. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const options = ROLE_OPTIONS.map((o) => ({ ...o, description: `${o.description} ${grantedCount(o.value)} of ${ALL_MATRIX_PERMS.length} permissions.` }))

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      dismissible={!saving}
      title="Create admin"
      description="They’ll receive an email invitation to set a password and enable two-factor authentication."
      icon={ShieldPlus}
      tone="brand"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving}>Send invitation</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name" required error={errors.name}>
          {(p) => <Input {...p} value={form.name} onChange={set('name')} error={errors.name} data-autofocus autoComplete="off" />}
        </FormField>
        <FormField label="Job title" error={errors.title} hint="Optional — shown to other admins.">
          {(p) => <Input {...p} value={form.title} onChange={set('title')} error={errors.title} placeholder="e.g. Customer Support" autoComplete="off" />}
        </FormField>
        <FormField label="Work email" required error={errors.email} className="sm:col-span-2" hint="Use their company email address. This is their sign-in.">
          {(p) => <Input {...p} type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="name@slotpilot.io" autoComplete="off" />}
        </FormField>
        <fieldset className="min-w-0 sm:col-span-2">
          <legend className="mb-1.5 text-[13px] font-medium text-ink-2">Role<span className="ml-0.5 text-danger" aria-hidden>*</span></legend>
          <RadioCards name="create-admin-role" value={form.role} onChange={set('role')} options={options} />
          {errors.role
            ? <p className="mt-1.5 text-xs font-medium text-danger" role="alert">{errors.role}</p>
            : <p className="mt-1.5 text-xs text-ink-3">Grant the least access needed. You can change the role later.</p>}
        </fieldset>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

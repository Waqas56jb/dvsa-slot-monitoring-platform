import { useEffect, useState } from 'react'
import { UserPlus, UserPen } from 'lucide-react'
import { Modal } from '@/components/modals/Modal'
import { Button } from '@/components/common/Button'
import { FormField, Input, Select } from '@/components/forms/Fields'
import { userService } from '@/services/userService'
import { useToast } from '@/context/NotificationContext'

const EMPTY = { name: '', email: '', phone: '', city: 'London', status: 'Pending' }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[\d\s]{10,16}$/

/** Create (user = null) or edit a platform user. onSaved(user) receives the result. */
export function UserFormModal({ open, onClose, user, onSaved }) {
  const editing = !!user
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (open) { setForm(user ? { name: user.name, email: user.email, phone: user.phone || '', city: user.city || '', status: user.status } : EMPTY); setErrors({}) }
  }, [open, user])

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: null })) }

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 2) e.name = 'Enter the user’s full name.'
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email address.'
    if (form.phone && !PHONE_RE.test(form.phone.trim())) e.phone = 'Use a UK mobile number, e.g. +44 7700 900123.'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async (e) => {
    e?.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const payload = { ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() }
      const saved = editing ? await userService.updateUser(user.id, payload) : await userService.createUser(payload)
      toast.success(editing ? 'User updated.' : 'User created. An invitation email has been queued.')
      onSaved?.(saved)
      onClose()
    } catch (err) {
      if (err.details) setErrors(err.details)
      else toast.error(err.message || 'Unable to complete request.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={editing ? 'Edit user' : 'Add user'}
      description={editing ? 'Update account details. Changes are recorded in the audit log.' : 'Create an account on behalf of a customer. They’ll receive an email to set a password.'}
      icon={editing ? UserPen : UserPlus}
      tone="brand"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving}>{editing ? 'Save changes' : 'Create user'}</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name" required error={errors.name} className="sm:col-span-2">
          {(p) => <Input {...p} value={form.name} onChange={set('name')} error={errors.name} data-autofocus autoComplete="off" />}
        </FormField>
        <FormField label="Email" required error={errors.email} className="sm:col-span-2" hint="Used for sign-in and alert emails.">
          {(p) => <Input {...p} type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="off" />}
        </FormField>
        <FormField label="Mobile" error={errors.phone} hint="Optional — needed for SMS alerts.">
          {(p) => <Input {...p} type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="+44 7700 900123" />}
        </FormField>
        <FormField label="City">
          {(p) => <Input {...p} value={form.city} onChange={set('city')} />}
        </FormField>
        {!editing && (
          <FormField label="Initial status" className="sm:col-span-2" hint="Pending users must verify their email before monitoring can start.">
            {(p) => <Select {...p} value={form.status} onChange={set('status')} options={['Pending', 'Active']} />}
          </FormField>
        )}
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import { UserPen } from 'lucide-react'
import { Modal } from '@/components/modals/Modal'
import { Button } from '@/components/common/Button'
import { FormField, Input } from '@/components/forms/Fields'
import { authService } from '@/services/authService'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useToast } from '@/context/NotificationContext'

const PHONE_RE = /^\+?[\d\s]{10,16}$/

export function EditProfileModal({ open, onClose }) {
  const { admin, updateAdmin } = useAdminAuth()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', phone: '', title: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && admin) { setForm({ name: admin.name || '', phone: admin.phone || '', title: admin.title || '' }); setErrors({}) }
  }, [open, admin])

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: null })) }

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 2) e.name = 'Enter your full name.'
    if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) e.phone = 'Use a UK number, e.g. +44 7700 900123.'
    if (form.title.trim().length > 60) e.title = 'Keep your job title under 60 characters.'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async (e) => {
    e?.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const updated = await authService.updateProfile(admin.id, { name: form.name.trim(), phone: form.phone.trim(), title: form.title.trim() })
      updateAdmin({ name: updated.name, phone: updated.phone, title: updated.title })
      toast.success('Profile updated.')
      onClose()
    } catch (err) {
      if (err.details) setErrors(err.details)
      else toast.error(err.message || 'Unable to update your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      dismissible={!saving}
      title="Edit profile"
      description="Your name and job title are visible to other admins and in the audit log."
      icon={UserPen}
      tone="brand"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving}>Save changes</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name" required error={errors.name} className="sm:col-span-2">
          {(p) => <Input {...p} value={form.name} onChange={set('name')} autoComplete="name" data-autofocus />}
        </FormField>
        <FormField label="Email" className="sm:col-span-2" hint="Your sign-in email. Ask a Super Admin to change it.">
          {(p) => <Input {...p} value={admin?.email || ''} readOnly disabled />}
        </FormField>
        <FormField label="Job title" error={errors.title}>
          {(p) => <Input {...p} value={form.title} onChange={set('title')} autoComplete="organization-title" />}
        </FormField>
        <FormField label="Phone" error={errors.phone} hint="Optional.">
          {(p) => <Input {...p} type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="+44 7700 900123" />}
        </FormField>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

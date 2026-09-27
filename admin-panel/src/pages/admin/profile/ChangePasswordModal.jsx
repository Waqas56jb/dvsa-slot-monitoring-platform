import { useEffect, useMemo, useState } from 'react'
import { Check, KeyRound, X } from 'lucide-react'
import { Modal } from '@/components/modals/Modal'
import { Button } from '@/components/common/Button'
import { FormField, PasswordInput } from '@/components/forms/Fields'
import { authService } from '@/services/authService'
import { useToast } from '@/context/NotificationContext'
import { cn } from '@/utils/cn'

// Same rules as the reset-password page.
const RULES = [
  { key: 'len', label: 'At least 12 characters', test: (p) => p.length >= 12 },
  { key: 'case', label: 'Upper and lower case letters', test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { key: 'num', label: 'At least one number', test: (p) => /\d/.test(p) },
  { key: 'sym', label: 'At least one symbol', test: (p) => /[^A-Za-z0-9]/.test(p) },
]
const STRENGTH = [
  { label: 'Too weak', tone: 'bg-danger-dot', text: 'text-danger' },
  { label: 'Weak', tone: 'bg-danger-dot', text: 'text-danger' },
  { label: 'Fair', tone: 'bg-warning-dot', text: 'text-warning' },
  { label: 'Good', tone: 'bg-warning-dot', text: 'text-warning' },
  { label: 'Strong', tone: 'bg-success-dot', text: 'text-success' },
]
const EMPTY = { current: '', next: '', confirm: '' }

export function ChangePasswordModal({ open, onClose }) {
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (open) { setForm(EMPTY); setErrors({}) } }, [open])

  const checks = useMemo(() => RULES.map((r) => ({ ...r, ok: r.test(form.next) })), [form.next])
  const score = checks.filter((c) => c.ok).length
  const strength = STRENGTH[score]

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: null, form: null })) }

  const submit = async (e) => {
    e?.preventDefault()
    const errs = {}
    if (!form.current) errs.current = 'Enter your current password.'
    if (score < RULES.length) errs.next = 'Password doesn’t meet the requirements below.'
    else if (form.next === form.current) errs.next = 'Choose a password you haven’t used before.'
    if (form.confirm !== form.next) errs.confirm = 'Passwords don’t match.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      await authService.changePassword({ current: form.current, next: form.next })
      toast.success('Password changed.')
      onClose()
    } catch (err) {
      if (err.code === 'INVALID_PASSWORD') setErrors({ current: err.message })
      else if (err.code === 'PASSWORD_REUSED') setErrors({ next: err.message })
      else setErrors({ form: err.message || 'Unable to change your password. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      dismissible={!saving}
      title="Change password"
      description="Choose a strong password you don’t use anywhere else."
      icon={KeyRound}
      tone="brand"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving}>Update password</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {errors.form && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">{errors.form}</p>}
        <FormField label="Current password" required error={errors.current}>
          {(p) => <PasswordInput {...p} autoComplete="current-password" value={form.current} onChange={set('current')} data-autofocus />}
        </FormField>
        <FormField label="New password" required error={errors.next}>
          {(p) => <PasswordInput {...p} autoComplete="new-password" value={form.next} onChange={set('next')} />}
        </FormField>
        <div>
          <div className="flex items-center gap-3">
            <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden>
              {RULES.map((r, i) => <span key={r.key} className={cn('h-1 rounded-full transition-colors', form.next && i < score ? strength.tone : 'bg-muted')} />)}
            </div>
            <span className={cn('w-16 text-right text-xs font-medium', form.next ? strength.text : 'text-ink-4')} aria-live="polite">
              {form.next ? strength.label : ''}
              <span className="sr-only">{form.next ? ` password strength, ${score} of ${RULES.length} requirements met` : ''}</span>
            </span>
          </div>
          <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2" aria-label="Password requirements">
            {checks.map((c) => (
              <li key={c.key} className={cn('flex items-center gap-1.5 text-xs', c.ok ? 'text-success' : 'text-ink-3')}>
                {c.ok ? <Check className="h-3.5 w-3.5" aria-hidden /> : <X className="h-3.5 w-3.5 text-ink-4" aria-hidden />}
                {c.label}
                <span className="sr-only">{c.ok ? '(met)' : '(not met)'}</span>
              </li>
            ))}
          </ul>
        </div>
        <FormField label="Confirm new password" required error={errors.confirm}>
          {(p) => <PasswordInput {...p} autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />}
        </FormField>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

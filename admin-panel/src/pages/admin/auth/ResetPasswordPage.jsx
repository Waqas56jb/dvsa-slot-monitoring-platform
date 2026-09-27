import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, CircleCheckBig, X } from 'lucide-react'
import { AuthShell } from './AuthShell'
import { Button } from '@/components/common/Button'
import { FormField, PasswordInput } from '@/components/forms/Fields'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { cn } from '@/utils/cn'

const RULES = [
  { key: 'len', label: 'At least 12 characters', test: (p) => p.length >= 12 },
  { key: 'case', label: 'Upper and lower case letters', test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { key: 'num', label: 'At least one number', test: (p) => /\d/.test(p) },
  { key: 'sym', label: 'At least one symbol', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const { resetPassword } = useAdminAuth()
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [formError, setFormError] = useState(null)
  const checks = useMemo(() => RULES.map((r) => ({ ...r, ok: r.test(pw) })), [pw])
  const strong = checks.every((c) => c.ok)

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!strong) errs.pw = 'Password doesn’t meet the requirements below.'
    if (confirm !== pw) errs.confirm = 'Passwords don’t match.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setStatus('loading')
    try { await resetPassword({ token, password: pw }); setStatus('done') } catch (err) { setFormError(err.message); setStatus('idle') }
  }

  if (!token) {
    return (
      <AuthShell title="Invalid link">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">This link isn’t valid</h1>
        <p className="mt-2 text-sm text-ink-3">The reset link is missing or incomplete. Request a new one to continue.</p>
        <Button variant="primary" className="mt-6" to="/admin/forgot-password">Request new link</Button>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Set a new password">
      {status === 'done' ? (
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-soft text-success"><CircleCheckBig className="h-6 w-6" /></span>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-ink">Password updated</h1>
          <p className="mt-2 text-sm text-ink-3">Your password has been changed and other sessions have been signed out.</p>
          <Button variant="primary" className="mt-7" to="/admin/login">Continue to sign in</Button>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Set a new password</h1>
          <p className="mt-2 text-sm text-ink-3">Choose a strong password you don’t use anywhere else.</p>
          {formError && <p className="mt-5 rounded-lg bg-danger-soft px-3.5 py-3 text-sm text-danger" role="alert">{formError} <Link to="/admin/forgot-password" className="font-medium underline">Request a new link</Link></p>}
          <form onSubmit={submit} noValidate className="mt-7 space-y-5">
            <FormField label="New password" error={errors.pw} required>
              {(p) => <PasswordInput {...p} autoComplete="new-password" value={pw} onChange={(e) => { setPw(e.target.value); setErrors({}) }} error={errors.pw} autoFocus />}
            </FormField>
            <ul className="grid gap-1.5 sm:grid-cols-2" aria-label="Password requirements">
              {checks.map((c) => (
                <li key={c.key} className={cn('flex items-center gap-1.5 text-xs', c.ok ? 'text-success' : 'text-ink-3')}>
                  {c.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-ink-4" />} {c.label}
                </li>
              ))}
            </ul>
            <FormField label="Confirm password" error={errors.confirm} required>
              {(p) => <PasswordInput {...p} autoComplete="new-password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setErrors({}) }} error={errors.confirm} />}
            </FormField>
            <Button type="submit" variant="primary" size="lg" className="w-full" loading={status === 'loading'}>Update password</Button>
          </form>
        </>
      )}
    </AuthShell>
  )
}

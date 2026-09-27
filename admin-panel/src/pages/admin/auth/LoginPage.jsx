import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, CheckCircle2, Mail, WifiOff } from 'lucide-react'
import { AuthShell } from './AuthShell'
import { Button } from '@/components/common/Button'
import { Checkbox, FormField, Input, PasswordInput } from '@/components/forms/Fields'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { USE_MOCKS } from '@/constants/config'
import { admins, MOCK_ADMIN_PASSWORD } from '@/data/admins'
import { ROLE_LABELS } from '@/constants/permissions'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const { login } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | loading | success
  const [formError, setFormError] = useState(null) // { kind: 'credentials'|'network'|'other', message }
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    try {
      const reason = sessionStorage.getItem('slotpilot.logoutReason')
      if (reason) { setNotice(reason); sessionStorage.removeItem('slotpilot.logoutReason') }
    } catch { /* ignore */ }
  }, [])

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: null })); setFormError(null) }

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Enter your work email.'
    else if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email address.'
    if (!form.password) e.password = 'Enter your password.'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('loading')
    setFormError(null)
    try {
      await login({ email: form.email.trim(), password: form.password, remember: form.remember })
      setStatus('success')
      setTimeout(() => navigate(location.state?.from || '/admin/dashboard', { replace: true }), 450)
    } catch (err) {
      setStatus('idle')
      setFormError({ kind: err.code === 'INVALID_CREDENTIALS' ? 'credentials' : err.code === 'NETWORK' || err.code === 'TIMEOUT' ? 'network' : 'other', message: err.message })
    }
  }

  const fillDemo = (email) => { setForm((f) => ({ ...f, email, password: MOCK_ADMIN_PASSWORD })); setErrors({}); setFormError(null) }

  return (
    <AuthShell title="Sign in">
      <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Sign in to SlotPilot Admin</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-3">Manage your driving test monitoring platform from one secure workspace.</p>

      {notice && (
        <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-line bg-subtle px-3.5 py-3 text-sm text-ink-2" role="status">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" /> {notice}
        </div>
      )}

      {formError && (
        <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger-soft px-3.5 py-3 text-sm text-danger" role="alert">
          {formError.kind === 'network' ? <WifiOff className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <div>
            <p className="font-medium">{formError.kind === 'credentials' ? 'Incorrect email or password' : formError.kind === 'network' ? 'Can’t reach the server' : 'Sign-in failed'}</p>
            <p className="mt-0.5 text-danger/80">{formError.kind === 'credentials' ? 'Check your details and try again. Accounts lock after 5 failed attempts.' : formError.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={submit} noValidate className="mt-7 space-y-5">
        <FormField label="Work email" error={errors.email} required>
          {(p) => <Input {...p} type="email" autoComplete="username" icon={Mail} placeholder="you@slotpilot.io" value={form.email} onChange={set('email')} error={errors.email} autoFocus />}
        </FormField>
        <FormField label="Password" error={errors.password} required labelAction={<Link to="/admin/forgot-password" className="text-[13px] font-medium text-brand-600 hover:underline dark:text-brand-300">Forgot password?</Link>}>
          {(p) => <PasswordInput {...p} autoComplete="current-password" placeholder="••••••••••••" value={form.password} onChange={set('password')} error={errors.password} />}
        </FormField>
        <Checkbox checked={form.remember} onChange={(v) => setForm((f) => ({ ...f, remember: v }))} label="Keep me signed in on this device" />
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={status === 'loading'} disabled={status === 'success'} icon={status === 'success' ? CheckCircle2 : undefined} iconRight={status === 'idle' ? ArrowRight : undefined}>
          {status === 'success' ? 'Signed in — redirecting…' : status === 'loading' ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      {USE_MOCKS && (
        <div className="mt-8 rounded-xl border border-dashed border-line-strong p-4">
          <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Demo accounts · mock mode</p>
          <p className="mt-1 text-xs text-ink-3">Password for all: <code className="rounded bg-subtle px-1 py-0.5 font-mono text-ink-2">{MOCK_ADMIN_PASSWORD}</code></p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {admins.filter((a) => a.status === 'Active').slice(0, 4).map((a) => (
              <button key={a.id} type="button" onClick={() => fillDemo(a.email)} className="rounded-lg border border-line px-3 py-2 text-left transition-colors hover:border-brand-300 hover:bg-brand-50">
                <span className="block truncate text-[13px] font-medium text-ink">{ROLE_LABELS[a.role]}</span>
                <span className="block truncate text-[11px] text-ink-3">{a.email}</span>
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-[11px] text-ink-4">Tip: an email containing “offline” simulates a network error.</p>
        </div>
      )}
    </AuthShell>
  )
}

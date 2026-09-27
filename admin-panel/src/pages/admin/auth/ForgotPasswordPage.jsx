import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MailCheck, Mail } from 'lucide-react'
import { AuthShell } from './AuthShell'
import { Button } from '@/components/common/Button'
import { FormField, Input } from '@/components/forms/Fields'
import { useAdminAuth } from '@/context/AdminAuthContext'

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('idle')

  const submit = async (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address.'); return }
    setStatus('loading')
    try { await forgotPassword(email.trim()); setStatus('sent') } catch (err) { setError(err.message); setStatus('idle') }
  }

  return (
    <AuthShell title="Reset your password">
      {status === 'sent' ? (
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-soft text-success"><MailCheck className="h-6 w-6" /></span>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-ink">Check your inbox</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-3">
            If an admin account exists for <span className="font-medium text-ink">{email}</span>, we’ve sent a link to reset your password. The link expires in 30 minutes.
          </p>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <Button variant="primary" to="/admin/login">Back to sign in</Button>
            <Button variant="ghost" onClick={() => setStatus('idle')}>Use a different email</Button>
          </div>
          <p className="mt-6 text-xs text-ink-4">Demo: open <Link className="text-brand-600 hover:underline dark:text-brand-300" to="/admin/reset-password?token=demo">the reset page</Link> to continue.</p>
        </div>
      ) : (
        <>
          <Link to="/admin/login" className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 hover:text-ink"><ArrowLeft className="h-3.5 w-3.5" /> Back to sign in</Link>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Forgot your password?</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-3">Enter your work email and we’ll send you a secure link to set a new one.</p>
          <form onSubmit={submit} noValidate className="mt-7 space-y-5">
            <FormField label="Work email" error={error} required>
              {(p) => <Input {...p} type="email" icon={Mail} autoComplete="username" placeholder="you@slotpilot.io" value={email} onChange={(e) => { setEmail(e.target.value); setError(null) }} error={error} autoFocus />}
            </FormField>
            <Button type="submit" variant="primary" size="lg" className="w-full" loading={status === 'loading'}>Send reset link</Button>
          </form>
        </>
      )}
    </AuthShell>
  )
}

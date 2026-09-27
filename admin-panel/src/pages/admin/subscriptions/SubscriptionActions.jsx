import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CalendarPlus, Layers, XCircle } from 'lucide-react'
import { Modal } from '@/components/modals/Modal'
import { Button } from '@/components/common/Button'
import { FormField, RadioCards, Select, Textarea } from '@/components/forms/Fields'
import { subscriptionService } from '@/services/subscriptionService'
import { useToast } from '@/context/NotificationContext'
import { formatCurrency, formatDate } from '@/utils/format'

export { PLAN_TONE, isEnded } from './planMeta'


let plansCache = null
function usePlans(open) {
  const [plans, setPlans] = useState(plansCache)
  useEffect(() => {
    if (!open || plansCache) return
    subscriptionService.getPlans().then((p) => { plansCache = p; setPlans(p) }).catch(() => {})
  }, [open])
  return plans
}

const planSummary = (p) => `${p.monitoringLimit} monitoring ${p.monitoringLimit === 1 ? 'job' : 'jobs'} · ${p.learnerLimit} ${p.learnerLimit === 1 ? 'learner' : 'learners'} · ${p.channels.join(', ')} · checks every ${p.checkInterval}s`

function ErrorNote({ children }) {
  if (!children) return null
  return <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">{children}</p>
}

/* ------------------------------------------------------------------ */

export function ChangePlanModal({ open, subscription: sub, onClose, onSaved }) {
  const plans = usePlans(open)
  const toast = useToast()
  const [plan, setPlan] = useState(sub?.plan)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { if (open) { setPlan(sub?.plan); setError(null) } }, [open, sub])

  const target = plans?.find((p) => p.name === plan)
  const overMonitoring = target && sub && (sub.monitoringUsed ?? 0) > target.monitoringLimit
  const overLearners = target && sub && (sub.learnersUsed ?? 0) > target.learnerLimit

  const submit = async () => {
    if (!sub || plan === sub.plan) { setError('Choose a different plan to continue.'); return }
    setSaving(true)
    setError(null)
    try {
      const updated = await subscriptionService.changePlan(sub.id, plan)
      toast.success(`Plan changed to ${plan}.`)
      onSaved?.(updated)
      onClose()
    } catch (e) {
      setError(e?.message || 'Unable to change plan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      dismissible={!saving}
      title="Change plan"
      description={sub ? `${sub.user?.name ?? sub.userId} is on the ${sub.plan} plan. Changes take effect immediately and are recorded in the audit log.` : undefined}
      icon={Layers}
      tone="brand"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving} disabled={!plans || plan === sub?.plan}>Change plan</Button>
        </>
      }
    >
      <div className="space-y-4">
        {!plans ? (
          <div className="grid gap-2.5 sm:grid-cols-3" aria-hidden>{[0, 1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-lg" />)}</div>
        ) : (
          <RadioCards
            name="plan"
            columns={3}
            value={plan}
            onChange={(v) => { setPlan(v); setError(null) }}
            options={plans.map((p) => ({
              value: p.name,
              label: (
                <span className="flex flex-col">
                  <span className="flex flex-wrap items-center gap-1.5">{p.name}{p.name === sub?.plan && <span className="rounded bg-subtle px-1.5 text-[11px] font-medium text-ink-3">Current</span>}</span>
                  <span className="mt-1 text-lg font-semibold tracking-tight text-ink tabular">{formatCurrency(p.price)}<span className="text-xs font-normal text-ink-3"> / {p.interval}</span></span>
                </span>
              ),
              description: planSummary(p),
            }))}
          />
        )}
        {(overMonitoring || overLearners) && (
          <p className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-[13px] text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              Current usage exceeds the {plan} limits
              {overMonitoring && ` (${sub.monitoringUsed}/${target.monitoringLimit} monitoring jobs)`}
              {overLearners && ` (${sub.learnersUsed}/${target.learnerLimit} learners)`}. The user won’t be able to add more until usage is within the limit.
            </span>
          </p>
        )}
        <ErrorNote>{error}</ErrorNote>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */

const EXTEND_OPTIONS = [{ value: '7', label: '7 days' }, { value: '14', label: '14 days' }, { value: '30', label: '30 days' }]

export function ExtendModal({ open, subscription: sub, onClose, onSaved }) {
  const toast = useToast()
  const [days, setDays] = useState('7')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { if (open) { setDays('7'); setError(null) } }, [open])

  const base = sub?.renewalDate ? new Date(sub.renewalDate).getTime() : Date.now()
  const newDate = new Date(base + Number(days) * 864e5)

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      const updated = await subscriptionService.extendSubscription(sub.id, Number(days))
      toast.success(`Subscription extended by ${days} days.`)
      onSaved?.(updated)
      onClose()
    } catch (e) {
      setError(e?.message || 'Unable to extend subscription.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      dismissible={!saving}
      title="Extend subscription"
      description="Adds free days to the current billing period. The user is not charged for the extension."
      icon={CalendarPlus}
      tone="brand"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving}>Extend</Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Extend by" required>
          {(p) => <Select {...p} value={days} onChange={(e) => setDays(e.target.value)} options={EXTEND_OPTIONS} data-autofocus />}
        </FormField>
        <dl className="grid grid-cols-2 gap-3 rounded-lg border border-line bg-subtle px-3.5 py-3 text-[13px]">
          <div><dt className="text-xs text-ink-3">Current renewal</dt><dd className="mt-0.5 font-medium text-ink">{sub?.renewalDate ? formatDate(sub.renewalDate) : 'None'}</dd></div>
          <div><dt className="text-xs text-ink-3">New renewal</dt><dd className="mt-0.5 font-medium text-ink">{formatDate(newDate)}</dd></div>
        </dl>
        <ErrorNote>{error}</ErrorNote>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */

export function CancelSubscriptionModal({ open, subscription: sub, onClose, onSaved }) {
  const toast = useToast()
  const [when, setWhen] = useState('end')
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { if (open) { setWhen(sub?.renewalDate ? 'end' : 'immediate'); setReason(''); setTouched(false); setError(null) } }, [open, sub])

  const reasonError = touched && reason.trim().length < 3 ? 'Enter a reason (minimum 3 characters).' : null

  const submit = async () => {
    setTouched(true)
    if (reason.trim().length < 3) return
    setSaving(true)
    setError(null)
    try {
      const updated = await subscriptionService.cancelSubscription(sub.id, { immediate: when === 'immediate', reason: reason.trim() })
      toast.success(when === 'immediate' ? 'Subscription cancelled.' : `Subscription will cancel on ${formatDate(sub.renewalDate)}.`)
      onSaved?.(updated)
      onClose()
    } catch (e) {
      setError(e?.message || 'Unable to cancel subscription.')
    } finally {
      setSaving(false)
    }
  }

  const options = [
    sub?.renewalDate && { value: 'end', label: 'At end of billing period', description: `Access continues until ${formatDate(sub.renewalDate)}. No further renewals.` },
    { value: 'immediate', label: 'Immediately', description: 'Access and monitoring end now. No refund is issued automatically.' },
  ].filter(Boolean)

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      dismissible={!saving}
      title="Cancel subscription?"
      description={sub ? `${sub.user?.name ?? sub.userId} · ${sub.plan} plan (${formatCurrency(sub.price)}/month).` : undefined}
      icon={XCircle}
      tone="danger"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Keep subscription</Button>
          <Button variant="danger" onClick={submit} loading={saving}>Cancel subscription</Button>
        </>
      }
    >
      <div className="space-y-4">
        <RadioCards name="cancel-when" value={when} onChange={setWhen} options={options} columns={options.length > 1 ? 2 : 1} />
        <FormField label="Reason" required error={reasonError} hint="Visible to other admins in the audit log.">
          {(p) => <Textarea {...p} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} onBlur={() => setTouched(true)} error={reasonError} placeholder="e.g. Customer requested cancellation by email" data-autofocus />}
        </FormField>
        <ErrorNote>{error}</ErrorNote>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */

/**
 * Shared state for the three subscription actions.
 * const actions = useSubscriptionActions(onUpdated); actions.open('plan', sub); render {actions.modals}
 */
export function useSubscriptionActions(onUpdated) {
  const [state, setState] = useState({ kind: null, sub: null })
  const open = useCallback((kind, sub) => setState({ kind, sub }), [])
  const close = useCallback(() => setState((s) => ({ ...s, kind: null })), [])
  const props = (kind) => ({ open: state.kind === kind, subscription: state.sub, onClose: close, onSaved: onUpdated })
  const modals = (
    <>
      <ChangePlanModal {...props('plan')} />
      <ExtendModal {...props('extend')} />
      <CancelSubscriptionModal {...props('cancel')} />
    </>
  )
  return { open, modals }
}

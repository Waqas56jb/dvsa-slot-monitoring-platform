import { useCallback, useRef, useState } from 'react'
import { AlertTriangle, ShieldAlert, Info } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from '@/components/common/Button'
import { FormField, Input, Textarea } from '@/components/forms/Fields'
import { useToast } from '@/context/NotificationContext'

/**
 * Confirmation dialog for dangerous / consequential actions.
 *
 * Props: open, onClose, onConfirm(reason) → Promise, title, description, confirmLabel,
 * tone ('danger'|'warning'|'brand'), requireReason, reasonLabel, reasonPlaceholder,
 * typeToConfirm (string the admin must type), children (extra body content).
 */
export function ConfirmModal({
  open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'danger',
  requireReason = false, reasonLabel = 'Reason', reasonPlaceholder = 'Visible to other admins in the audit log', typeToConfirm, children, successMessage,
}) {
  const [busy, setBusy] = useState(false)
  const [reason, setReason] = useState('')
  const [typed, setTyped] = useState('')
  const [error, setError] = useState(null)
  const toast = useToast()

  const reset = () => { setReason(''); setTyped(''); setError(null); setBusy(false) }
  const handleClose = () => { if (busy) return; reset(); onClose() }

  const blocked = (requireReason && reason.trim().length < 3) || (typeToConfirm && typed.trim() !== typeToConfirm)

  const submit = async (e) => {
    e?.preventDefault()
    if (blocked) return
    setBusy(true)
    setError(null)
    try {
      await onConfirm?.(reason.trim())
      if (successMessage) toast.success(successMessage)
      reset()
      onClose()
    } catch (err) {
      setError(err?.message || 'Unable to complete request.')
      setBusy(false)
    }
  }

  const Icon = tone === 'danger' ? ShieldAlert : tone === 'warning' ? AlertTriangle : Info
  return (
    <Modal
      open={open}
      onClose={handleClose}
      dismissible={!busy}
      title={title}
      description={description}
      icon={Icon}
      tone={tone}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={busy}>{cancelLabel}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={submit} loading={busy} disabled={blocked}>{confirmLabel}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {children}
        {requireReason && (
          <FormField label={reasonLabel} required hint="Minimum 3 characters.">
            {(p) => <Textarea {...p} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={reasonPlaceholder} data-autofocus />}
          </FormField>
        )}
        {typeToConfirm && (
          <FormField label={<>Type <span className="font-mono font-semibold text-ink">{typeToConfirm}</span> to confirm</>} required>
            {(p) => <Input {...p} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} />}
          </FormField>
        )}
        {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">{error}</p>}
        {!children && !requireReason && !typeToConfirm && <span className="sr-only">Confirm to continue.</span>}
      </form>
    </Modal>
  )
}

/**
 * Imperative helper so pages don't need one state variable per dialog.
 *
 * const { confirm, confirmElement } = useConfirm()
 * confirm({ title, description, confirmLabel, tone, requireReason, onConfirm: async (reason) => … })
 * …render {confirmElement} once.
 */
export function useConfirm() {
  const [opts, setOpts] = useState(null)
  const resolver = useRef(null)

  const confirm = useCallback((o) => new Promise((resolve) => { resolver.current = resolve; setOpts(o) }), [])

  const confirmElement = (
    <ConfirmModal
      {...(opts || {})}
      open={!!opts}
      onClose={() => { resolver.current?.(false); setOpts(null) }}
      onConfirm={async (reason) => { await opts?.onConfirm?.(reason); resolver.current?.(true); resolver.current = null }}
    />
  )
  return { confirm, confirmElement }
}

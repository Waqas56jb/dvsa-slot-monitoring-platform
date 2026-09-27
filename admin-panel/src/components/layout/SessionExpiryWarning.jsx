import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { Modal } from '@/components/modals/Modal'
import { Button } from '@/components/common/Button'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { SESSION_WARNING_SECONDS } from '@/constants/config'

/** Warns before the session expires and signs out when it does. Activity does not auto-extend (explicit is safer for admin tools). */
export function SessionExpiryWarning() {
  const { expiresAt, extendSession, logout } = useAdminAuth()
  const [remaining, setRemaining] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      const s = Math.round((expiresAt - Date.now()) / 1000)
      setRemaining(s)
      if (s <= 0) logout({ silent: true, reason: 'You were signed out after a period of inactivity.' })
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [expiresAt, logout])

  const open = remaining != null && remaining > 0 && remaining <= SESSION_WARNING_SECONDS
  const stay = async () => { setBusy(true); try { await extendSession() } finally { setBusy(false) } }

  return (
    <Modal
      open={open}
      onClose={stay}
      title="Your session is about to expire"
      description={`For security, you'll be signed out in ${remaining ?? 0} seconds.`}
      icon={Clock}
      tone="warning"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => logout()}>Log out now</Button>
          <Button variant="primary" onClick={stay} loading={busy} data-autofocus>Stay signed in</Button>
        </>
      }
    >
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-warning-dot transition-[width] duration-1000 ease-linear" style={{ width: `${((remaining ?? 0) / SESSION_WARNING_SECONDS) * 100}%` }} />
      </div>
    </Modal>
  )
}

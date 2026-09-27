import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { notificationService } from '@/services/notificationService'
import { realtime } from '@/lib/realtime'
import { ToastViewport } from '@/components/notifications/ToastViewport'

/**
 * Two related concerns:
 *  - toasts: transient feedback for admin actions (useToast)
 *  - inbox:  the admin's own notifications shown in the header bell (useInbox)
 */
const ToastContext = createContext(null)
const InboxContext = createContext(null)

let toastSeq = 0

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
  }, [])

  const push = useCallback((type, message, opts = {}) => {
    const id = ++toastSeq
    const toast = { id, type, message, title: opts.title, action: opts.action }
    setToasts((t) => [...t.slice(-3), toast])
    const duration = opts.duration ?? (type === 'error' ? 6000 : 4000)
    timers.current.set(id, setTimeout(() => dismiss(id), duration))
    return id
  }, [dismiss])

  const toast = useMemo(() => ({
    success: (m, o) => push('success', m, o),
    error: (m, o) => push('error', m, o),
    warning: (m, o) => push('warning', m, o),
    info: (m, o) => push('info', m, o),
    dismiss,
  }), [push, dismiss])

  // ---------------- inbox ----------------
  const [items, setItems] = useState([])
  const [inboxLoading, setInboxLoading] = useState(true)

  useEffect(() => {
    notificationService.getAdminInbox().then(setItems).finally(() => setInboxLoading(false))
  }, [])

  useEffect(() => realtime.subscribe('inbox', (item) => setItems((list) => [item, ...list].slice(0, 30))), [])

  const markRead = useCallback(async (id) => {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, read: true } : i)))
    await notificationService.markInboxRead(id)
  }, [])
  const markAllRead = useCallback(async () => {
    setItems((list) => list.map((i) => ({ ...i, read: true })))
    await notificationService.markAllInboxRead()
  }, [])

  const inbox = useMemo(() => ({ items, loading: inboxLoading, unreadCount: items.filter((i) => !i.read).length, markRead, markAllRead }), [items, inboxLoading, markRead, markAllRead])

  return (
    <ToastContext.Provider value={toast}>
      <InboxContext.Provider value={inbox}>
        {children}
        <ToastViewport toasts={toasts} onDismiss={dismiss} />
      </InboxContext.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <NotificationProvider>')
  return ctx
}

export function useInbox() {
  const ctx = useContext(InboxContext)
  if (!ctx) throw new Error('useInbox must be used inside <NotificationProvider>')
  return ctx
}

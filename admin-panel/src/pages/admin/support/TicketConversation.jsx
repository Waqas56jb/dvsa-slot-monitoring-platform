import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Lock, Send, StickyNote } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/StatusBadge'
import { Kbd } from '@/components/common/Misc'
import { Textarea } from '@/components/forms/Fields'
import { useNow } from '@/hooks/useUtils'
import { cn } from '@/utils/cn'
import { formatDateTime, formatRelative, pluralize } from '@/utils/format'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
const MAX_LEN = 5000

/** Thread of user and admin messages, oldest first. */
export function ConversationThread({ messages, userName }) {
  const now = useNow(30000)
  const endRef = useRef(null)
  const count = messages.length
  const prevCount = useRef(count)
  // Only follow the thread when a message is added, never on first render.
  useEffect(() => {
    if (count > prevCount.current) endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    prevCount.current = count
  }, [count])
  return (
    <ol className="space-y-5" aria-label="Conversation">
      <AnimatePresence initial={false}>
        {messages.map((m) => {
          const admin = m.from === 'admin'
          return (
            <motion.li key={m.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex min-w-0 gap-3">
              <Avatar name={m.authorName} size="sm" className="mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-medium text-ink">{m.authorName || (admin ? 'Support' : userName)}</span>
                  {admin ? <Badge tone="brand" size="sm">Support team</Badge> : <span className="text-xs text-ink-4">Customer</span>}
                  <time dateTime={m.createdAt} title={formatDateTime(m.createdAt)} className="text-xs text-ink-4 tabular">
                    {m.pending ? 'Sending…' : formatRelative(m.createdAt, now)}
                  </time>
                </div>
                <div
                  className={cn(
                    'mt-1.5 rounded-xl rounded-tl-sm border px-3.5 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap text-ink',
                    admin ? 'border-brand-100 bg-brand-50/70' : 'border-line bg-subtle',
                    m.pending && 'opacity-60',
                  )}
                >
                  {m.body}
                </div>
              </div>
            </motion.li>
          )
        })}
      </AnimatePresence>
      <li ref={endRef} aria-hidden className="h-0" />
    </ol>
  )
}

/** Reply composer. ⌘/Ctrl + Enter sends. */
export function ReplyBox({ onSend, disabled, hint }) {
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const trimmed = body.trim()
  const submit = async () => {
    if (!trimmed || sending) return
    setSending(true)
    const ok = await onSend(trimmed, () => setBody(''))
    if (!ok) setBody((b) => b || trimmed)
    setSending(false)
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); submit() }} className="space-y-2.5">
      <label htmlFor="ticket-reply" className="sr-only">Reply to customer</label>
      <Textarea
        id="ticket-reply"
        rows={4}
        value={body}
        maxLength={MAX_LEN}
        disabled={disabled}
        placeholder="Write a reply to the customer…"
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit() } }}
        aria-describedby="ticket-reply-hint"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p id="ticket-reply-hint" className="flex items-center gap-1.5 text-xs text-ink-4">
          {hint || <><Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd><Kbd>Enter</Kbd> to send</>}
        </p>
        <Button type="submit" variant="primary" icon={Send} loading={sending} disabled={disabled || !trimmed}>Send reply</Button>
      </div>
    </form>
  )
}

/** Internal notes: visible to admins only, styled distinctly from the customer thread. */
export function InternalNotes({ notes, onAdd, canAdd }) {
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const add = async () => {
    const v = body.trim()
    if (!v) return
    setSaving(true)
    const ok = await onAdd(v)
    setSaving(false)
    if (ok) { setBody(''); setOpen(false) }
  }
  return (
    <Card
      title="Internal notes"
      description="Only visible to the admin team — never shown to the customer."
      icon={Lock}
      actions={canAdd && !open && <Button size="sm" icon={StickyNote} onClick={() => setOpen(true)}>Add note</Button>}
    >
      {open && (
        <div className="mb-4 space-y-2.5 rounded-lg border border-warning/25 bg-warning-soft p-3">
          <label htmlFor="ticket-note" className="sr-only">Internal note</label>
          <Textarea
            id="ticket-note"
            rows={3}
            value={body}
            autoFocus
            maxLength={MAX_LEN}
            placeholder="Add context for the team, e.g. what you checked…"
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); add() } }}
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setOpen(false); setBody('') }} disabled={saving}>Cancel</Button>
            <Button size="sm" variant="primary" onClick={add} loading={saving} disabled={!body.trim()}>Save note</Button>
          </div>
        </div>
      )}
      {notes.length === 0 ? (
        <p className="py-2 text-center text-[13px] text-ink-3">No internal notes yet.</p>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {notes.map((n) => (
              <motion.li key={n.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-warning/25 bg-warning-soft px-3.5 py-3">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="flex items-center gap-2 text-[13px] font-medium text-ink">
                    <Avatar name={n.author} size="xs" />
                    {n.author}
                  </span>
                  <time dateTime={n.createdAt} className="text-xs text-ink-3 tabular">{formatDateTime(n.createdAt)}</time>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed break-words whitespace-pre-wrap text-ink-2">{n.body}</p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
      {notes.length > 0 && <p className="mt-3 text-xs text-ink-4">{pluralize(notes.length, 'note')}</p>}
    </Card>
  )
}

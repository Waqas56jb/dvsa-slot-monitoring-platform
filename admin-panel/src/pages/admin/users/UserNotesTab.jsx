import { useState } from 'react'
import { Lock, StickyNote } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Avatar } from '@/components/common/Avatar'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/States'
import { FormField, Textarea } from '@/components/forms/Fields'
import { useToast } from '@/context/NotificationContext'
import { usePermission } from '@/context/AdminAuthContext'
import { userService } from '@/services/userService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { formatDateTime, formatRelative } from '@/utils/format'

const MAX = 1000

/** Internal (admin-only) notes on a user account. onAdded(note) lets the page update its state. */
export function UserNotesTab({ userId, notes = [], onAdded }) {
  const can = usePermission()
  const toast = useToast()
  const [body, setBody] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const canWrite = can(P.USERS_EDIT)

  const submit = async (e) => {
    e.preventDefault()
    const text = body.trim()
    if (text.length < 3) { setError('Write at least 3 characters.'); return }
    setSaving(true)
    try {
      const note = await userService.addNote(userId, text)
      onAdded?.(note)
      setBody('')
      setError(null)
      toast.success('Note added.')
    } catch (err) {
      toast.error(err?.message || 'Unable to add note. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Internal notes" description="Only visible to admins. Never shared with the user." icon={Lock} className="lg:col-span-2" padding="none">
        {notes.length ? (
          <ul className="divide-y divide-line">
            {notes.map((n) => (
              <li key={n.id} className="flex gap-3 px-4 py-4 sm:px-5">
                <Avatar name={n.author} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <p className="text-[13px] font-medium text-ink">{n.author}</p>
                    <time dateTime={n.createdAt} title={formatDateTime(n.createdAt)} className="text-xs text-ink-4 tabular">
                      {formatDateTime(n.createdAt)} · {formatRelative(n.createdAt)}
                    </time>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed break-words whitespace-pre-line text-ink-2">{n.body}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState compact icon={StickyNote} title="No notes yet" description="Record context for other admins — support conversations, goodwill gestures or account caveats." />
        )}
      </Card>

      <Card title="Add a note" className="lg:self-start">
        {canWrite ? (
          <form onSubmit={submit} noValidate className="space-y-3">
            <FormField label="Note" required error={error} hint={`${body.length}/${MAX} characters. Recorded in the audit log.`}>
              {(p) => (
                <Textarea
                  {...p}
                  rows={5}
                  maxLength={MAX}
                  value={body}
                  onChange={(e) => { setBody(e.target.value); if (error) setError(null) }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(e) }}
                  placeholder="e.g. Called the user about a failed payment; they’ll update their card today."
                />
              )}
            </FormField>
            <div className="flex justify-end">
              <Button type="submit" variant="primary" loading={saving} disabled={!body.trim()}>Add note</Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-ink-3">You don’t have permission to add notes to this account.</p>
        )}
      </Card>
    </div>
  )
}

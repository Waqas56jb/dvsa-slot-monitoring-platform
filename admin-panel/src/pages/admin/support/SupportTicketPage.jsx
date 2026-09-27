import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, MessageSquare, RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SkeletonDetail } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/States'
import { PermissionGate } from '@/routes/guards'
import { PriorityLabel, OPEN_STATUSES } from './TicketBits'
import { ConversationThread, ReplyBox, InternalNotes } from './TicketConversation'
import { TicketControls, UserInfoCard, RelatedMonitoringCard, RelatedSlotCard } from './TicketSidebar'
import { useAsync } from '@/hooks/useAsync'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useToast } from '@/context/NotificationContext'
import { supportService } from '@/services/supportService'
import { adminService } from '@/services/adminService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { formatDateTime, pluralize } from '@/utils/format'

const FIELD_LABELS = { status: 'Status', priority: 'Priority', assigneeId: 'Assignment', category: 'Category' }

export default function SupportTicketPage() {
  const { id } = useParams()
  const { admin, can } = useAdminAuth()
  const toast = useToast()
  const { data: ticket, loading, error, reload, setData } = useAsync(() => supportService.getTicketById(id), [id])
  const admins = useAsync(() => adminService.getAdmins({ pageSize: 50, sort: 'name', order: 'asc' }), [])
  const canReply = can(P.SUPPORT_REPLY)
  const adminList = admins.data?.data

  const updateField = useCallback(async (field, value) => {
    try {
      const res = await supportService.updateTicket(id, { [field]: value })
      setData((t) => ({ ...t, status: res.status, priority: res.priority, category: res.category, assigneeId: res.assigneeId, assignee: res.assignee, updatedAt: res.updatedAt }))
      const msg = field === 'assigneeId'
        ? (value ? (value === admin?.id ? 'Ticket assigned to you.' : `Ticket assigned to ${res.assignee?.name ?? 'admin'}.`) : 'Ticket unassigned.')
        : `${FIELD_LABELS[field]} updated to ${value}.`
      toast.success(msg)
      return true
    } catch (e) {
      toast.error(e.message || 'Unable to update ticket. Please try again.')
      return false
    }
  }, [id, setData, toast, admin?.id])

  const sendReply = useCallback(async (body, clear) => {
    const tempId = `pending_${Date.now()}`
    const optimistic = { id: tempId, from: 'admin', authorName: admin?.name || 'Support', body, createdAt: new Date().toISOString(), pending: true }
    clear()
    setData((t) => ({ ...t, messages: [...t.messages, optimistic] }))
    try {
      const msg = await supportService.reply(id, body)
      const me = admin ? { id: admin.id, name: admin.name, email: admin.email, role: admin.role } : null
      setData((t) => ({
        ...t,
        messages: t.messages.map((m) => (m.id === tempId ? msg : m)),
        messageCount: t.messages.length,
        updatedAt: msg.createdAt,
        status: t.status === 'Open' ? 'In Progress' : t.status,
        assigneeId: t.assigneeId || me?.id || null,
        assignee: t.assignee || me,
      }))
      toast.success('Reply sent to the customer.')
      return true
    } catch (e) {
      setData((t) => ({ ...t, messages: t.messages.filter((m) => m.id !== tempId) }))
      toast.error(e.message || 'Unable to send reply. Please try again.')
      return false
    }
  }, [id, admin, setData, toast])

  const addNote = useCallback(async (body) => {
    try {
      const note = await supportService.addInternalNote(id, body)
      setData((t) => ({ ...t, internalNotes: [note, ...(t.internalNotes || [])] }))
      toast.success('Internal note added.')
      return true
    } catch (e) {
      toast.error(e.message || 'Unable to save note. Please try again.')
      return false
    }
  }, [id, setData, toast])

  if (loading && !ticket) return <SkeletonDetail />
  if (error && !ticket) {
    const notFound = error.status === 404
    return (
      <div className="card">
        <ErrorState
          title={notFound ? 'Ticket not found' : 'Unable to load ticket.'}
          message={notFound ? `We couldn't find ticket ${id}. It may have been removed.` : 'Unable to load this ticket. Please try again.'}
          onRetry={notFound ? undefined : reload}
          showBack
        />
      </div>
    )
  }
  if (!ticket) return null

  const isOpen = OPEN_STATUSES.includes(ticket.status)
  const replyHint = ticket.status === 'Open' ? 'Replying moves the ticket to In Progress.' : null

  return (
    <>
      <PageHeader
        back={{ to: '/admin/support', label: 'Support' }}
        title={ticket.subject}
        documentTitle={`${ticket.id} · Support`}
        meta={<><StatusBadge status={ticket.status} /><PriorityLabel priority={ticket.priority} /></>}
        description={
          <>
            <span className="font-mono text-[12.5px]">{ticket.id}</span>
            <span className="mx-1.5 text-ink-4" aria-hidden>·</span>
            Opened {formatDateTime(ticket.createdAt)} by {ticket.user?.name ?? 'a deleted user'}
          </>
        }
        actions={
          <PermissionGate permission={P.SUPPORT_REPLY}>
            {isOpen
              ? <Button icon={CheckCircle2} onClick={() => updateField('status', 'Resolved')}>Mark as resolved</Button>
              : <Button icon={RotateCcw} onClick={() => updateField('status', 'Open')}>Reopen ticket</Button>}
          </PermissionGate>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <Card
            title="Conversation"
            description={pluralize(ticket.messages.length, 'message')}
            icon={MessageSquare}
            footer={
              canReply ? (
                <ReplyBox onSend={sendReply} hint={replyHint} />
              ) : (
                <p className="text-[13px] text-ink-3">You have read-only access to support tickets. Ask a Super Admin if you need to reply.</p>
              )
            }
          >
            <ConversationThread messages={ticket.messages} userName={ticket.user?.name} />
          </Card>

          <InternalNotes notes={ticket.internalNotes || []} onAdd={addNote} canAdd={canReply} />
        </div>

        <aside className="min-w-0 space-y-6" aria-label="Ticket information">
          <TicketControls ticket={ticket} admins={adminList} adminsLoading={admins.loading} canEdit={canReply} onChange={updateField} meId={admin?.id} />
          <UserInfoCard user={ticket.userDetails} />
          <RelatedMonitoringCard job={ticket.monitoring} />
          <RelatedSlotCard slot={ticket.slot} />
        </aside>
      </div>
    </>
  )
}

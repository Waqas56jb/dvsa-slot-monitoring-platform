import { useState } from 'react'
import { ArrowUpRight, CalendarClock, Radar, UserRound } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Identity } from '@/components/common/Avatar'
import { Badge, StatusBadge } from '@/components/common/StatusBadge'
import { DescriptionList } from '@/components/common/DescriptionList'
import { EntityLink } from '@/components/common/Misc'
import { FormField, Select } from '@/components/forms/Fields'
import { Spinner } from '@/components/common/Spinner'
import { TICKET_STATUSES, TICKET_PRIORITIES, TICKET_CATEGORIES } from '@/constants/status'
import { ROLE_LABELS } from '@/constants/permissions'
import { formatDate, formatDateTime, formatDayDate, formatNumber, formatRelative } from '@/utils/format'

/**
 * Status / priority / category / assignment. Each change is saved immediately.
 * onChange(field, value) must resolve true on success.
 */
export function TicketControls({ ticket, admins, adminsLoading, canEdit, onChange, meId }) {
  const [saving, setSaving] = useState(null)
  const save = async (field, value) => {
    setSaving(field)
    await onChange(field, value)
    setSaving(null)
  }
  const assignable = (admins || []).filter((a) => a.status === 'Active' || a.id === ticket.assigneeId)
  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...assignable.map((a) => ({ value: a.id, label: `${a.name}${a.id === meId ? ' (you)' : ''} · ${ROLE_LABELS[a.role] || a.roleLabel || ''}` })),
  ]
  if (ticket.assigneeId && !assignable.some((a) => a.id === ticket.assigneeId)) {
    assigneeOptions.push({ value: ticket.assigneeId, label: ticket.assignee?.name || ticket.assigneeId })
  }
  const field = (key, label, options, value) => (
    <FormField label={label} labelAction={saving === key && <Spinner className="h-3.5 w-3.5" label={`Saving ${label.toLowerCase()}`} />}>
      {(p) => (
        <Select
          {...p}
          size="sm"
          value={value ?? ''}
          options={options}
          disabled={!canEdit || !!saving || (key === 'assigneeId' && adminsLoading)}
          onChange={(e) => save(key, key === 'assigneeId' ? e.target.value || null : e.target.value)}
        />
      )}
    </FormField>
  )
  return (
    <Card title="Ticket details">
      <div className="space-y-4">
        {field('status', 'Status', TICKET_STATUSES, ticket.status)}
        {field('priority', 'Priority', TICKET_PRIORITIES, ticket.priority)}
        {field('assigneeId', 'Assigned to', assigneeOptions, ticket.assigneeId)}
        {field('category', 'Category', TICKET_CATEGORIES, ticket.category)}
        {!canEdit && <p className="text-xs text-ink-4">You have read-only access to this ticket.</p>}
      </div>
      <div className="mt-5 border-t border-line pt-4">
        <DescriptionList
          columns={1}
          dense
          items={[
            { label: 'Ticket ID', value: ticket.id, mono: true },
            { label: 'Created', value: <span title={formatDateTime(ticket.createdAt)}>{formatDateTime(ticket.createdAt)}</span> },
            { label: 'Last updated', value: <span title={formatDateTime(ticket.updatedAt)}>{formatRelative(ticket.updatedAt)}</span> },
          ]}
        />
      </div>
    </Card>
  )
}

export function UserInfoCard({ user }) {
  if (!user) {
    return (
      <Card title="User" icon={UserRound}>
        <p className="text-[13px] text-ink-3">This user account no longer exists.</p>
      </Card>
    )
  }
  return (
    <Card title="User" icon={UserRound} actions={<Button size="sm" variant="ghost" iconRight={ArrowUpRight} to={`/admin/users/${user.id}`}>View</Button>}>
      <Identity name={user.name} subtitle={user.email} size="md" />
      <DescriptionList
        className="mt-4"
        columns={2}
        dense
        items={[
          { label: 'Plan', value: user.plan ? <Badge tone={user.plan === 'Premium' ? 'brand' : 'neutral'}>{user.plan}</Badge> : <span className="text-ink-4">None</span> },
          { label: 'Status', value: <StatusBadge status={user.status} /> },
          { label: 'Learners', value: <span className="tabular">{formatNumber(user.learnersCount)}</span> },
          { label: 'Active monitoring', value: <span className="tabular">{formatNumber(user.activeMonitoring)}</span> },
          { label: 'Phone', value: user.phone || '—' },
          { label: 'Member since', value: formatDate(user.createdAt) },
        ]}
      />
    </Card>
  )
}

export function RelatedMonitoringCard({ job }) {
  if (!job) return null
  return (
    <Card title="Related monitoring job" icon={Radar} actions={<Button size="sm" variant="ghost" iconRight={ArrowUpRight} to={`/admin/monitoring/${job.id}`}>Open</Button>}>
      <div className="flex items-center justify-between gap-3">
        <EntityLink to={`/admin/monitoring/${job.id}`} mono>{job.id}</EntityLink>
        <StatusBadge status={job.status} />
      </div>
      <DescriptionList
        className="mt-4"
        columns={1}
        dense
        items={[
          job.learner && { label: 'Learner', value: job.learner.name },
          { label: 'Centres', value: job.centres?.filter(Boolean).map((c) => c.shortName || c.name).join(', ') || '—' },
          { label: 'Date window', value: `${formatDate(job.dateFrom)} – ${formatDate(job.dateTo)}` },
          { label: 'Last check', value: job.lastChecked ? <span title={formatDateTime(job.lastChecked)}>{formatRelative(job.lastChecked)}</span> : '—' },
          job.failureReason && { label: 'Failure reason', value: <span className="text-danger">{job.failureReason}</span> },
        ]}
      />
    </Card>
  )
}

export function RelatedSlotCard({ slot }) {
  if (!slot) return null
  return (
    <Card title="Related slot" icon={CalendarClock} actions={<Button size="sm" variant="ghost" iconRight={ArrowUpRight} to={`/admin/slots/${slot.id}`}>Open</Button>}>
      <div className="flex items-center justify-between gap-3">
        <EntityLink to={`/admin/slots/${slot.id}`} mono>{slot.id}</EntityLink>
        <StatusBadge status={slot.status} />
      </div>
      <DescriptionList
        className="mt-4"
        columns={1}
        dense
        items={[
          { label: 'Test centre', value: slot.centre?.name || '—' },
          { label: 'Test date', value: <span className="tabular">{formatDayDate(slot.testDate)} · {slot.testTime}</span> },
          { label: 'Detected', value: <span title={formatDateTime(slot.detectedAt)}>{formatRelative(slot.detectedAt)}</span> },
          { label: 'Alert status', value: <StatusBadge status={slot.alertStatus} /> },
        ]}
      />
    </Card>
  )
}

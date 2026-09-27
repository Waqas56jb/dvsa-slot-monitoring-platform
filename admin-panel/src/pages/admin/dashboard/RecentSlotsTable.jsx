import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, Eye, Radar, User, CheckCheck, CalendarX2, Ban } from 'lucide-react'
import { DataTable } from '@/components/tables/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { CopyId, EntityLink } from '@/components/common/Misc'
import { useAsync } from '@/hooks/useAsync'
import { useNow, useRealtime } from '@/hooks/useUtils'
import { usePermission } from '@/context/AdminAuthContext'
import { useToast } from '@/context/NotificationContext'
import { slotService } from '@/services/slotService'
import { centreSummary, userSummary, learnerSummary } from '@/services/_joins'
import { PERMISSIONS as P } from '@/constants/permissions'
import { formatDayDate, formatRelative, formatDateTime } from '@/utils/format'
import { USE_MOCKS } from '@/constants/config'

const LIMIT = 8
// Admins may only set informational statuses; "Booked" is backend-confirmed only.
const ADMIN_SETTABLE = [['Viewed', CheckCheck], ['Expired', CalendarX2], ['Unavailable', Ban]]

export function RecentSlotsTable() {
  const navigate = useNavigate()
  const can = usePermission()
  const toast = useToast()
  const now = useNow(15000)
  const { data, loading, error, reload, setData } = useAsync(() => slotService.getRecentSlots(LIMIT), [])
  const [fresh, setFresh] = useState(() => new Set())

  useRealtime('slot', (s) => {
    // Realtime payloads are raw rows; the API will send joined rows — mock joins here.
    const row = USE_MOCKS ? { ...s, centre: centreSummary(s.centreId), user: userSummary(s.userId), learner: learnerSummary(s.learnerId) } : s
    setData((list) => (list ? [row, ...list].slice(0, LIMIT) : list))
    setFresh((f) => new Set(f).add(s.id))
    setTimeout(() => setFresh((f) => { const n = new Set(f); n.delete(s.id); return n }), 6000)
  })

  const mark = async (slot, status) => {
    try {
      await slotService.updateSlotStatus(slot.id, status)
      setData((list) => list.map((x) => (x.id === slot.id ? { ...x, status } : x)))
      toast.success(`Slot marked as ${status.toLowerCase()}.`)
    } catch (e) { toast.error(e.message) }
  }

  const columns = [
    { key: 'id', header: 'Slot ID', mobile: 'primary', cell: (s) => (
      <span className="flex items-center gap-2">
        <CopyId value={s.id} to={`/admin/slots/${s.id}`} />
        {fresh.has(s.id) && <span className="rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-white">NEW</span>}
      </span>
    ) },
    { key: 'centre', header: 'Centre', cell: (s) => <EntityLink to={`/admin/test-centres/${s.centreId}`} className="whitespace-nowrap">{s.centre?.shortName}</EntityLink> },
    { key: 'testDate', header: 'Date', cell: (s) => <span className="whitespace-nowrap">{formatDayDate(s.testDate)}</span> },
    { key: 'testTime', header: 'Time', cell: (s) => <span className="font-mono text-[12.5px]">{s.testTime}</span> },
    { key: 'user', header: 'User', cell: (s) => <EntityLink to={`/admin/users/${s.userId}`} className="whitespace-nowrap">{s.user?.name}</EntityLink> },
    { key: 'learner', header: 'Learner', defaultHidden: true, cell: (s) => <EntityLink to={`/admin/learners/${s.learnerId}`}>{s.learner?.name}</EntityLink> },
    { key: 'status', header: 'Status', mobile: 'badge', cell: (s) => <StatusBadge status={s.status} /> },
    { key: 'detectedAt', header: 'Detected', cell: (s) => <span className="whitespace-nowrap text-ink-3" title={formatDateTime(s.detectedAt)}>{formatRelative(s.detectedAt, now)}</span> },
    { key: 'alertStatus', header: 'Alert', cell: (s) => <StatusBadge status={s.alertStatus} size="sm" /> },
  ]

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Recent Slot Detections</h2>
          <p className="text-[13px] text-ink-3">Newest availability matched to monitoring jobs</p>
        </div>
        <Link to="/admin/slots" className="shrink-0 text-[13px] font-medium text-brand-600 hover:underline dark:text-brand-300">View all slots</Link>
      </div>
      <DataTable
        caption="Recent slot detections"
        columns={columns}
        rows={data || []}
        loading={loading}
        error={error}
        onRetry={reload}
        columnToggle={false}
        onRowClick={(s) => navigate(`/admin/slots/${s.id}`)}
        emptyIcon={CalendarClock}
        emptyTitle="No slots detected"
        emptyDescription="New availability will appear here the moment it’s detected."
        rowActions={(s) => [
          { label: 'View slot', icon: Eye, to: `/admin/slots/${s.id}` },
          { label: 'View user', icon: User, to: `/admin/users/${s.userId}` },
          { label: 'View monitoring', icon: Radar, to: `/admin/monitoring/${s.monitoringId}` },
          { type: 'separator', hidden: !can(P.SLOTS_MANAGE) },
          { type: 'label', label: 'Mark status', hidden: !can(P.SLOTS_MANAGE) },
          ...ADMIN_SETTABLE.map(([st, Icon]) => ({ label: `Mark ${st.toLowerCase()}`, icon: Icon, onSelect: () => mark(s, st), hidden: !can(P.SLOTS_MANAGE), disabled: s.status === st })),
        ]}
      />
    </div>
  )
}

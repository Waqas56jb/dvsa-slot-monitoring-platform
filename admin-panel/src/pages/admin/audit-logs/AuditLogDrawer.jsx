import { ArrowRight, ArrowUpRight, Lock } from 'lucide-react'
import { Drawer } from '@/components/common/Drawer'
import { Button } from '@/components/common/Button'
import { Identity } from '@/components/common/Avatar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { DescriptionList } from '@/components/common/DescriptionList'
import { CopyId, SectionTitle } from '@/components/common/Misc'
import { formatDateTime, formatRelative } from '@/utils/format'

/** Maps an audit resource to its admin detail page, when one exists. */
const RESOURCE_PATHS = {
  User: '/admin/users/', Monitoring: '/admin/monitoring/', Payment: '/admin/payments/', Admin: '/admin/admins/',
  'Test centre': '/admin/test-centres/', Learner: '/admin/learners/', Support: '/admin/support/', Slot: '/admin/slots/',
}
export function resourceHref(log) {
  const base = RESOURCE_PATHS[log?.resource]
  return base && log.resourceId && !/\s/.test(log.resourceId) ? `${base}${log.resourceId}` : null
}

const show = (v) => (v == null || v === '' ? <span className="text-ink-4 italic">empty</span> : String(v))

function ChangesTable({ changes }) {
  const rows = Object.entries(changes || {})
  if (!rows.length) return <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-[13px] text-ink-3">No field changes were recorded for this action.</p>
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full table-fixed text-left text-[13px]">
        <caption className="sr-only">Field changes</caption>
        <thead className="bg-subtle/70 text-xs text-ink-3">
          <tr>
            <th scope="col" className="w-[30%] px-3 py-2 font-medium">Field</th>
            <th scope="col" className="px-3 py-2 font-medium">Before</th>
            <th scope="col" className="w-6 px-0 py-2"><span className="sr-only">to</span></th>
            <th scope="col" className="px-3 py-2 font-medium">After</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map(([field, pair]) => {
            const [before, after] = Array.isArray(pair) ? pair : [undefined, pair]
            return (
              <tr key={field} className="align-top">
                <th scope="row" className="px-3 py-2.5 font-mono text-[12px] font-normal break-words text-ink-2">{field}</th>
                <td className="px-3 py-2.5 break-words"><span className="rounded bg-danger-soft px-1.5 py-0.5 text-danger line-through decoration-danger/40">{show(before)}</span></td>
                <td className="px-0 py-2.5 text-ink-4"><ArrowRight className="h-3.5 w-3.5" aria-hidden /></td>
                <td className="px-3 py-2.5 break-words"><span className="rounded bg-success-soft px-1.5 py-0.5 text-success">{show(after)}</span></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function AuditLogDrawer({ log, open, onClose }) {
  const href = resourceHref(log)
  return (
    <Drawer open={open} onClose={onClose} title="Audit entry" width="w-full sm:w-[480px] sm:max-w-[92vw]" footer={href && <Button className="w-full" iconRight={ArrowUpRight} to={href} onClick={onClose}>Open {log?.resource?.toLowerCase()}</Button>}>
      {log && (
        <div className="space-y-6 p-4 sm:p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={log.result} />
              <CopyId value={log.id} />
            </div>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.01em] text-ink">{log.action}</h3>
            <p className="mt-0.5 text-[13px] text-ink-3">
              <time dateTime={log.timestamp}>{formatDateTime(log.timestamp)}</time> · {formatRelative(log.timestamp)}
            </p>
          </div>

          <section>
            <SectionTitle>Performed by</SectionTitle>
            <Identity name={log.adminName} subtitle={log.adminRole} size="md" />
          </section>

          <section>
            <SectionTitle>Details</SectionTitle>
            <DescriptionList
              columns={2}
              dense
              items={[
                { label: 'Resource', value: log.resource },
                { label: 'Resource ID', value: log.resourceId, mono: true },
                { label: 'IP address', value: log.ip, mono: true },
                { label: 'Admin ID', value: log.adminId, mono: true },
                { label: 'User agent', value: log.userAgent, full: true },
              ]}
            />
          </section>

          <section>
            <SectionTitle>Changes</SectionTitle>
            <ChangesTable changes={log.changes} />
          </section>

          <p className="flex items-start gap-2 rounded-lg bg-subtle px-3 py-2.5 text-xs text-ink-3">
            <Lock className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
            Audit entries are immutable. They cannot be edited or deleted by any admin, including Super Admins.
          </p>
        </div>
      )}
    </Drawer>
  )
}

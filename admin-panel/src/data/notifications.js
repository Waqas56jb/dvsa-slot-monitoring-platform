import { createRandom, NOW, MINUTE, DAY, pad } from '@/lib/mock'
import { slots } from './slots'
import { users } from './users'
import { monitoringJobs } from './monitoring'
import { centreById } from './testCentres'
import { formatDayDate } from '@/utils/format'

const r = createRandom(4096)

/** Outbound notifications sent to platform users (email / browser / SMS / webhook). */
export const notifications = []
let seq = 80000

for (const s of slots.slice(0, 380)) {
  const job = monitoringJobs.find((j) => j.id === s.monitoringId)
  const centre = centreById(s.centreId)
  for (const channel of job.channels.slice(0, r.int(1, job.channels.length))) {
    seq += r.int(1, 4)
    const created = new Date(s.detectedAt).getTime() + r.int(2, 30) * 1000
    const status = s.alertStatus === 'Queued' ? 'Queued' : channel === 'SMS' && r.chance(0.08) ? 'Failed' : s.alertStatus
    notifications.push({
      id: `NTF-${pad(seq, 6)}`,
      userId: s.userId,
      slotId: s.id,
      monitoringId: s.monitoringId,
      type: 'Slot alert',
      channel,
      message: `Slot available at ${centre?.shortName} — ${formatDayDate(s.testDate)} at ${s.testTime}`,
      status,
      error: status === 'Failed' ? r.pick(['Carrier rejected message (invalid number)', 'Mailbox unavailable', 'Push subscription expired']) : null,
      attempts: status === 'Failed' ? 3 : 1,
      createdAt: new Date(created).toISOString(),
      deliveredAt: ['Delivered', 'Read', 'Sent'].includes(status) ? new Date(created + r.int(1, 25) * 1000).toISOString() : null,
    })
  }
}

// Non-slot system/account notifications
const SYSTEM_TYPES = [
  ['Monitoring paused', (u) => `Your monitoring for ${u.name.split(' ')[0]} has been paused.`],
  ['Payment receipt', () => 'Thanks — your SlotPilot subscription payment was received.'],
  ['Payment failed', () => 'We could not take your subscription payment. Please update your card.'],
  ['Welcome', (u) => `Welcome to SlotPilot, ${u.name.split(' ')[0]}. Add a learner to start monitoring.`],
  ['Monitoring expiring', () => 'Your monitoring date range ends in 3 days. Extend it to keep receiving alerts.'],
]
for (let i = 0; i < 140; i++) {
  const u = r.pick(users)
  const [type, msg] = r.pick(SYSTEM_TYPES)
  seq += r.int(1, 4)
  const created = NOW - Math.floor(Math.pow(r.next(), 1.5) * 30 * DAY)
  const status = r.weighted([['Delivered', 70], ['Read', 15], ['Queued', 5], ['Failed', 5], ['Sent', 5]])
  notifications.push({
    id: `NTF-${pad(seq, 6)}`,
    userId: u.id,
    slotId: null,
    monitoringId: null,
    type,
    channel: r.weighted([['Email', 75], ['Browser', 20], ['SMS', 5]]),
    message: msg(u),
    status,
    error: status === 'Failed' ? 'Mailbox unavailable' : null,
    attempts: status === 'Failed' ? 3 : 1,
    createdAt: new Date(created).toISOString(),
    deliveredAt: ['Delivered', 'Read', 'Sent'].includes(status) ? new Date(created + r.int(2, 40) * 1000).toISOString() : null,
  })
}
notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

/** Notifications addressed to admins (header bell). */
export const adminInbox = [
  { id: 'ain_1', kind: 'slot', title: 'New slot detected', body: 'Wood Green — 14 Oct, 08:14 matched 3 monitoring jobs.', href: '/admin/slots', createdAt: new Date(NOW - 2 * MINUTE).toISOString(), read: false },
  { id: 'ain_2', kind: 'monitoring', title: 'Monitoring job failed', body: 'MON-1187 exceeded its retry budget after 5 consecutive errors.', href: '/admin/monitoring?status=Failed', createdAt: new Date(NOW - 18 * MINUTE).toISOString(), read: false },
  { id: 'ain_3', kind: 'payment', title: 'Payment failed', body: 'Premium renewal for a customer was declined by the card issuer.', href: '/admin/payments?status=Failed', createdAt: new Date(NOW - 52 * MINUTE).toISOString(), read: false },
  { id: 'ain_4', kind: 'support', title: 'New support ticket', body: '“Alerts arriving late on SMS” — priority High.', href: '/admin/support', createdAt: new Date(NOW - 95 * MINUTE).toISOString(), read: true },
  { id: 'ain_5', kind: 'system', title: 'System warning', body: 'Notification queue depth above 500 for 4 minutes. Recovered.', href: '/admin/system-health', createdAt: new Date(NOW - 5 * 60 * MINUTE).toISOString(), read: true },
]

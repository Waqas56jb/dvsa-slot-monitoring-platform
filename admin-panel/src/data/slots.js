import { createRandom, NOW, MINUTE, HOUR, DAY, pad } from '@/lib/mock'
import { monitoringJobs } from './monitoring'
import { users } from './users'
import { learners } from './learners'
import { testCentres } from './testCentres'

const r = createRandom(2048)

const TIMES = ['07:57', '08:14', '08:51', '09:28', '10:05', '10:42', '11:19', '12:03', '13:10', '13:47', '14:24', '15:01', '15:38']

/**
 * A slot is an availability observation supplied by the backend, attached to
 * the monitoring job(s) whose preferences it matched. Status lifecycle:
 * New → Matched → Alerted → Viewed → (Booked | Expired | Unavailable).
 * "Booked" is only ever shown when the backend confirms it.
 */
export const slots = []
let seq = 50000

const eligible = monitoringJobs.filter((j) => ['Running', 'Paused', 'Completed', 'Expired'].includes(j.status))
for (let i = 0; i < 540; i++) {
  const job = r.pick(eligible)
  const centreId = r.pick(job.centreIds)
  // skew detections toward recent hours so "today" looks busy
  const detectedAgoMs = Math.floor(Math.pow(r.next(), 2.2) * 30 * DAY) + r.int(20, 600) * 1000
  const detectedAt = NOW - detectedAgoMs
  const hoursOld = detectedAgoMs / HOUR
  let status
  if (hoursOld < 0.2) status = r.weighted([['New', 4], ['Matched', 3], ['Alerted', 3]])
  else if (hoursOld < 6) status = r.weighted([['Alerted', 5], ['Viewed', 3], ['Unavailable', 2], ['Booked', 0.4]])
  else status = r.weighted([['Expired', 6], ['Unavailable', 3], ['Viewed', 2], ['Booked', 0.35]])

  const testDate = new Date(Math.max(detectedAt + 2 * DAY, new Date(job.dateFrom).getTime()) + r.int(0, 40) * DAY)
  const alertStatus = status === 'New' || status === 'Matched' ? 'Queued' : r.weighted([['Delivered', 70], ['Read', 20], ['Failed', 4], ['Sent', 6]])
  seq += r.int(1, 9)
  slots.push({
    id: `SLT-${pad(seq, 6)}`,
    centreId,
    testDate: testDate.toISOString().slice(0, 10),
    testTime: r.pick(TIMES),
    userId: job.userId,
    learnerId: job.learnerId,
    monitoringId: job.id,
    matchedJobIds: r.chance(0.25) ? [job.id, r.pick(eligible).id] : [job.id],
    detectedAt: new Date(detectedAt).toISOString(),
    status,
    alertStatus,
    sourceStatus: status === 'Unavailable' || status === 'Expired' ? 'No longer listed' : 'Listed',
    latencyMs: r.int(700, 9000),
    updatedAt: new Date(detectedAt + r.int(1, 90) * MINUTE).toISOString(),
  })
}
slots.sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt))

// Derived counters
const dayAgo = NOW - DAY
const weekAgo = NOW - 7 * DAY
for (const j of monitoringJobs) {
  const s = slots.filter((x) => x.matchedJobIds.includes(j.id))
  j.slotsFound = s.length
  j.alertsSent = s.filter((x) => x.alertStatus !== 'Queued').length
}
for (const u of users) {
  const s = slots.filter((x) => x.userId === u.id)
  u.slotsDetected = s.length
  u.alertsSent = s.filter((x) => x.alertStatus !== 'Queued').length
}
for (const l of learners) l.slotsFound = slots.filter((x) => x.learnerId === l.id).length
for (const c of testCentres) {
  const s = slots.filter((x) => x.centreId === c.id)
  c.slotsDetected = s.length + r.int(40, 400)
  c.slotsDetected7d = s.filter((x) => new Date(x.detectedAt) > weekAgo).length
  c.slotsDetected24h = s.filter((x) => new Date(x.detectedAt) > dayAgo).length
}

export const slotById = (id) => slots.find((s) => s.id === id)

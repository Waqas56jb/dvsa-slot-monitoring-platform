import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { realtime } from '@/lib/realtime'
import { USE_MOCKS } from '@/constants/config'
import { slots } from '@/data/slots'
import { activities } from '@/data/activities'
import { monitoringJobs } from '@/data/monitoring'
import { testCentres } from '@/data/testCentres'
import { users } from '@/data/users'
import { workers } from '@/data/analytics'

/**
 * Mock realtime engine. When enabled it publishes believable events on the
 * realtime bus at a calm cadence (a new slot every ~20–40s, heartbeats every 4s).
 * In production this provider is replaced by Supabase Realtime subscriptions
 * feeding the same channels — consumers do not change.
 */
const RealtimeContext = createContext({ live: false, setLive: () => {}, mock: false })

let slotSeq = 990000
let actSeq = 990000
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const TIMES = ['08:14', '09:28', '10:42', '12:03', '13:47', '14:24', '15:01']

function emitSlot() {
  const job = pick(monitoringJobs.filter((j) => j.status === 'Running'))
  if (!job) return
  const centre = testCentres.find((c) => c.id === pick(job.centreIds))
  const user = users.find((u) => u.id === job.userId)
  const d = new Date(Date.now() + (7 + Math.floor(Math.random() * 40)) * 864e5)
  const slot = {
    id: `SLT-${++slotSeq}`, centreId: centre.id, testDate: d.toISOString().slice(0, 10), testTime: pick(TIMES), userId: job.userId,
    learnerId: job.learnerId, monitoringId: job.id, matchedJobIds: [job.id], detectedAt: new Date().toISOString(), status: 'New',
    alertStatus: 'Queued', sourceStatus: 'Listed', latencyMs: 900 + Math.floor(Math.random() * 3000), updatedAt: new Date().toISOString(),
  }
  slots.unshift(slot)
  job.slotsFound += 1
  realtime.publish('slot', slot)
  const act = { id: `ACT-${++actSeq}`, category: 'Slot', event: 'Slot detected', description: `Slot detected at ${centre.name}`, actor: { type: 'system', id: 'system', name: 'System' }, entity: { type: 'slot', id: slot.id, label: slot.id, href: `/admin/slots/${slot.id}` }, ip: null, status: 'Success', timestamp: slot.detectedAt }
  activities.unshift(act)
  realtime.publish('activity', act)
  // Alert follows a few seconds later
  setTimeout(() => {
    slot.status = 'Alerted'
    slot.alertStatus = 'Delivered'
    const a2 = { id: `ACT-${++actSeq}`, category: 'Notification', event: 'Alert delivered', description: `${job.channels[0]} alert delivered to ${user?.name ?? 'user'}`, actor: { type: 'system', id: 'system', name: 'System' }, entity: { type: 'notification', id: slot.id, label: slot.id, href: `/admin/slots/${slot.id}` }, ip: null, status: 'Success', timestamp: new Date().toISOString() }
    activities.unshift(a2)
    realtime.publish('activity', a2)
    realtime.publish('stats', { alertsToday: 1 + Math.floor(Math.random() * 3) })
  }, 2500 + Math.random() * 2500)
  realtime.publish('stats', { slotsToday: 1 })
  if (Math.random() < 0.3) {
    realtime.publish('inbox', { id: `ain_${Date.now()}`, kind: 'slot', title: 'New slot detected', body: `${centre.shortName} — ${slot.testDate} at ${slot.testTime}`, href: `/admin/slots/${slot.id}`, createdAt: slot.detectedAt, read: false })
  }
}

function emitMisc() {
  const roll = Math.random()
  let act
  if (roll < 0.4) {
    const u = pick(users)
    act = { category: 'User', event: 'User registered', description: `${u.name.split(' ')[0]} ${u.name.split(' ')[1]?.[0]}. created an account`, actor: { type: 'user', id: u.id, name: u.name }, entity: { type: 'user', id: u.id, label: u.email, href: `/admin/users/${u.id}` }, status: 'Success' }
    realtime.publish('stats', { totalUsers: 1 })
  } else if (roll < 0.75) {
    const j = pick(monitoringJobs.filter((x) => x.status === 'Running'))
    act = { category: 'Monitoring', event: 'Monitoring job created', description: `New monitoring job across ${j.centreIds.length} centre(s)`, actor: { type: 'user', id: j.userId, name: users.find((u) => u.id === j.userId)?.name }, entity: { type: 'monitoring', id: j.id, label: j.id, href: `/admin/monitoring/${j.id}` }, status: 'Success' }
    realtime.publish('stats', { activeMonitoring: 1 })
  } else {
    act = { category: 'Payment', event: 'Payment completed', description: `${pick(['Standard', 'Premium', 'Basic'])} plan renewal`, actor: { type: 'system', id: 'system', name: 'System' }, entity: { type: 'payment', id: 'payments', label: 'Payment', href: '/admin/payments' }, status: 'Success' }
  }
  const full = { id: `ACT-${++actSeq}`, ip: null, timestamp: new Date().toISOString(), ...act }
  activities.unshift(full)
  realtime.publish('activity', full)
}

function emitHeartbeat() {
  for (const w of workers) {
    if (w.status === 'Offline') continue
    w.lastHeartbeat = new Date(Date.now() - Math.floor(Math.random() * 3000)).toISOString()
    if (w.status !== 'Idle') {
      w.jobs = Math.max(80, Math.min(w.capacity, w.jobs + Math.round((Math.random() - 0.5) * 8)))
      w.cpu = Math.max(8, Math.min(97, w.cpu + Math.round((Math.random() - 0.5) * 8)))
      w.memory = Math.max(20, Math.min(95, w.memory + Math.round((Math.random() - 0.5) * 4)))
    }
  }
  realtime.publish('heartbeat', { at: Date.now(), workers: workers.map((w) => ({ ...w })) })
}

export function RealtimeProvider({ children }) {
  const [live, setLive] = useState(USE_MOCKS)

  useEffect(() => {
    if (!USE_MOCKS || !live) return
    let slotTimer
    const scheduleSlot = () => { slotTimer = setTimeout(() => { emitSlot(); scheduleSlot() }, 20000 + Math.random() * 20000) }
    scheduleSlot()
    const firstSlot = setTimeout(emitSlot, 6000)
    const misc = setInterval(emitMisc, 17000)
    const hb = setInterval(emitHeartbeat, 4000)
    return () => { clearTimeout(slotTimer); clearTimeout(firstSlot); clearInterval(misc); clearInterval(hb) }
  }, [live])

  const value = useMemo(() => ({ live, setLive, mock: USE_MOCKS }), [live])
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}

export const useLiveMode = () => useContext(RealtimeContext)

import { createRandom, NOW, HOUR, DAY, MINUTE } from '@/lib/mock'
import { testCentres } from './testCentres'

const r = createRandom(3131)

/**
 * Platform-wide aggregates. The admin tables above are a sample of records;
 * these numbers represent the full platform as the analytics API would return them.
 */
export const kpis = {
  totalUsers: { value: 12842, delta: 8.4, label: 'Total users', hint: 'All registered accounts, excluding deleted.' },
  activeMonitoring: { value: 3421, delta: 5.1, label: 'Active monitoring jobs', hint: 'Jobs in Running state right now.' },
  slotsToday: { value: 1284, delta: 12.6, label: 'Slots detected today', hint: 'Unique availability observations since 00:00 UK time.' },
  alertsToday: { value: 4872, delta: 9.8, label: 'Alerts sent today', hint: 'Notifications dispatched across all channels since 00:00.' },
  activeLearners: { value: 8942, delta: 4.2, label: 'Active learners', hint: 'Learners with at least one running or paused job.' },
  activeCentres: { value: 284, delta: 0.7, label: 'Active test centres', hint: 'Centres currently included in monitoring schedules.' },
  conversionRate: { value: 24.8, delta: 1.9, label: 'Conversion rate', hint: 'Share of new sign-ups that start a paid plan within 14 days.', unit: '%' },
  uptime: { value: 99.98, delta: 0.01, label: 'System uptime', hint: 'Rolling 30-day availability across core services.', unit: '%' },
}

/** Smooth-ish random walk with weekly seasonality. */
function series(points, base, { noise = 0.08, trend = 0.004, weekly = 0.12, stepMs = DAY } = {}) {
  let v = base
  return Array.from({ length: points }, (_, i) => {
    const t = NOW - (points - 1 - i) * stepMs
    const d = new Date(t)
    const dow = d.getDay()
    const season = stepMs === DAY ? (dow === 0 || dow === 6 ? 1 - weekly : 1 + weekly / 3) : 1
    v = v * (1 + trend) * (1 + (r.next() - 0.5) * noise)
    return { t, value: Math.max(0, Math.round(v * season)) }
  })
}

function hourly(points, base) {
  return Array.from({ length: points }, (_, i) => {
    const t = NOW - (points - 1 - i) * HOUR
    const h = new Date(t).getHours()
    const curve = h < 6 ? 0.25 : h < 8 ? 0.7 : h < 10 ? 1.35 : h < 17 ? 1.1 : h < 21 ? 0.85 : 0.45
    return { t, value: Math.round(base * curve * (0.85 + r.next() * 0.3)) }
  })
}

const zip = (keys, arrays) => arrays[0].map((p, i) => Object.fromEntries([['t', p.t], ...keys.map((k, j) => [k, arrays[j][i].value])]))

/** Platform activity, per range. Keys are the switchable metrics. */
export const platformActivity = {
  '24h': zip(['users', 'jobs', 'slots', 'alerts'], [hourly(24, 18), hourly(24, 55), hourly(24, 52), hourly(24, 200)]),
  '7d': zip(['users', 'jobs', 'slots', 'alerts'], [series(7, 360), series(7, 1150), series(7, 1180), series(7, 4500)]),
  '30d': zip(['users', 'jobs', 'slots', 'alerts'], [series(30, 300), series(30, 980), series(30, 1000), series(30, 3900)]),
  '90d': zip(['users', 'jobs', 'slots', 'alerts'], [series(90, 220), series(90, 760), series(90, 800), series(90, 3000)]),
}

/** Slot pipeline: discovered → matched → alerts → user booking actions (user-initiated, not automated). */
export const slotPipeline = Array.from({ length: 14 }, (_, i) => {
  const t = NOW - (13 - i) * DAY
  const discovered = r.int(980, 1450)
  const matched = Math.round(discovered * (0.52 + r.next() * 0.12))
  const alerts = Math.round(matched * (2.9 + r.next() * 0.8))
  const bookingActions = Math.round(matched * (0.07 + r.next() * 0.05))
  return { t, discovered, matched, alerts, bookingActions }
})

export const monitoringStatusCounts = { Running: 2842, Paused: 341, Completed: 1206, Failed: 27, Expired: 211 }

export const userGrowth = series(90, 110, { trend: 0.006 }).map((p, i) => ({
  t: p.t,
  registrations: p.value,
  active: Math.round(4200 + i * 38 + r.int(-120, 120)),
  returning: Math.round(2600 + i * 22 + r.int(-90, 90)),
}))

export const monitoringTrend = series(30, 120).map((p) => ({
  t: p.t,
  created: p.value,
  active: 3000 + r.int(-120, 480),
  completed: Math.round(p.value * (0.6 + r.next() * 0.3)),
  failed: r.int(2, 14),
}))

export const notificationTrend = series(30, 3900).map((p) => {
  const sent = p.value
  const failed = Math.round(sent * (0.006 + r.next() * 0.01))
  const delivered = sent - failed
  return { t: p.t, sent, delivered, failed, read: Math.round(delivered * (0.58 + r.next() * 0.12)) }
})

export const revenueTrend = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(NOW)
  d.setDate(1)
  d.setMonth(d.getMonth() - (11 - i))
  const gross = Math.round((52000 + i * 6100) * (0.94 + r.next() * 0.12))
  return { t: d.getTime(), gross, successful: Math.round(gross / 21.4), failed: r.int(40, 160), refunds: Math.round(gross * (0.008 + r.next() * 0.01)) }
})

export const usageTrend = hourly(24, 42000).map((p) => ({ t: p.t, apiRequests: p.value, checks: Math.round(p.value * 1.9), workers: 10 + Math.round((p.value / 42000) * 4) }))

export const centrePerformance = testCentres
  .filter((c) => c.status === 'Active')
  .map((c) => ({ id: c.id, name: c.shortName, region: c.region, slots: c.slotsDetected, demand: c.demandScore, matchRate: Math.round(40 + r.next() * 45) }))
  .sort((a, b) => b.slots - a.slots)

export const planMix = [
  { name: 'Basic', value: 4210 },
  { name: 'Standard', value: 5630 },
  { name: 'Premium', value: 2104 },
]

export const channelMix = [
  { name: 'Email', value: 58 },
  { name: 'Browser', value: 29 },
  { name: 'SMS', value: 13 },
]

/* ------------------------------ System health ----------------------------- */

export const services = [
  { id: 'api', name: 'Admin & Public API', description: 'Express REST API', status: 'Operational', responseMs: 84, uptime: 99.99, errorRate: 0.04 },
  { id: 'db', name: 'Database', description: 'Supabase PostgreSQL', status: 'Operational', responseMs: 12, uptime: 99.99, errorRate: 0.0 },
  { id: 'auth', name: 'Authentication', description: 'Supabase Auth', status: 'Operational', responseMs: 61, uptime: 99.98, errorRate: 0.02 },
  { id: 'engine', name: 'Monitoring Engine', description: 'Availability workers', status: 'Degraded', responseMs: 2380, uptime: 99.71, errorRate: 1.8 },
  { id: 'notify', name: 'Notification Service', description: 'Email · Push · SMS dispatch', status: 'Operational', responseMs: 140, uptime: 99.95, errorRate: 0.31 },
  { id: 'queue', name: 'Queue', description: 'Job & alert queue', status: 'Operational', responseMs: 6, uptime: 99.99, errorRate: 0.0 },
  { id: 'scheduler', name: 'Scheduler', description: 'Check scheduling & retention', status: 'Operational', responseMs: 22, uptime: 99.99, errorRate: 0.0 },
  { id: 'storage', name: 'Storage', description: 'Exports & attachments', status: 'Operational', responseMs: 95, uptime: 99.97, errorRate: 0.05 },
].map((s) => ({
  ...s,
  lastCheck: new Date(NOW - r.int(5, 50) * 1000).toISOString(),
  // 30 buckets of daily status for the uptime strip
  history: Array.from({ length: 30 }, (_, i) => (s.id === 'engine' && (i === 29 || i === 17) ? 'Degraded' : s.id === 'storage' && i === 9 ? 'Down' : r.chance(0.015) ? 'Degraded' : 'Operational')),
  latency: Array.from({ length: 24 }, (_, i) => ({ t: NOW - (23 - i) * HOUR, value: Math.round(s.responseMs * (0.8 + r.next() * 0.4) * (s.id === 'engine' && i > 20 ? 1.6 : 1)) })),
}))

export const workers = Array.from({ length: 12 }, (_, i) => {
  const status = i === 7 ? 'Degraded' : i === 10 ? 'Offline' : i === 11 ? 'Idle' : 'Online'
  return {
    id: `wrk_${String(i + 1).padStart(2, '0')}`,
    name: `Worker #${String(i + 1).padStart(2, '0')}`,
    region: i < 8 ? 'eu-west-2 (London)' : 'eu-west-1 (Ireland)',
    status,
    jobs: status === 'Offline' ? 0 : status === 'Idle' ? 0 : r.int(118, 296),
    capacity: 300,
    cpu: status === 'Offline' ? 0 : r.int(18, status === 'Degraded' ? 94 : 72),
    memory: status === 'Offline' ? 0 : r.int(34, status === 'Degraded' ? 91 : 76),
    avgResponseMs: status === 'Offline' ? null : r.int(620, status === 'Degraded' ? 4100 : 1900),
    lastHeartbeat: new Date(NOW - (status === 'Offline' ? 14 * MINUTE : r.int(1, 9) * 1000)).toISOString(),
    version: 'engine-3.8.2',
    uptimeHours: status === 'Offline' ? 0 : r.int(2, 340),
  }
})

export const engineSummary = {
  queued: 186,
  failedJobs24h: 27,
  checksPerMinute: 1840,
}

export const systemBanner = {
  active: true,
  severity: 'warning',
  message: 'Monitoring service is experiencing degraded performance.',
  detail: 'Elevated upstream latency on 1 worker. Alerts are still being delivered.',
}

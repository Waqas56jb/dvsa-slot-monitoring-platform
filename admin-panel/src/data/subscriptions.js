import { createRandom, NOW, DAY, pad } from '@/lib/mock'
import { users } from './users'

const r = createRandom(5150)

export const PLANS = {
  Basic: { name: 'Basic', price: 9.99, interval: 'month', learnerLimit: 1, monitoringLimit: 1, centreLimit: 3, channels: ['Email'], checkInterval: 180 },
  Standard: { name: 'Standard', price: 19.99, interval: 'month', learnerLimit: 2, monitoringLimit: 3, centreLimit: 6, channels: ['Email', 'Browser'], checkInterval: 90 },
  Premium: { name: 'Premium', price: 34.99, interval: 'month', learnerLimit: 5, monitoringLimit: 10, centreLimit: 12, channels: ['Email', 'Browser', 'SMS'], checkInterval: 60 },
}

export const subscriptions = []
let seq = 3000
for (const u of users) {
  if (u.status === 'Pending') continue
  let plan = r.weighted([['Basic', 35], ['Standard', 45], ['Premium', 20]])
  // A customer is always on a plan that allows what they actually use.
  const fits = (name) => PLANS[name].learnerLimit >= u.learnersCount && PLANS[name].monitoringLimit >= u.activeMonitoring
  if (!fits(plan)) plan = ['Basic', 'Standard', 'Premium'].find(fits) || 'Premium'
  const p = PLANS[plan]
  let status
  if (u.status === 'Disabled') status = 'Cancelled'
  else if (u.status === 'Suspended') status = r.pick(['Past_due', 'Cancelled'])
  else status = r.weighted([['Active', 80], ['Trialing', 8], ['Past_due', 5], ['Cancelled', 4], ['Expired', 3]])
  const start = new Date(u.createdAt).getTime() + r.int(0, 2) * DAY
  const cycles = Math.max(0, Math.floor((NOW - start) / (30 * DAY)))
  const renewal = start + (cycles + 1) * 30 * DAY
  seq++
  const sub = {
    id: `SUB-${pad(seq, 5)}`,
    userId: u.id,
    plan,
    status,
    price: p.price,
    currency: 'GBP',
    startDate: new Date(start).toISOString(),
    renewalDate: ['Cancelled', 'Expired'].includes(status) ? null : new Date(renewal).toISOString(),
    cancelledAt: status === 'Cancelled' ? new Date(NOW - r.int(1, 40) * DAY).toISOString() : null,
    learnerLimit: p.learnerLimit,
    monitoringLimit: p.monitoringLimit,
    learnersUsed: Math.min(u.learnersCount, p.learnerLimit),
    monitoringUsed: Math.min(u.activeMonitoring, p.monitoringLimit),
    paymentStatus: status === 'Past_due' ? 'Failed' : status === 'Trialing' ? 'Pending' : 'Paid',
    paymentMethod: r.weighted([['Visa •••• ' + r.int(1000, 9999), 55], ['Mastercard •••• ' + r.int(1000, 9999), 35], ['Apple Pay', 10]]),
    cycles,
  }
  subscriptions.push(sub)
  u.plan = status === 'Cancelled' || status === 'Expired' ? null : plan
  u.subscriptionStatus = status
}

export const subscriptionById = (id) => subscriptions.find((s) => s.id === id)

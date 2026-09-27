import { createRandom, ago, ahead, NOW, MINUTE, HOUR, DAY } from '@/lib/mock'
import { learners } from './learners'
import { users } from './users'
import { testCentres } from './testCentres'

const r = createRandom(1024)

const TIME_WINDOWS = [
  ['07:30', '12:00'], ['08:00', '16:00'], ['09:00', '15:30'], ['12:00', '17:00'], ['07:30', '17:30'], ['10:00', '14:00'],
]
const FAILURE_REASONS = [
  'Upstream availability source returned repeated timeouts',
  'Preferences reference an inactive test centre',
  'Learner reference could not be validated',
  'Exceeded retry budget after 5 consecutive errors',
]

export const monitoringJobs = []
let seq = 1000

for (const l of learners) {
  const user = users.find((u) => u.id === l.userId)
  const jobCount = l.status === 'Active' ? r.weighted([[1, 80], [2, 20]]) : r.weighted([[0, 40], [1, 60]])
  for (let k = 0; k < jobCount; k++) {
    seq++
    const createdDays = Math.max(1, Math.min(r.int(1, 120), Math.floor((NOW - new Date(l.createdAt)) / DAY)))
    let status
    if (user.status === 'Suspended' || user.status === 'Disabled') status = r.pick(['Paused', 'Cancelled'])
    else if (l.status !== 'Active') status = r.weighted([['Completed', 45], ['Expired', 35], ['Cancelled', 20]])
    else status = r.weighted([['Running', 78], ['Paused', 10], ['Failed', 4], ['Completed', 5], ['Expired', 3]])

    const startIn = r.int(-10, 21)
    const span = r.int(14, 90)
    const [timeFrom, timeTo] = r.pick(TIME_WINDOWS)
    const live = status === 'Running'
    const frequency = r.pick([60, 90, 120, 180])
    const lastChecked = live ? ago(r.int(3, frequency) * 1000) : ago(r.int(2, 30) * DAY + r.int(1, 20) * HOUR)
    const centreIds = r.chance(0.8) ? l.preferredCentres : r.sample(testCentres.filter((c) => c.region === 'London'), r.int(1, 3)).map((c) => c.id)

    monitoringJobs.push({
      id: `MON-${seq}`,
      userId: l.userId,
      learnerId: l.id,
      centreIds,
      dateFrom: new Date(NOW + startIn * DAY).toISOString().slice(0, 10),
      dateTo: new Date(NOW + (startIn + span) * DAY).toISOString().slice(0, 10),
      timeFrom,
      timeTo,
      weekdaysOnly: r.chance(0.35),
      frequency, // seconds between checks
      status,
      failureReason: status === 'Failed' ? r.pick(FAILURE_REASONS) : null,
      lastChecked,
      nextCheck: live ? ahead(r.int(5, frequency) * 1000) : null,
      checksCount: r.int(200, 42000),
      slotsFound: 0, // derived from slots.js
      alertsSent: 0,
      channels: r.sample(['Email', 'Browser', 'SMS'], r.int(1, 3)),
      // never before the learner existed
      createdAt: new Date(Math.max(new Date(l.createdAt).getTime() + r.int(5, 180) * MINUTE, NOW - createdDays * DAY - r.int(0, 23) * HOUR)).toISOString(),
      updatedAt: ago(r.int(1, Math.max(2, createdDays)) * HOUR),
    })
  }
}

// Derived counters
for (const l of learners) {
  const jobs = monitoringJobs.filter((j) => j.learnerId === l.id)
  l.monitoringCount = jobs.length
  if (jobs[0]) { l.earliestDate = jobs[0].dateFrom; l.latestDate = jobs[0].dateTo; l.timeFrom = jobs[0].timeFrom; l.timeTo = jobs[0].timeTo }
}
for (const u of users) {
  const jobs = monitoringJobs.filter((j) => j.userId === u.id)
  u.monitoringCount = jobs.length
  u.activeMonitoring = jobs.filter((j) => j.status === 'Running').length
}
for (const c of testCentres) {
  c.monitoringJobs = monitoringJobs.filter((j) => j.status === 'Running' && j.centreIds.includes(c.id)).length
}

export const monitoringById = (id) => monitoringJobs.find((j) => j.id === id)

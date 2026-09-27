import { createRandom, NOW, MINUTE, HOUR, DAY, pad } from '@/lib/mock'
import { users } from './users'
import { monitoringJobs } from './monitoring'
import { slots } from './slots'

const r = createRandom(7070)

const TEMPLATES = [
  { subject: 'Alerts arriving late on SMS', category: 'Alerts', priority: 'High', body: 'I got a text about a slot at Mitcham but by the time I opened the link it had gone. The email arrived before the SMS. Can you check what is going on?' },
  { subject: 'Can I add a second learner?', category: 'Account', priority: 'Low', body: 'My daughter is also learning. Is it possible to add her to my account without paying twice?' },
  { subject: 'Charged twice this month', category: 'Billing', priority: 'High', body: 'My bank statement shows two payments of £19.99 on the same day. Please refund one of them.' },
  { subject: 'Monitoring shows as failed', category: 'Monitoring', priority: 'Urgent', body: 'The dashboard says my monitoring has failed and I have not had any alerts for two days. My test deadline is soon.' },
  { subject: 'How do I change my preferred centres?', category: 'Monitoring', priority: 'Normal', body: 'I have moved house and want to switch from Hendon to Wood Green and Enfield. Where do I do this?' },
  { subject: 'Not receiving emails', category: 'Alerts', priority: 'Normal', body: 'I can see slots in the app history but I never get the emails. I have checked spam.' },
  { subject: 'Cancel my subscription', category: 'Billing', priority: 'Normal', body: 'I passed my test last week (thank you!). Please cancel my plan so I am not charged again.' },
  { subject: 'Slot times outside my window', category: 'Monitoring', priority: 'Normal', body: 'I set 9am to 3pm but I received an alert for a 7:57 slot. Is the filter working?' },
  { subject: 'Browser notifications stopped', category: 'Technical', priority: 'Low', body: 'Since updating Chrome I do not get push notifications any more.' },
  { subject: 'Learner reference not verified', category: 'Account', priority: 'High', body: 'It has said "pending verification" for four days. Is there something I need to do?' },
]
const REPLIES = [
  'Thanks for getting in touch — I have had a look at your account and can see what happened.',
  'I have escalated this to our monitoring team and will update you as soon as I hear back.',
  'Could you confirm the email address and approximate time you expected the alert?',
  'This should now be resolved. Please let us know if you see it again.',
]
const ADMIN_ASSIGNEES = ['adm_003', 'adm_006', 'adm_002', null]

export const supportTickets = Array.from({ length: 46 }, (_, i) => {
  const t = TEMPLATES[i % TEMPLATES.length]
  const u = r.pick(users.filter((x) => x.status !== 'Pending'))
  const job = monitoringJobs.find((j) => j.userId === u.id)
  const slot = slots.find((s) => s.userId === u.id)
  const createdMs = NOW - Math.floor(Math.pow(r.next(), 1.4) * 40 * DAY) - r.int(5, 300) * MINUTE
  const ageH = (NOW - createdMs) / HOUR
  const status = ageH < 6 ? r.weighted([['Open', 6], ['In Progress', 3]]) : ageH < 72 ? r.weighted([['Open', 2], ['In Progress', 4], ['Waiting', 3], ['Resolved', 2]]) : r.weighted([['Resolved', 5], ['Closed', 4], ['Waiting', 1]])
  const assigneeId = status === 'Open' && r.chance(0.5) ? null : r.pick(ADMIN_ASSIGNEES.filter(Boolean))
  const messages = [{ id: `msg_${i}_0`, from: 'user', authorName: u.name, body: t.body, createdAt: new Date(createdMs).toISOString() }]
  let cursor = createdMs
  const turns = status === 'Open' ? 0 : r.int(1, 3)
  for (let k = 0; k < turns; k++) {
    cursor += r.int(20, 600) * MINUTE
    if (cursor > NOW) break
    const fromAdmin = k % 2 === 0
    messages.push({
      id: `msg_${i}_${k + 1}`,
      from: fromAdmin ? 'admin' : 'user',
      authorName: fromAdmin ? (assigneeId === 'adm_006' ? 'Callum Reid' : assigneeId === 'adm_002' ? 'Rhys Morgan' : 'Priya Nair') : u.name,
      body: fromAdmin ? REPLIES[(i + k) % REPLIES.length] : 'Thanks, that makes sense. I will keep an eye on it.',
      createdAt: new Date(cursor).toISOString(),
    })
  }
  return {
    id: `TCK-${pad(4100 + i, 5)}`,
    userId: u.id,
    subject: t.subject,
    category: t.category,
    priority: i < 3 ? 'Urgent' : t.priority,
    status,
    assigneeId,
    monitoringId: ['Monitoring', 'Alerts'].includes(t.category) ? job?.id ?? null : null,
    slotId: t.category === 'Alerts' ? slot?.id ?? null : null,
    messages,
    internalNotes: i % 5 === 0 ? [{ id: `in_${i}`, author: 'Rhys Morgan', body: 'Checked worker logs — upstream timeouts between 08:00 and 08:20 on that day.', createdAt: new Date(createdMs + 2 * HOUR).toISOString() }] : [],
    createdAt: new Date(createdMs).toISOString(),
    updatedAt: messages[messages.length - 1].createdAt,
  }
}).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

export const ticketById = (id) => supportTickets.find((t) => t.id === id)

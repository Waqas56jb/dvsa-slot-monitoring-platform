import { createRandom, ago, MINUTE, HOUR, DAY, pad } from '@/lib/mock'

const r = createRandom(42)

const FIRST = ['Oliver', 'Amelia', 'Harry', 'Isla', 'Jack', 'Ava', 'George', 'Mia', 'Noah', 'Ivy', 'Leo', 'Freya', 'Arthur', 'Lily', 'Muhammad', 'Sophia', 'Oscar', 'Grace', 'Charlie', 'Evie', 'Theo', 'Rosie', 'Alfie', 'Poppy', 'Henry', 'Ella', 'Archie', 'Willow', 'Joshua', 'Daisy', 'Aarav', 'Zara', 'Ethan', 'Hannah', 'Kai', 'Chloe', 'Rahul', 'Aisha', 'Samuel', 'Niamh', 'Luca', 'Maya', 'Finn', 'Imogen', 'Reuben', 'Anaya', 'Callum', 'Esme', 'Tariq', 'Keira', 'Ben', 'Nadia', 'Dylan', 'Sienna', 'Yusuf', 'Holly']
const LAST = ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Patel', 'Robinson', 'Wright', 'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green', 'Hall', 'Wood', 'Jackson', 'Clarke', 'Khan', 'Hughes', 'Edwards', 'Lewis', 'Harris', 'Martin', 'Cooper', 'Ahmed', 'Kaur', 'Ward', 'Turner', 'Collins', 'Begum', 'Murphy', 'Bennett', 'Shaw', 'Chaudhry', 'Okoro', 'Kowalski', 'Nowak', 'Singh', "O'Brien", 'Fraser', 'Campbell', 'Price', 'Lloyd', 'Mensah']
const DOMAINS = ['gmail.com', 'outlook.com', 'icloud.com', 'yahoo.co.uk', 'hotmail.co.uk', 'btinternet.com', 'proton.me']
const CITIES = ['London', 'London', 'London', 'London', 'Croydon', 'Harrow', 'Ilford', 'Reading', 'Brighton', 'Birmingham', 'Manchester', 'Leeds', 'Bristol', 'Cambridge', 'Glasgow', 'Cardiff']
const SOURCES = ['Organic search', 'Referral', 'Instructor partner', 'Social', 'Direct']

const USER_COUNT = 184

export const users = Array.from({ length: USER_COUNT }, (_, i) => {
  const first = r.pick(FIRST)
  const last = r.pick(LAST)
  const name = `${first} ${last}`
  const handle = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '')
  const createdDaysAgo = Math.round(Math.pow(r.next(), 1.6) * 360) + 1
  const status = r.weighted([['Active', 82], ['Pending', 7], ['Suspended', 6], ['Disabled', 5]])
  const lastActiveMs = status === 'Active' ? r.int(1, 60 * 24 * 6) * MINUTE : r.int(4, 90) * DAY
  return {
    id: `usr_${pad(1000 + i, 5)}`,
    name,
    email: `${handle}${r.chance(0.4) ? r.int(1, 99) : ''}@${r.pick(DOMAINS)}`,
    phone: `+44 7${r.int(100, 999)} ${r.int(100, 999)} ${r.int(100, 999)}`,
    city: r.pick(CITIES),
    status,
    emailVerified: status !== 'Pending',
    source: r.pick(SOURCES),
    learnersCount: 0, // derived below by learners.js
    monitoringCount: 0,
    activeMonitoring: 0,
    slotsDetected: 0,
    alertsSent: 0,
    plan: null, // derived by subscriptions.js
    lastActive: ago(lastActiveMs),
    createdAt: ago(createdDaysAgo * DAY + r.int(0, 23) * HOUR),
    notes: [],
  }
}).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

// A couple of hand-written notes to make the Notes tab feel lived-in.
users[0].notes = [
  { id: 'note_1', author: 'Priya Nair', body: 'Asked about adding a second learner (sibling). Explained Standard plan limits.', createdAt: ago(2 * DAY) },
]
users[3].notes = [
  { id: 'note_2', author: 'Rhys Morgan', body: 'Monitoring paused at user request while on holiday until next month.', createdAt: ago(6 * DAY) },
  { id: 'note_3', author: 'Amelia Hart', body: 'Goodwill: extended subscription by 7 days after alert delay incident.', createdAt: ago(19 * DAY) },
]

export const userById = (id) => users.find((u) => u.id === id)

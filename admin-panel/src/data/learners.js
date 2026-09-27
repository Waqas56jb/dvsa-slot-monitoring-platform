import { createRandom, ago, DAY, HOUR, pad } from '@/lib/mock'
import { users } from './users'
import { testCentres } from './testCentres'

const r = createRandom(77)

const FIRST = ['Oliver', 'Amelia', 'Harry', 'Isla', 'Jack', 'Ava', 'George', 'Mia', 'Noah', 'Ivy', 'Leo', 'Freya', 'Aarav', 'Zara', 'Ethan', 'Hannah', 'Kai', 'Chloe', 'Rahul', 'Aisha', 'Samuel', 'Niamh', 'Luca', 'Maya', 'Finn', 'Imogen', 'Tariq', 'Keira', 'Ben', 'Nadia']
const LETTERS = 'ABCDEFGHJKLMNPRSTUVWXYZ'
const letter = () => LETTERS[r.int(0, LETTERS.length - 1)]

// Mock licence-style identifier. Never displayed unmasked in the admin UI.
const licenceRef = (last) => `${last.replace(/[^A-Z]/gi, '').toUpperCase().padEnd(5, '9').slice(0, 5)}${r.int(100000, 999999)}${letter()}${letter()}${r.int(1, 9)}${letter()}${letter()}`

export const learners = []
let n = 0
for (const u of users) {
  if (u.status === 'Pending' && r.chance(0.7)) continue
  const count = r.weighted([[1, 70], [2, 22], [3, 8]])
  const last = u.name.split(' ').slice(-1)[0]
  for (let k = 0; k < count; k++) {
    const isSelf = k === 0 && r.chance(0.55)
    const first = isSelf ? u.name.split(' ')[0] : r.pick(FIRST)
    const london = u.city === 'London' || r.chance(0.3)
    const pool = testCentres.filter((c) => (london ? c.region === 'London' : c.region !== 'London') && c.status === 'Active')
    const created = Math.min((Date.now() - new Date(u.createdAt)) / DAY, r.int(1, 300))
    n++
    learners.push({
      id: `lrn_${pad(2000 + n, 5)}`,
      userId: u.id,
      name: `${first} ${last}`,
      relationship: isSelf ? 'Self' : r.pick(['Child', 'Partner', 'Sibling', 'Student']),
      licenceRef: licenceRef(last),
      referenceStatus: r.weighted([['Verified', 72], ['Pending verification', 18], ['Unverified', 10]]),
      testType: r.weighted([['Car (manual)', 70], ['Car (automatic)', 28], ['Motorcycle', 2]]),
      preferredCentres: r.sample(pool.length ? pool : testCentres, r.int(1, 4)).map((c) => c.id),
      earliestDate: null, // filled from monitoring
      latestDate: null,
      status: u.status === 'Active' ? r.weighted([['Active', 88], ['Inactive', 12]]) : 'Inactive',
      monitoringCount: 0,
      slotsFound: 0,
      createdAt: ago(Math.max(1, Math.floor(created)) * DAY + r.int(0, 20) * HOUR),
    })
  }
}

for (const u of users) u.learnersCount = learners.filter((l) => l.userId === u.id).length

export const learnerById = (id) => learners.find((l) => l.id === id)

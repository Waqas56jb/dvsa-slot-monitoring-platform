/**
 * Mock-mode joins. The real API is expected to return these same embedded
 * summaries (e.g. `user: { id, name, email }`) so table rows render without
 * extra round-trips.
 */
import { userById } from '@/data/users'
import { learnerById } from '@/data/learners'
import { centreById } from '@/data/testCentres'
import { adminById } from '@/data/admins'
import { maskValue } from '@/utils/format'

export const userSummary = (id) => { const u = userById(id); return u ? { id: u.id, name: u.name, email: u.email, status: u.status } : null }
export const learnerSummary = (id) => {
  const l = learnerById(id)
  return l ? { id: l.id, name: l.name, relationship: l.relationship, referenceStatus: l.referenceStatus, licenceMasked: maskValue(l.licenceRef, 3) } : null
}
export const centreSummary = (id) => { const c = centreById(id); return c ? { id: c.id, name: c.name, shortName: c.shortName, city: c.city, code: c.code } : null }
export const adminSummary = (id) => { const a = adminById(id); return a ? { id: a.id, name: a.name, email: a.email, role: a.role } : null }

/** Remove raw sensitive fields before a learner leaves the service layer. */
export function sanitizeLearner(l) {
  const { licenceRef, ...rest } = l
  return { ...rest, licenceMasked: maskValue(licenceRef, 3) }
}

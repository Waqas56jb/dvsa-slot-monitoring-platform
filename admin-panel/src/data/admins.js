import { ROLES } from '@/constants/permissions'
import { ago, MINUTE, HOUR, DAY } from '@/lib/mock'

// Demo accounts. In mock mode any of these emails can sign in with password "SlotPilot!2026".
export const admins = [
  {
    id: 'adm_001', name: 'Amelia Hart', email: 'amelia.hart@slotpilot.io', role: ROLES.SUPER_ADMIN, status: 'Active',
    phone: '+44 7700 900112', lastLogin: ago(4 * MINUTE), createdAt: ago(410 * DAY), twoFactor: true, title: 'Head of Operations',
  },
  {
    id: 'adm_002', name: 'Rhys Morgan', email: 'rhys.morgan@slotpilot.io', role: ROLES.OPERATIONS_ADMIN, status: 'Active',
    phone: '+44 7700 900241', lastLogin: ago(38 * MINUTE), createdAt: ago(302 * DAY), twoFactor: true, title: 'Operations Lead',
  },
  {
    id: 'adm_003', name: 'Priya Nair', email: 'priya.nair@slotpilot.io', role: ROLES.SUPPORT_ADMIN, status: 'Active',
    phone: '+44 7700 900387', lastLogin: ago(2 * HOUR), createdAt: ago(240 * DAY), twoFactor: true, title: 'Customer Support',
  },
  {
    id: 'adm_004', name: 'Tom Whitaker', email: 'tom.whitaker@slotpilot.io', role: ROLES.ANALYST, status: 'Active',
    phone: '+44 7700 900455', lastLogin: ago(26 * HOUR), createdAt: ago(180 * DAY), twoFactor: false, title: 'Data Analyst',
  },
  {
    id: 'adm_005', name: 'Grace Okafor', email: 'grace.okafor@slotpilot.io', role: ROLES.OPERATIONS_ADMIN, status: 'Active',
    phone: '+44 7700 900518', lastLogin: ago(5 * HOUR), createdAt: ago(150 * DAY), twoFactor: true, title: 'Monitoring Engineer',
  },
  {
    id: 'adm_006', name: 'Callum Reid', email: 'callum.reid@slotpilot.io', role: ROLES.SUPPORT_ADMIN, status: 'Active',
    phone: '+44 7700 900634', lastLogin: ago(3 * DAY), createdAt: ago(96 * DAY), twoFactor: true, title: 'Customer Support',
  },
  {
    id: 'adm_007', name: 'Sofia Rossi', email: 'sofia.rossi@slotpilot.io', role: ROLES.ANALYST, status: 'Invited',
    phone: '', lastLogin: null, createdAt: ago(2 * DAY), twoFactor: false, title: 'Growth Analyst',
  },
  {
    id: 'adm_008', name: 'Daniel Price', email: 'daniel.price@slotpilot.io', role: ROLES.SUPPORT_ADMIN, status: 'Suspended',
    phone: '+44 7700 900799', lastLogin: ago(41 * DAY), createdAt: ago(260 * DAY), twoFactor: false, title: 'Former Support Contractor',
  },
]

export const adminById = (id) => admins.find((a) => a.id === id)
export const MOCK_ADMIN_PASSWORD = 'SlotPilot!2026'

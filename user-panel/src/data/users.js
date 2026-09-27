/**
 * Demo accounts. Passwords are never stored in plain text — the mock auth
 * service hashes them on first run. Real authentication will be handled by
 * Supabase via the Node.js backend.
 */
export const DEMO_USER_ID = 'usr_demo';

export const buildSeedUsers = (now) => [
  {
    id: DEMO_USER_ID,
    firstName: 'Ahmed',
    lastName: 'Malik',
    email: 'ahmed@slotpilot.demo',
    phone: '07700 900123',
    businessName: 'Malik Driving School',
    role: 'Lead Instructor',
    usageType: 'school',
    avatarUrl: '',
    plan: 'professional',
    onboardingComplete: true,
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 94).toISOString(),
  },
];

export const defaultPreferences = {
  notifications: {
    dashboard: true,
    browser: true,
    sound: true,
    email: false,
    digest: 'daily',
  },
  monitoring: {
    interval: '60',
    autoStart: true,
    preferredCentreIds: ['ctr_hammersmith', 'ctr_southall', 'ctr_isleworth'],
  },
  appearance: {
    theme: 'light',
  },
};

export const buildSeedSessions = () => [
  {
    id: 'ses_current',
    device: 'Chrome on Windows',
    location: 'London, UK',
    current: true,
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'ses_mobile',
    device: 'Safari on iPhone',
    location: 'London, UK',
    current: false,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

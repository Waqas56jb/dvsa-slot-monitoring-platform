/**
 * Public, non-sensitive application configuration.
 * Only values that are safe to ship to the browser belong here.
 * Secrets and privileged keys must live on the Node.js backend.
 */
export const APP_NAME = 'SlotPilot';
export const APP_TAGLINE = 'Find the right driving test slot before it disappears.';
export const SUPPORT_EMAIL = 'support@slotpilot.example';

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

/** When no API is configured the service layer uses local mock data. */
export const USE_MOCK_API = !env.apiBaseUrl;

/**
 * Official GOV.UK booking pages. SlotPilot never automates these flows —
 * the user always completes booking and confirmation themselves.
 */
export const OFFICIAL_BOOKING_URLS = {
  book: 'https://www.gov.uk/book-driving-test',
  change: 'https://www.gov.uk/change-driving-test',
};

/** Demo account shown on the login screen. */
export const DEMO_CREDENTIALS = {
  email: 'ahmed@slotpilot.demo',
  password: 'Demo1234!',
};

/** Frontend-only monitoring simulation timings (ms). */
export const SIMULATION = {
  tickMs: 3200,
  firstMatchAfterTicks: 6,
  matchEveryTicks: [14, 22],
};

export const MONITORING_INTERVALS = [
  { value: '30', label: 'Every 30 seconds' },
  { value: '60', label: 'Every minute' },
  { value: '120', label: 'Every 2 minutes' },
  { value: '300', label: 'Every 5 minutes' },
];

export const TIME_WINDOWS = [
  { value: 'early', label: 'Early morning', range: '07:00 – 09:00', start: '07:00', end: '09:00' },
  { value: 'morning', label: 'Morning', range: '09:00 – 12:00', start: '09:00', end: '12:00' },
  { value: 'afternoon', label: 'Afternoon', range: '12:00 – 16:00', start: '12:00', end: '16:00' },
  { value: 'late', label: 'Late afternoon', range: '16:00 – 18:00', start: '16:00', end: '18:00' },
];

export const USAGE_TYPES = [
  { value: 'instructor', label: 'Driving Instructor', description: 'I teach learners and manage their test bookings.' },
  { value: 'school', label: 'Driving School', description: 'We run a team of instructors and many learners.' },
  { value: 'learner', label: 'Learner', description: 'I am looking for my own driving test slot.' },
  { value: 'manager', label: 'Test-slot manager', description: 'I coordinate test availability for others.' },
  { value: 'other', label: 'Other', description: 'Something else — we will keep things flexible.' },
];

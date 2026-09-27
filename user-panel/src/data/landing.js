/**
 * Landing page content. Everything marketing-facing lives here so copy,
 * imagery and numbers can change without touching components.
 * Numbers and testimonials are demo content — replace before launch.
 */

export const heroWords = ['sooner.', 'closer to home.', 'at the right time.'];

/** Centres cycled through by the hero's live detection loop (sample data). */
export const heroDetections = [
  { centre: 'Wood Green', date: 'Tue 14 Oct', time: '08:14', learner: 'Amelia R.' },
  { centre: 'Mill Hill', date: 'Fri 17 Oct', time: '10:42', learner: 'Daniel K.' },
  { centre: 'Hither Green', date: 'Mon 20 Oct', time: '13:47', learner: 'Sophie T.' },
  { centre: 'Isleworth', date: 'Wed 22 Oct', time: '09:28', learner: 'Omar B.' },
  { centre: 'Morden', date: 'Thu 23 Oct', time: '15:01', learner: 'Chloe W.' },
  { centre: 'Wanstead', date: 'Sat 25 Oct', time: '08:51', learner: 'James L.' },
];

export const heroStats = [
  { value: '60s', label: 'Check interval' },
  { value: '<2s', label: 'Match to alert' },
  { value: '24/7', label: 'Monitoring' },
];

export const trustCities = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Bristol', 'Glasgow', 'Edinburgh', 'Cardiff', 'Liverpool', 'Nottingham', 'Sheffield', 'Brighton', 'Reading', 'Cambridge', 'Newcastle', 'Oxford'];

export const audiences = [
  {
    key: 'learners',
    eyebrow: 'For learners',
    title: 'Stop refreshing. Start driving.',
    body: 'Pick the centres you can get to and the times that suit you. We keep watch, you get on with your life.',
    image: 'fiatStreet',
    points: ['Up to 12 centres', 'Morning or evening windows'],
  },
  {
    key: 'instructors',
    eyebrow: 'For instructors',
    title: 'A full diary of learners, one calm dashboard.',
    body: 'Every pupil gets their own preferences, status and slot history — no spreadsheets, no missed openings.',
    image: 'cockpitMotion',
    points: ['Per-learner preferences', 'Shared alert feed'],
  },
  {
    key: 'schools',
    eyebrow: 'For driving schools',
    title: 'Coordinate your whole team.',
    body: 'Give instructors their own seats, see coverage across branches and act on availability together.',
    image: 'schoolOffice',
    points: ['Team seats', 'Branch-level analytics'],
  },
];

/** Scroll-driven workflow. `screen` picks the phone UI shown for each step. */
export const workflowSteps = [
  {
    key: 'learner',
    step: '01',
    title: 'Add your learners',
    body: 'Create a profile for yourself or every pupil you teach. Licence details stay encrypted and masked — only you see them.',
    screen: 'learners',
  },
  {
    key: 'prefs',
    step: '02',
    title: 'Set the slot you actually want',
    body: 'Choose test centres, a date range and a time window. Exclude weekends, set a deadline — preferences are yours to tune.',
    screen: 'preferences',
  },
  {
    key: 'monitor',
    step: '03',
    title: 'We monitor around the clock',
    body: 'SlotPilot checks your centres continuously and compares every opening against your preferences. No tabs to leave open.',
    screen: 'monitoring',
  },
  {
    key: 'alert',
    step: '04',
    title: 'Get alerted. Book on GOV.UK.',
    body: 'The moment a match appears you get an instant alert with a direct link. You confirm the booking yourself on the official service.',
    screen: 'alert',
  },
];

export const coverageCities = [
  { city: 'London', image: 'towerBridgeDusk', centres: 18, wait: '14–24 wks', note: 'Wood Green · Mill Hill · Morden' },
  { city: 'Edinburgh', image: 'edinburgh', centres: 3, wait: '9–15 wks', note: 'Musselburgh · Currie' },
  { city: 'Westminster', image: 'westminsterBridge', centres: 6, wait: '16–22 wks', note: 'Central London routes' },
  { city: 'South East', image: 'greenHills', centres: 24, wait: '8–16 wks', note: 'Reading · Guildford · Brighton' },
  { city: 'Greater London', image: 'shardSkyline', centres: 12, wait: '12–20 wks', note: 'Hither Green · Sidcup · Barking' },
  { city: 'Midlands', image: 'forestRoad', centres: 21, wait: '7–14 wks', note: 'Birmingham · Nottingham' },
];

export const bigStats = [
  { value: 284, suffix: '', label: 'UK test centres covered' },
  { value: 1.9, suffix: 's', decimals: 1, label: 'Median match-to-alert time' },
  { value: 43, suffix: 'k', label: 'Slots matched last month' },
  { value: 4.9, suffix: '/5', decimals: 1, label: 'Average customer rating' },
];

export const testimonials = [
  { name: 'Amelia R.', role: 'Learner, North London', image: 'portraitAmelia', quote: 'I’d been refreshing for weeks. SlotPilot pinged me at 7am on a Tuesday and I had a Wood Green test booked before breakfast.' },
  { name: 'Mark H.', role: 'ADI, 14 years teaching', image: 'portraitMark', quote: 'Managing slots for twelve pupils used to eat my evenings. Now I just check the dashboard between lessons.' },
  { name: 'Priya S.', role: 'Learner, Reading', image: 'portraitPriya', quote: 'The time-window filter is the best bit — I only hear about slots I can actually make around work.' },
  { name: 'Daniel K.', role: 'Instructor, Croydon', image: 'portraitDaniel', quote: 'Alerts are genuinely fast. And it never touches the booking, which is exactly how I want it.' },
  { name: 'Helen M.', role: 'Owner, Horizon Driving School', image: 'portraitHelen', quote: 'We moved our whole team over in a day. Branch analytics show us exactly where demand is.' },
  { name: 'James L.', role: 'Learner, Leeds', image: 'portraitJames', quote: 'Clean, calm, no nonsense. It did one job perfectly and I passed first time.' },
  { name: 'Chloe W.', role: 'Learner, Brighton', image: 'portraitChloe', quote: 'Set it up on my phone in five minutes. Got my alert on the bus home.' },
  { name: 'Omar B.', role: 'ADI, Birmingham', image: 'portraitOmar', quote: 'The per-learner history makes conversations with parents so much easier.' },
  { name: 'Sophie T.', role: 'Learner, Manchester', image: 'portraitSophie', quote: 'I’d honestly given up on getting a test before uni. Two weeks later I had one.' },
];

export const galleryRows = [
  ['bigBenBus', 'fiatStreet', 'cockpitMotion', 'towerBridgeDusk', 'handsOnWheel', 'edinburgh', 'roadLightTrails'],
  ['interchange', 'shardSkyline', 'driverWithNavigation', 'greenHills', 'beetle', 'parliament', 'motorbike'],
];

export const helpCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Set up your account, add your first learner and start monitoring.',
    icon: 'Rocket',
    articles: [
      { id: 'gs-1', title: 'Create your account and complete onboarding', body: 'After registering, the onboarding wizard walks you through adding a learner, picking centres, setting dates and times and choosing how you want to be alerted. You can change everything later.' },
      { id: 'gs-2', title: 'Tour of the dashboard', body: 'The dashboard shows live monitoring status, your most recent matching slot, headline stats and a timeline of recent activity. Use the sidebar to jump to learners, slots and settings.' },
      { id: 'gs-3', title: 'Your first monitoring session', body: 'Go to Monitoring → New monitoring. Pick learners, centres, a date range and a time window, review, then start. Status turns to Active straight away.' },
    ],
  },
  {
    id: 'learners',
    title: 'Learner Management',
    description: 'Add, edit and organise learners and their test preferences.',
    icon: 'Users',
    articles: [
      { id: 'lm-1', title: 'Add a learner', body: 'Open Learners → Add Learner. Fill in contact details, preferred dates, a time window and one or more centres. Turn on monitoring if you want to start straight away.' },
      { id: 'lm-2', title: 'Edit preferences for a learner', body: 'Open a learner and choose Edit Learner. Changes to centres, dates or times apply to the next monitoring check.' },
      { id: 'lm-3', title: 'Remove a learner', body: 'Use the actions menu on the Learners page or the learner details page. Removing a learner also stops any monitoring for them.' },
    ],
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    description: 'How checks run, and how to start, pause and stop them.',
    icon: 'Radar',
    articles: [
      { id: 'mo-1', title: 'Start, pause and stop', body: 'Pausing keeps your sessions and preferences so you can resume instantly. Stopping ends the sessions until you start them again.' },
      { id: 'mo-2', title: 'Monitoring intervals', body: 'The interval controls how often availability is checked. You can set a default in Settings → Monitoring.' },
      { id: 'mo-3', title: 'Why a slot might disappear', body: 'Availability changes quickly. If a slot is no longer listed when you open the official booking service, it will be marked as expired in SlotPilot.' },
    ],
  },
  {
    id: 'alerts',
    title: 'Alerts',
    description: 'Dashboard, browser and sound alerts — and how to tune them.',
    icon: 'BellRing',
    articles: [
      { id: 'al-1', title: 'Enable browser notifications', body: 'Go to Settings → Notifications and switch on browser notifications. Your browser will ask for permission the first time.' },
      { id: 'al-2', title: 'Sound alerts', body: 'Browsers only allow sound after you have interacted with the page, so click anywhere in SlotPilot once after opening it to make sure chimes can play.' },
      { id: 'al-3', title: 'Acting on a slot', body: 'Open the slot and choose Open Official Booking. You complete the booking on the official service yourself — SlotPilot never books on your behalf.' },
    ],
  },
  {
    id: 'account',
    title: 'Account & Security',
    description: 'Profile, password, sessions and how your data is handled.',
    icon: 'ShieldCheck',
    articles: [
      { id: 'ac-1', title: 'Change your password', body: 'Go to Settings → Security and choose Change password. You will need your current password.' },
      { id: 'ac-2', title: 'Manage active sessions', body: 'Settings → Security lists devices signed in to your account. Sign out any session you do not recognise.' },
      { id: 'ac-3', title: 'How learner data is handled', body: 'We store only what is required for monitoring. Sensitive reference details are handled by the secure backend and are never stored in your browser.' },
    ],
  },
];

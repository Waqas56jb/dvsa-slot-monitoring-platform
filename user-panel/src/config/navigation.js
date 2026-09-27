import {
  LayoutDashboard, Users, Radar, CalendarCheck2, Bell, History, UserRound, Settings, LifeBuoy,
} from 'lucide-react';
import { paths } from '@/routes/paths';

export const marketingNav = [
  { label: 'Home', to: paths.home },
  { label: 'Features', to: paths.features },
  { label: 'How It Works', to: paths.howItWorks },
  { label: 'Pricing', to: paths.pricing },
  { label: 'FAQ', to: paths.faq },
];

export const dashboardNav = [
  { label: 'Dashboard', to: paths.dashboard, icon: LayoutDashboard, end: true },
  { label: 'Learners', to: paths.learners, icon: Users },
  { label: 'Monitoring', to: paths.monitoring, icon: Radar },
  { label: 'Slots', to: paths.slots, icon: CalendarCheck2, badgeKey: 'newSlots' },
  { label: 'Notifications', to: paths.notifications, icon: Bell, badgeKey: 'unreadNotifications' },
  { label: 'History', to: paths.history, icon: History },
  { label: 'Profile', to: paths.profile, icon: UserRound },
  { label: 'Settings', to: paths.settings, icon: Settings },
  { label: 'Help', to: paths.help, icon: LifeBuoy },
];

/** Primary destinations shown in the mobile bottom bar. */
export const mobileNav = [
  { label: 'Home', to: paths.dashboard, icon: LayoutDashboard, end: true },
  { label: 'Learners', to: paths.learners, icon: Users },
  { label: 'Monitor', to: paths.monitoring, icon: Radar },
  { label: 'Slots', to: paths.slots, icon: CalendarCheck2, badgeKey: 'newSlots' },
];

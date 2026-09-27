/**
 * Service layer entry point. UI code imports from here and never talks to
 * storage, fetch or a database directly.
 */
export { authService } from './authService';
export { userService } from './userService';
export { learnerService } from './learnerService';
export { monitoringService } from './monitoringService';
export { slotService } from './slotService';
export { notificationService } from './notificationService';
export { activityService } from './activityService';
export { centreService, getCentreSync, getCentreName } from './centreService';
export { dashboardService } from './dashboardService';
export { subscribe } from './realtime';
export { LEARNER_STATUS, SLOT_STATUS, SESSION_STATUS } from './selectors';
export { activityTypes } from '@/data/activityLogs';

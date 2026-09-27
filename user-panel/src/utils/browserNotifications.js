/** Thin wrapper around the browser Notification API. */
export const browserNotificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export const browserNotificationPermission = () =>
  browserNotificationsSupported() ? Notification.permission : 'unsupported';

export async function requestBrowserNotificationPermission() {
  if (!browserNotificationsSupported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function showBrowserNotification(title, options = {}) {
  if (!browserNotificationsSupported() || Notification.permission !== 'granted') return null;
  try {
    return new Notification(title, { icon: '/favicon.svg', ...options });
  } catch {
    return null;
  }
}

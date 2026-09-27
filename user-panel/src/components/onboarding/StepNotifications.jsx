import { useState } from 'react';
import { BellRing, LayoutDashboard, Mail, MonitorSmartphone, Volume2 } from 'lucide-react';
import { Switch } from '@/components/ui';
import { browserNotificationPermission, requestBrowserNotificationPermission } from '@/utils/browserNotifications';
import { cn } from '@/utils/cn';
import { StepHeader } from './OnboardingShell';
import { ReviewSummary } from './ReviewSummary';

const permissionHints = {
  granted: { tone: 'text-success-ink', text: 'Browser notifications are allowed on this device.' },
  denied: { tone: 'text-warning-ink', text: 'Notifications are blocked in your browser settings. Allow them for this site, then turn this on again.' },
  default: { tone: 'text-muted', text: 'Permission was not granted. You can try again at any time.' },
  unsupported: { tone: 'text-warning-ink', text: "This browser doesn't support desktop notifications." },
};

export function StepNotifications({ form, onEditStep }) {
  const notifications = form.values.notifications;
  const [permission, setPermission] = useState(() => browserNotificationPermission());
  const [asked, setAsked] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const set = (key, value) => form.setValue('notifications', { ...form.values.notifications, [key]: value });

  const toggleBrowser = async (on) => {
    if (!on) return set('browser', false);
    setRequesting(true);
    const result = await requestBrowserNotificationPermission();
    setRequesting(false);
    setPermission(result);
    setAsked(true);
    set('browser', result === 'granted');
  };

  const hint = asked || notifications.browser ? permissionHints[permission] : null;

  const rows = [
    { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard alerts', description: 'Live match cards and a notification badge while you’re signed in.' },
    { key: 'browser', icon: MonitorSmartphone, label: 'Browser notifications', description: 'Desktop pop-ups even when SlotPilot is in a background tab.' },
    { key: 'sound', icon: Volume2, label: 'Sound alerts', description: 'A short chime when a matching slot appears.' },
    { key: 'email', icon: Mail, label: 'Email alerts', description: 'A summary email for each new match.' },
  ];

  return (
    <>
      <StepHeader icon={BellRing} step="Step 6" title="How should we alert you?" description="Slots can disappear within minutes, so we recommend at least two alert types." />

      <div className="divide-y divide-line rounded-3xl border border-line bg-surface shadow-soft">
        {rows.map((r) => (
          <div key={r.key} className="p-4 sm:p-5">
            <Switch
              id={`notify-${r.key}`}
              checked={Boolean(notifications[r.key])}
              onChange={r.key === 'browser' ? toggleBrowser : (v) => set(r.key, v)}
              disabled={r.key === 'browser' && requesting}
              label={r.label}
              description={r.description}
              icon={r.icon}
            />
            {r.key === 'browser' && hint && (
              <p className={cn('mt-2 pl-12 text-[13px]', hint.tone)} role="status">
                {requesting ? 'Waiting for your browser…' : hint.text}
              </p>
            )}
          </div>
        ))}
      </div>

      <ReviewSummary values={form.values} onEditStep={onEditStep} />
    </>
  );
}

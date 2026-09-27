import { useState } from 'react';
import { BellRing, Monitor, Volume2, Mail, LayoutDashboard, Play } from 'lucide-react';
import { Alert, Badge, Button, Card, CardHeader, Switch } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { userService } from '@/services';
import { browserNotificationPermission, requestBrowserNotificationPermission, showBrowserNotification } from '@/utils/browserNotifications';
import { playAlertChime } from '@/utils/sound';

const PERMISSION = {
  granted: { tone: 'success', label: 'Allowed' },
  denied: { tone: 'danger', label: 'Blocked' },
  default: { tone: 'warning', label: 'Not asked yet' },
  unsupported: { tone: 'neutral', label: 'Not supported' },
};

export function SettingsNotifications({ prefs, onSaved }) {
  const toast = useToast();
  const [values, setValues] = useState(prefs);
  const [pending, setPending] = useState(null);
  const [permission, setPermission] = useState(browserNotificationPermission);

  const save = async (key, next, message) => {
    const prev = values[key];
    setValues((v) => ({ ...v, [key]: next }));
    setPending(key);
    try {
      const saved = await userService.updatePreferences('notifications', { [key]: next });
      onSaved?.(saved);
      toast.success(message || 'Notification settings saved');
    } catch (err) {
      setValues((v) => ({ ...v, [key]: prev }));
      toast.error('Could not save setting', { description: err.message });
    } finally {
      setPending(null);
    }
  };

  const toggleBrowser = async (on) => {
    if (!on) return save('browser', false, 'Browser notifications turned off');
    let p = browserNotificationPermission();
    if (p === 'default') {
      p = await requestBrowserNotificationPermission();
      setPermission(p);
    }
    if (p === 'unsupported') return toast.warning('Browser notifications are not supported', { description: 'Try a recent version of Chrome, Edge, Firefox or Safari.' });
    if (p === 'denied') return toast.warning('Notifications are blocked', { description: 'Allow notifications for this site in your browser settings, then try again.' });
    await save('browser', true, 'Browser notifications turned on');
    showBrowserNotification('SlotPilot alerts are on', { body: 'You will be notified here when a matching slot is found.' });
    return undefined;
  };

  const testSound = () => {
    if (playAlertChime()) toast.info('Playing test sound');
    else toast.warning('Sound is not ready yet', { description: 'Your browser blocks audio until you interact with the page. Click anywhere, then try again.' });
  };

  const perm = PERMISSION[permission] || PERMISSION.default;

  return (
    <Card as="section" aria-labelledby="set-notify">
      <CardHeader icon={BellRing} title={<span id="set-notify">Notifications</span>} description="Choose how SlotPilot tells you about new slots. Changes save instantly." />
      <div className="divide-y divide-line">
        <div className="pb-5">
          <Switch
            icon={Monitor}
            checked={Boolean(values.browser) && permission !== 'denied'}
            onChange={toggleBrowser}
            disabled={pending === 'browser'}
            label="Browser notifications"
            description="Desktop pop-ups when a matching slot is found, even in another tab."
          />
          <div className="mt-3 flex flex-wrap items-center gap-2 pl-12 text-[13px] text-muted">
            Browser permission: <Badge tone={perm.tone} size="sm">{perm.label}</Badge>
          </div>
          {permission === 'denied' && (
            <Alert tone="warning" className="mt-3 sm:ml-12" title="Notifications are blocked by your browser">
              Open your browser's site settings for SlotPilot, allow notifications, then reload this page.
            </Alert>
          )}
        </div>
        <div className="py-5">
          <Switch
            icon={Volume2}
            checked={Boolean(values.sound)}
            onChange={(v) => save('sound', v, v ? 'Sound alerts turned on' : 'Sound alerts turned off')}
            disabled={pending === 'sound'}
            label="Sound alerts"
            description="Play a short chime in the dashboard when a slot is found."
          />
          <div className="mt-3 pl-12">
            <Button variant="secondary" size="sm" leftIcon={Play} onClick={testSound}>
              Play test sound
            </Button>
          </div>
        </div>
        <div className="py-5">
          <Switch
            icon={Mail}
            checked={Boolean(values.email)}
            onChange={(v) => save('email', v, v ? 'Email alerts turned on' : 'Email alerts turned off')}
            disabled={pending === 'email'}
            label="Email alerts"
            description="Email delivery starts once the SlotPilot backend is connected."
          />
        </div>
        <div className="pt-5">
          <Switch
            icon={LayoutDashboard}
            checked={Boolean(values.dashboard)}
            onChange={(v) => save('dashboard', v, v ? 'Dashboard alerts turned on' : 'Dashboard alerts turned off')}
            disabled={pending === 'dashboard'}
            label="Dashboard alerts"
            description="Show the slot alert card in the top-right corner of the dashboard."
          />
        </div>
      </div>
    </Card>
  );
}

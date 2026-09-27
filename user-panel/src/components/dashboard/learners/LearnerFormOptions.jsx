import { Radar, BellRing, Monitor, Volume2, Mail, NotebookPen } from 'lucide-react';
import { Card, CardHeader, Switch, Textarea, Badge } from '@/components/ui';

export function MonitoringSection({ form, isNew }) {
  const { values, setValue } = form;
  return (
    <Card as="section" aria-labelledby="sec-monitoring">
      <CardHeader
        icon={Radar}
        title={<span id="sec-monitoring">Monitoring</span>}
        action={values.monitoringEnabled ? <Badge tone="brand" dot pulse>On</Badge> : <Badge>Off</Badge>}
      />
      <Switch
        checked={values.monitoringEnabled}
        onChange={(v) => setValue('monitoringEnabled', v)}
        label="Enable monitoring"
        description={
          isNew
            ? 'Start checking for matching slots as soon as this learner is saved.'
            : 'Turn slot checks on or off for this learner.'
        }
      />
      <p className="mt-4 rounded-2xl bg-surface-muted/70 px-4 py-3 text-[13px] leading-relaxed text-muted">
        SlotPilot only alerts you to matching availability. You always complete the booking yourself on the official GOV.UK service.
      </p>
    </Card>
  );
}

const CHANNELS = [
  { key: 'browser', label: 'Browser alert', description: 'Desktop notification when a slot is found.', icon: Monitor },
  { key: 'sound', label: 'Sound alert', description: 'Play a short chime in the dashboard.', icon: Volume2 },
  { key: 'email', label: 'Email alert', description: 'Send a summary to your inbox.', icon: Mail },
];

export function NotificationsSection({ form }) {
  const { values, setValue } = form;
  const update = (key, v) => setValue('notifications', { ...values.notifications, [key]: v });
  return (
    <Card as="section" aria-labelledby="sec-notify">
      <CardHeader icon={BellRing} title={<span id="sec-notify">Notifications</span>} description="How you want to hear about slots for this learner." />
      <div className="space-y-5">
        {CHANNELS.map((c) => (
          <Switch
            key={c.key}
            id={`notify-${c.key}`}
            icon={c.icon}
            checked={Boolean(values.notifications[c.key])}
            onChange={(v) => update(c.key, v)}
            label={c.label}
            description={c.description}
          />
        ))}
      </div>
    </Card>
  );
}

export function NotesSection({ form }) {
  return (
    <Card as="section" aria-labelledby="sec-notes">
      <CardHeader icon={NotebookPen} title={<span id="sec-notes">Notes</span>} description="Private notes — only visible to you." />
      <Textarea {...form.field('notes')} label="Notes" optional rows={4} placeholder="e.g. Prefers morning tests, can travel up to 30 minutes." maxLength={500} />
    </Card>
  );
}

import { useState } from 'react';
import { Radar, Timer, Zap, Save } from 'lucide-react';
import { Badge, Button, Card, CardHeader, Select, Switch } from '@/components/ui';
import { CentrePicker } from '@/components/dashboard/CentrePicker';
import { useToast } from '@/context/ToastContext';
import { userService } from '@/services';
import { MONITORING_INTERVALS } from '@/config/app';

const pick = (p) => ({ interval: String(p.interval || '60'), autoStart: Boolean(p.autoStart), preferredCentreIds: p.preferredCentreIds || [] });

export function SettingsMonitoring({ prefs, onSaved }) {
  const toast = useToast();
  const [initial, setInitial] = useState(() => pick(prefs));
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const saved = await userService.updatePreferences('monitoring', values);
      const next = pick(saved.monitoring);
      setInitial(next);
      setValues(next);
      onSaved?.(saved);
      toast.success('Monitoring defaults saved', { description: 'They will be used for new monitoring sessions.' });
    } catch (err) {
      toast.error('Could not save monitoring defaults', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card as="section" aria-labelledby="set-mon">
      <CardHeader
        icon={Radar}
        title={<span id="set-mon">Monitoring defaults</span>}
        description="Starting values for new monitoring sessions. Existing sessions keep their own settings."
        action={<Badge tone="info" size="sm">Applies to new sessions</Badge>}
      />
      <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            id="default-interval"
            label="Default monitoring interval"
            icon={Timer}
            options={MONITORING_INTERVALS}
            value={values.interval}
            onChange={(e) => set('interval', e.target.value)}
            hint="Pre-selected when you create a new session."
          />
          <div className="rounded-2xl bg-surface-muted/70 p-4 sm:self-start">
            <Switch
              icon={Zap}
              checked={values.autoStart}
              onChange={(v) => set('autoStart', v)}
              label="Auto-start monitoring"
              description="Pre-tick “Start immediately” for new sessions."
            />
          </div>
        </div>
        <div className="border-t border-line pt-6">
          <CentrePicker
            id="preferred-centres"
            label="Preferred centres"
            value={values.preferredCentreIds}
            onChange={(ids) => set('preferredCentreIds', ids)}
            listHeight="max-h-64"
          />
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
          {dirty && (
            <Button variant="ghost" onClick={() => setValues(initial)} disabled={saving}>
              Discard
            </Button>
          )}
          <Button leftIcon={Save} onClick={save} loading={saving} disabled={!dirty}>
            Save monitoring defaults
          </Button>
        </div>
      </div>
    </Card>
  );
}

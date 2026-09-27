import { Bell, BellRing, Volume2, Mail, LayoutDashboard, Timer, Tag, Sun, Sunrise, Sunset, Clock, Play } from 'lucide-react';
import { DateRangePicker, TimePicker, Switch, Select, Input, Alert } from '@/components/ui';
import { CentrePicker } from '@/components/dashboard/CentrePicker';
import { TIME_WINDOWS, MONITORING_INTERVALS } from '@/config/app';
import { formatDateRange, toISODate, addDays } from '@/utils/format';
import { cn } from '@/utils/cn';

export function StepCentres({ value, onChange, error, suggestedCount }) {
  return (
    <div className="space-y-4">
      {suggestedCount > 0 && (
        <p className="text-sm text-muted">We’ve pre-selected the {suggestedCount} centre{suggestedCount === 1 ? '' : 's'} from your learners’ preferences. Add or remove any you like.</p>
      )}
      <CentrePicker id="centreIds" value={value} onChange={onChange} error={error} />
    </div>
  );
}

const QUICK_RANGES = [
  { label: 'Next 2 weeks', days: 14 },
  { label: 'Next 4 weeks', days: 28 },
  { label: 'Next 8 weeks', days: 56 },
];

export function StepDates({ values, setField, errors }) {
  const today = toISODate(new Date());
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Quick date ranges">
        {QUICK_RANGES.map((r) => {
          const to = toISODate(addDays(new Date(), r.days));
          const active = values.dateFrom === today && values.dateTo === to;
          return (
            <button
              key={r.label}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setField('dateFrom', today);
                setField('dateTo', to);
              }}
              className={cn('h-10 rounded-full px-4 text-sm font-medium transition-colors', active ? 'bg-ink text-surface' : 'bg-surface text-ink-soft ring-1 ring-line hover:text-ink hover:ring-line-strong')}
            >
              {r.label}
            </button>
          );
        })}
      </div>
      <DateRangePicker
        idPrefix="date"
        from={values.dateFrom}
        to={values.dateTo}
        onFromChange={(v) => setField('dateFrom', v)}
        onToChange={(v) => setField('dateTo', v)}
        fromError={errors.dateFrom}
        toError={errors.dateTo}
        fromLabel="Earliest test date"
        toLabel="Latest test date"
      />
      {values.dateFrom && values.dateTo && !errors.dateFrom && !errors.dateTo && (
        <p className="text-sm text-muted">
          Watching for slots between <span className="font-medium text-ink">{formatDateRange(values.dateFrom, values.dateTo)}</span>.
        </p>
      )}
    </div>
  );
}

const WINDOW_ICONS = { early: Sunrise, morning: Sun, afternoon: Sun, late: Sunset };

export function StepTimes({ values, setField, errors }) {
  const pick = (from, to) => {
    setField('timeFrom', from);
    setField('timeTo', to);
  };
  const options = [...TIME_WINDOWS, { value: 'any', label: 'Any time', range: '07:00 – 18:00', start: '07:00', end: '18:00' }];
  return (
    <div className="space-y-5">
      <div role="group" aria-label="Quick time windows" className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 lg:grid-cols-5">
        {options.map((w) => {
          const Icon = WINDOW_ICONS[w.value] || Clock;
          const active = values.timeFrom === w.start && values.timeTo === w.end;
          return (
            <button
              key={w.value}
              type="button"
              aria-pressed={active}
              onClick={() => pick(w.start, w.end)}
              className={cn(
                'flex min-h-14 items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all',
                active ? 'border-brand bg-brand-soft/60 ring-4 ring-brand/10' : 'border-line bg-surface hover:border-line-strong',
              )}
            >
              <Icon className={cn('size-4 shrink-0', active ? 'text-brand' : 'text-subtle')} aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{w.label}</span>
                <span className="block text-xs tabular-nums text-muted">{w.range}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TimePicker id="timeFrom" label="Earliest time" value={values.timeFrom} onChange={(e) => setField('timeFrom', e.target.value)} error={errors.timeFrom} required />
        <TimePicker id="timeTo" label="Latest time" value={values.timeTo} onChange={(e) => setField('timeTo', e.target.value)} error={errors.timeTo} required />
      </div>
    </div>
  );
}

const CHANNELS = [
  { key: 'dashboard', label: 'Dashboard alerts', description: 'Pop-up card in SlotPilot when a slot is found.', icon: LayoutDashboard },
  { key: 'browser', label: 'Browser notifications', description: 'System notification, even when this tab is in the background.', icon: BellRing },
  { key: 'sound', label: 'Sound alert', description: 'A short chime when a match arrives.', icon: Volume2 },
  { key: 'email', label: 'Email', description: 'Summary email for each match (once email is connected).', icon: Mail },
];

export function StepNotify({ values, setField, errors }) {
  const anyChannel = Object.values(values.notify).some(Boolean);
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
          <Bell className="size-4 text-subtle" aria-hidden="true" /> Notification channels
        </legend>
        <div className="divide-y divide-line rounded-2xl border border-line">
          {CHANNELS.map((c) => (
            <Switch
              key={c.key}
              id={`notify-${c.key}`}
              className="px-4 py-3.5"
              icon={c.icon}
              label={c.label}
              description={c.description}
              checked={Boolean(values.notify[c.key])}
              onChange={(v) => setField('notify', { ...values.notify, [c.key]: v })}
            />
          ))}
        </div>
      </fieldset>
      {!anyChannel && (
        <Alert tone="warning" title="All alerts are off">
          Matches will still appear on your Slots page, but you won’t be notified.
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select id="interval" label="Check interval" icon={Timer} options={MONITORING_INTERVALS} value={values.interval} onChange={(e) => setField('interval', e.target.value)} error={errors.interval} hint="How often the backend will check (simulated in this demo)." />
        <Input id="name" label="Session name" optional icon={Tag} value={values.name} onChange={(e) => setField('name', e.target.value)} error={errors.name} placeholder="e.g. West London — mornings" maxLength={80} hint="Leave blank and we’ll name it for you." />
      </div>
      <Switch
        id="start-now"
        className="rounded-2xl border border-line px-4 py-3.5"
        icon={Play}
        label="Start checking immediately"
        description="Turn off to save the session paused and start it later from Monitoring."
        checked={values.startNow}
        onChange={(v) => setField('startNow', v)}
      />
    </div>
  );
}

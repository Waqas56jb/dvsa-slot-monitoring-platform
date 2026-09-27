import { UserRound, CalendarRange, Mail, Phone } from 'lucide-react';
import { Card, CardHeader, Input, DatePicker, TimePicker, Switch } from '@/components/ui';
import { CentrePicker } from '@/components/dashboard/CentrePicker';
import { TIME_WINDOWS } from '@/config/app';
import { cn } from '@/utils/cn';

export function PersonalSection({ form }) {
  return (
    <Card as="section" aria-labelledby="sec-personal">
      <CardHeader icon={UserRound} title={<span id="sec-personal">Personal information</span>} description="Who this learner is and how to reach them." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input {...form.field('firstName')} label="First name" autoComplete="off" required />
        <Input {...form.field('lastName')} label="Last name" autoComplete="off" required />
        <Input {...form.field('email')} type="email" label="Email" icon={Mail} autoComplete="off" required />
        <Input {...form.field('phone')} type="tel" label="Phone" icon={Phone} optional hint="UK mobile or landline, e.g. 07700 900123" />
      </div>
    </Card>
  );
}

function TimeWindowPicks({ from, to, onPick }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink" id="time-window-label">
        Quick pick
      </p>
      <div role="group" aria-labelledby="time-window-label" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TIME_WINDOWS.map((w) => {
          const active = w.start === from && w.end === to;
          return (
            <button
              key={w.value}
              type="button"
              aria-pressed={active}
              onClick={() => onPick(w)}
              className={cn(
                'flex min-h-14 flex-col items-start justify-center rounded-2xl border px-3 py-2 text-left transition-colors',
                active ? 'border-brand bg-brand-soft/60 ring-4 ring-brand/10' : 'border-line bg-surface hover:border-line-strong hover:bg-surface-muted/60',
              )}
            >
              <span className="text-sm font-semibold text-ink">{w.label}</span>
              <span className="text-xs tabular-nums text-muted">{w.range}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PreferencesSection({ form, isNew }) {
  const { values, setValue } = form;
  const pickWindow = (w) => {
    setValue('timeFrom', w.start);
    setValue('timeTo', w.end);
  };
  return (
    <Card as="section" aria-labelledby="sec-prefs">
      <CardHeader icon={CalendarRange} title={<span id="sec-prefs">Driving-test preferences</span>} description="Only slots that match these preferences will trigger an alert." />
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <DatePicker {...form.field('preferredDate')} label="Preferred test date" disablePast={isNew} required />
          <DatePicker {...form.field('dateFrom')} label="Search from" disablePast={isNew} required />
          <DatePicker {...form.field('dateTo')} label="Search until" disablePast={isNew} min={values.dateFrom || undefined} required />
        </div>

        <div className="space-y-4 border-t border-line pt-6">
          <TimeWindowPicks from={values.timeFrom} to={values.timeTo} onPick={pickWindow} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TimePicker {...form.field('timeFrom')} label="Earliest time" required />
            <TimePicker {...form.field('timeTo')} label="Latest time" required />
          </div>
        </div>

        <div className="border-t border-line pt-6">
          <CentrePicker
            id="centreIds"
            label="Test centre(s)"
            value={values.centreIds}
            onChange={(ids) => setValue('centreIds', ids)}
            error={form.error('centreIds')}
            listHeight="max-h-72"
          />
        </div>

        <div className="rounded-2xl bg-surface-muted/70 p-4">
          <Switch
            checked={values.excludeWeekends}
            onChange={(v) => setValue('excludeWeekends', v)}
            label="Exclude weekends"
            description="Ignore Saturday and Sunday slots for this learner."
          />
        </div>
      </div>
    </Card>
  );
}

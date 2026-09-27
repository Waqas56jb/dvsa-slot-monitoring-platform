import { Clock3, CloudSun, Sun, Sunrise, Sunset } from 'lucide-react';
import { ChoiceCard, TimePicker } from '@/components/ui';
import { TIME_WINDOWS } from '@/config/app';
import { StepHeader } from './OnboardingShell';

const icons = { early: Sunrise, morning: Sun, afternoon: CloudSun, late: Sunset };

export function StepTime({ form }) {
  const { values, setValue, error } = form;
  const pick = (w) => form.setValues((v) => ({ ...v, timeFrom: w.start, timeTo: w.end }));

  return (
    <>
      <StepHeader icon={Clock3} step="Step 5" title="What time of day works best?" description="Pick a common window or set exact times. Slots outside this window won't trigger alerts." />

      <div role="radiogroup" aria-label="Time windows" className="grid gap-3 sm:grid-cols-2">
        {TIME_WINDOWS.map((w) => (
          <ChoiceCard
            key={w.value}
            selected={values.timeFrom === w.start && values.timeTo === w.end}
            onSelect={() => pick(w)}
            title={w.label}
            description={w.range}
            icon={icons[w.value] || Clock3}
          />
        ))}
      </div>

      <div className="mt-7">
        <p className="mb-3 text-sm font-medium text-ink">Or set a custom window</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TimePicker id="timeFrom" label="From" value={values.timeFrom} onChange={(e) => setValue('timeFrom', e.target.value)} error={error('timeFrom')} required />
          <TimePicker id="timeTo" label="To" value={values.timeTo} onChange={(e) => setValue('timeTo', e.target.value)} error={error('timeTo')} required />
        </div>
      </div>
    </>
  );
}

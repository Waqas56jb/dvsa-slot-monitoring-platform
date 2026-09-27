import { CalendarRange } from 'lucide-react';
import { DateRangePicker } from '@/components/ui';
import { addDays, formatDateRange, toISODate } from '@/utils/format';
import { cn } from '@/utils/cn';
import { StepHeader } from './OnboardingShell';

const presets = [
  { label: 'Next 2 weeks', days: 14 },
  { label: 'Next month', days: 30 },
  { label: 'Next 3 months', days: 90 },
];

export function StepDates({ form }) {
  const { values, setValue, error } = form;
  const today = toISODate(new Date());

  const applyPreset = (days) => {
    form.setValues((v) => ({ ...v, dateFrom: today, dateTo: toISODate(addDays(new Date(), days)) }));
  };

  return (
    <>
      <StepHeader icon={CalendarRange} step="Step 4" title="When could the test take place?" description="We'll only alert you about slots inside this date range." />

      <div role="group" aria-label="Quick date ranges" className="mb-6 flex flex-wrap gap-2">
        {presets.map((p) => {
          const active = values.dateFrom === today && values.dateTo === toISODate(addDays(new Date(), p.days));
          return (
            <button
              key={p.label}
              type="button"
              aria-pressed={active}
              onClick={() => applyPreset(p.days)}
              className={cn(
                'h-11 rounded-full border px-4 text-sm font-medium transition-colors',
                active ? 'border-brand bg-brand-soft text-brand-ink' : 'border-line-strong bg-surface text-ink-soft hover:bg-surface-muted hover:text-ink',
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <DateRangePicker
        idPrefix="dates"
        from={values.dateFrom}
        to={values.dateTo}
        onFromChange={(v) => setValue('dateFrom', v)}
        onToChange={(v) => setValue('dateTo', v)}
        fromError={error('dateFrom')}
        toError={error('dateTo')}
        fromLabel="Earliest date"
        toLabel="Latest date"
      />

      {values.dateFrom && values.dateTo && !error('dateFrom') && !error('dateTo') && values.dateTo >= values.dateFrom && (
        <p className="mt-5 rounded-xl bg-surface-muted px-4 py-3 text-sm text-muted">
          Watching for slots between <span className="font-semibold text-ink">{formatDateRange(values.dateFrom, values.dateTo)}</span>.
        </p>
      )}
    </>
  );
}

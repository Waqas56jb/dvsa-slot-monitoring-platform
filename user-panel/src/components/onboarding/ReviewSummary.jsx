import { getCentreName } from '@/services';
import { USAGE_TYPES } from '@/config/app';
import { formatDateRange, formatTimeString } from '@/utils/format';

const alertLabels = { dashboard: 'Dashboard', browser: 'Browser', sound: 'Sound', email: 'Email' };

/** Read-only recap of every wizard answer with "Edit" shortcuts. */
export function ReviewSummary({ values, onEditStep }) {
  const usage = USAGE_TYPES.find((t) => t.value === values.usageType)?.label || '—';
  const centres = values.centreIds.map(getCentreName);
  const alerts = Object.entries(values.notifications)
    .filter(([, on]) => on)
    .map(([k]) => alertLabels[k]);

  const rows = [
    { step: 0, label: 'Using SlotPilot as', value: values.businessName ? `${usage} · ${values.businessName}` : usage },
    { step: 1, label: 'First learner', value: [values.learnerName.trim(), values.learnerEmail].filter(Boolean).join(' · ') },
    { step: 2, label: 'Test centres', value: centres.length ? centres.join(', ') : '—' },
    { step: 3, label: 'Dates', value: values.dateFrom && values.dateTo ? formatDateRange(values.dateFrom, values.dateTo) : '—' },
    { step: 4, label: 'Time', value: values.timeFrom && values.timeTo ? `${formatTimeString(values.timeFrom)} – ${formatTimeString(values.timeTo)}` : '—' },
    { step: 5, label: 'Alerts', value: alerts.length ? alerts.join(', ') : 'None selected' },
  ];

  return (
    <section aria-labelledby="review-title" className="mt-8">
      <h2 id="review-title" className="text-base font-semibold text-ink">
        Review
      </h2>
      <p className="mt-1 text-sm text-muted">Check everything looks right before we start monitoring.</p>
      <dl className="mt-4 divide-y divide-line rounded-3xl border border-line bg-surface-muted/50">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
            <div className="min-w-0 flex-1 sm:flex sm:gap-4">
              <dt className="text-[13px] font-medium text-muted sm:w-40 sm:shrink-0">{r.label}</dt>
              <dd className="mt-0.5 break-words text-sm font-medium text-ink sm:mt-0">{r.value || '—'}</dd>
            </div>
            {r.step < 5 && (
              <button
                type="button"
                onClick={() => onEditStep(r.step)}
                className="-my-2 flex h-11 shrink-0 items-center rounded-lg px-2 text-sm font-medium text-brand hover:bg-brand-soft"
                aria-label={`Edit ${r.label.toLowerCase()}`}
              >
                Edit
              </button>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}

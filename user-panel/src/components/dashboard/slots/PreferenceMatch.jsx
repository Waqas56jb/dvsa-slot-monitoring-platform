import { motion } from 'framer-motion';
import { Check, X, Target } from 'lucide-react';
import { Card } from '@/components/ui';
import { learnerService, monitoringService, getCentreSync } from '@/services';
import { useResource } from '@/hooks';
import { formatDateRange, formatTimeString } from '@/utils/format';
import { cn } from '@/utils/cn';

async function loadCriteria(slot) {
  const [learner, session] = await Promise.all([
    slot.learner ? learnerService.get(slot.learner.id).catch(() => null) : null,
    slot.session ? monitoringService.getSession(slot.session.id).catch(() => null) : null,
  ]);
  const c = session?.criteria || {};
  return {
    centreIds: c.centreIds?.length ? c.centreIds : learner?.centreIds || [],
    dateFrom: c.dateFrom || learner?.dateFrom,
    dateTo: c.dateTo || learner?.dateTo,
    timeFrom: c.timeFrom || learner?.timeFrom,
    timeTo: c.timeTo || learner?.timeTo,
  };
}

function MatchCheck({ ok, label, detail }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <span className={cn('mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full', ok ? 'bg-success-soft text-success-ink' : 'bg-surface-sunken text-subtle')}>
        {ok ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : <X className="size-3.5" strokeWidth={3} aria-hidden="true" />}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">
          {label} <span className="sr-only">{ok ? 'matched' : 'not matched'}</span>
        </p>
        {detail && <p className="mt-0.5 text-xs text-muted">{detail}</p>}
      </div>
    </li>
  );
}

/** Centre / date / time checks and an overall match meter. */
export function PreferenceMatch({ slot }) {
  const { data: criteria, loading } = useResource(() => loadCriteria(slot), [slot.id]);
  const score = Math.max(0, Math.min(100, slot.matchScore || 0));
  const centreNames = (criteria?.centreIds || []).map((id) => getCentreSync(id)?.name).filter(Boolean);
  const pref = (text) => (loading ? 'Loading preference…' : text);

  return (
    <Card as="section" aria-labelledby="pref-match-title">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-surface-muted text-ink-soft ring-1 ring-line">
          <Target className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="pref-match-title" className="text-base font-semibold text-ink">
            Preference match
          </h2>
          <p className="text-sm text-muted">How this slot lines up with the saved preferences.</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-ink-soft">Match score</span>
          <span className="font-display text-2xl font-bold tabular-nums text-ink">{score}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-sunken" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score} aria-label="Match score">
          <motion.div
            className={cn('h-full rounded-full', score >= 80 ? 'bg-success' : score >= 60 ? 'bg-warning' : 'bg-subtle')}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <ul className="mt-4 divide-y divide-line">
        <MatchCheck
          ok={slot.matched?.centre}
          label="Test centre"
          detail={pref(centreNames.length ? `Preferred: ${centreNames.slice(0, 3).join(', ')}${centreNames.length > 3 ? ` +${centreNames.length - 3}` : ''}` : 'Any preferred centre')}
        />
        <MatchCheck ok={slot.matched?.date} label="Date range" detail={pref(`Preferred: ${formatDateRange(criteria?.dateFrom, criteria?.dateTo)}`)} />
        <MatchCheck
          ok={slot.matched?.time}
          label="Time window"
          detail={pref(criteria?.timeFrom && criteria?.timeTo ? `Preferred: ${formatTimeString(criteria.timeFrom)} – ${formatTimeString(criteria.timeTo)}` : 'Any time')}
        />
      </ul>
    </Card>
  );
}

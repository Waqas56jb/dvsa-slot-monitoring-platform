import { motion } from 'framer-motion';
import { Users, MapPin, Clock3, Sparkles } from 'lucide-react';
import { AnimatedNumber, toneClasses } from '@/components/ui';
import { useNow } from '@/hooks';
import { formatRelative, formatClock } from '@/utils/format';
import { monitoringScope } from './monitoringUtils';
import { cn } from '@/utils/cn';

function Tile({ label, icon: Icon, tone, children, sub, delay }) {
  const t = toneClasses[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="min-w-0 rounded-3xl border border-line bg-surface p-4 shadow-soft sm:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-muted">{label}</p>
        <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-xl', t.soft)}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-2.5 truncate font-display text-2xl font-bold tracking-tight text-ink sm:text-[28px]">{children}</div>
      {sub && <p className="mt-0.5 truncate text-xs text-muted">{sub}</p>}
    </motion.div>
  );
}

/** Four live summary tiles for the monitoring control centre. */
export function MonitoringSummary({ overview }) {
  const now = useNow(1000);
  const scope = monitoringScope(overview);
  const last = overview?.lastScanAt;
  return (
    <section aria-label="Monitoring summary" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <Tile label="Learners monitored" icon={Users} tone="brand" delay={0} sub={`${scope.sessionCount} session${scope.sessionCount === 1 ? '' : 's'} in scope`}>
        <AnimatedNumber value={scope.learners} />
      </Tile>
      <Tile label="Centres monitored" icon={MapPin} tone="info" delay={0.05} sub="Across all sessions">
        <AnimatedNumber value={scope.centres.length} />
      </Tile>
      <Tile label="Last scan" icon={Clock3} tone="neutral" delay={0.1} sub={last ? `at ${formatClock(last)}` : 'No checks yet'}>
        <span className="text-xl sm:text-2xl" aria-live="off">
          {last ? formatRelative(last, now) : '—'}
        </span>
      </Tile>
      <Tile label="Matches today" icon={Sparkles} tone="success" delay={0.15} sub={`${(overview?.checksTotal || 0).toLocaleString('en-GB')} checks in total`}>
        <AnimatedNumber value={overview?.matchesToday || 0} />
      </Tile>
    </section>
  );
}

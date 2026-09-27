import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useCountUp } from '@/hooks';
import { toneClasses } from './Badge';

export function AnimatedNumber({ value, className }) {
  const [ref, display] = useCountUp(value ?? 0);
  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {display}
    </span>
  );
}

/**
 * Metric tile: label, animated value, icon and optional footnote/trend.
 */
export function StatCard({ label, value, icon: Icon, tone = 'brand', footnote, delay = 0, className, loading }) {
  const t = toneClasses[tone] || toneClasses.brand;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn('rounded-3xl border border-line bg-surface p-5 shadow-soft', className)}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        {Icon && (
          <span className={cn('flex size-9 items-center justify-center rounded-xl', t.soft)}>
            <Icon className="size-[18px]" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-[34px]">
        {loading ? <span className="skeleton inline-block h-9 w-16 rounded-lg align-middle" /> : <AnimatedNumber value={value} />}
      </p>
      {footnote && <p className="mt-1.5 text-[13px] text-muted">{footnote}</p>}
    </motion.div>
  );
}

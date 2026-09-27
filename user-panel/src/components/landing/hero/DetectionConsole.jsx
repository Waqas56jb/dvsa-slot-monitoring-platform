import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, CalendarCheck2, ExternalLink, Radar, ScanSearch, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';

const STAGES = [
  { key: 'scan', label: 'Scanning', icon: Radar },
  { key: 'detect', label: 'Detected', icon: ScanSearch },
  { key: 'match', label: 'Matched', icon: SlidersHorizontal },
  { key: 'alert', label: 'Alert sent', icon: BellRing },
];

/** Which pipeline stages are complete for a timeline phase. */
const reached = (phase) => ({ scan: 1, detect: 2, alert: 4 })[phase] ?? 1;

/**
 * Glass "mission control" panel synced to the 3D scene:
 * pipeline stepper + the latest alert card.
 */
export function DetectionConsole({ detection, phase, className }) {
  const done = reached(phase);
  return (
    <div className={cn('w-full max-w-[400px] rounded-3xl border border-white/10 bg-white/[0.06] p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl', className)}>
      <div className="flex items-center justify-between px-2 pb-2.5 pt-1">
        <p className="flex items-center gap-2 text-[12px] font-medium text-white/70">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          Live monitoring
        </p>
        <p className="font-mono text-[11px] text-white/45">6 centres · every 60s</p>
      </div>

      {/* Pipeline */}
      <ol className="grid grid-cols-4 gap-1.5 rounded-2xl bg-black/25 p-1.5">
        {STAGES.map((s, i) => {
          const on = i < done;
          const current = i === done - 1;
          const Icon = s.icon;
          return (
            <li key={s.key} className={cn('relative flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-center transition-colors duration-500', current ? 'bg-white/10' : '')}>
              <Icon className={cn('size-4 transition-colors duration-500', on ? (s.key === 'alert' ? 'text-emerald-300' : 'text-[#a9b9ff]') : 'text-white/25')} aria-hidden="true" />
              <span className={cn('text-[10.5px] font-medium leading-none transition-colors duration-500', on ? 'text-white/90' : 'text-white/35')}>{s.label}</span>
              {current && <motion.span layoutId="console-dot" className="absolute -bottom-0.5 h-0.5 w-6 rounded-full bg-[#7d98ff]" />}
            </li>
          );
        })}
      </ol>

      {/* Latest alert */}
      <div className="relative mt-2.5 h-[118px]">
        <AnimatePresence mode="popLayout">
          {phase === 'alert' ? (
            <motion.div
              key={`${detection.centre}-alert`}
              initial={{ opacity: 0, y: 18, scale: 0.96, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="absolute inset-0 rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-400/15 to-emerald-400/[0.03] p-4"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300">
                  <CalendarCheck2 className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-300">Slot matched</p>
                  <p className="mt-0.5 truncate text-[15px] font-semibold text-white">{detection.centre}</p>
                  <p className="text-[13px] text-white/60">{detection.date} · {detection.time} · for {detection.learner}</p>
                </div>
                <span className="font-mono text-[11px] text-white/40">now</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[12px]">
                <span className="text-white/50">Alert delivered in 1.4s</span>
                <span className="inline-flex items-center gap-1 font-medium text-white/85">Book on GOV.UK <ExternalLink className="size-3" aria-hidden="true" /></span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`${detection.centre}-scan`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col justify-center gap-2.5 rounded-2xl border border-dashed border-white/10 px-4"
            >
              <p className="text-[13px] text-white/60">
                {phase === 'detect' ? <>New availability at <span className="font-semibold text-white">{detection.centre}</span> — checking preferences…</> : <>Scanning preferred centres…</>}
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  key={phase}
                  className={cn('h-full rounded-full', phase === 'detect' ? 'bg-emerald-400' : 'bg-[#7d98ff]')}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: phase === 'detect' ? 0.9 : 1.8, ease: 'linear' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

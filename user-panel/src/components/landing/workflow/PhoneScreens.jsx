import { motion } from 'framer-motion';
import { BellRing, CalendarDays, Check, Clock3, ExternalLink, MapPin, Plus, Radar } from 'lucide-react';
import { img } from '@/data/images';
import { cn } from '@/utils/cn';

const item = (i) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.12 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
});

function ScreenHeader({ title, sub }) {
  return (
    <div className="px-4 pb-3 pt-2">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#8ea2d9]">{sub}</p>
      <p className="font-display text-[19px] font-bold tracking-tight text-white">{title}</p>
    </div>
  );
}

function LearnersScreen() {
  const rows = [
    { name: 'Amelia Roberts', image: 'portraitAmelia', status: 'Monitoring', tone: 'bg-emerald-400/15 text-emerald-300' },
    { name: 'Daniel Khan', image: 'portraitDaniel', status: 'Slot found', tone: 'bg-[#5b7cff]/20 text-[#a9b9ff]' },
    { name: 'Sophie Turner', image: 'portraitSophie', status: 'Paused', tone: 'bg-amber-400/15 text-amber-300' },
    { name: 'James Lee', image: 'portraitJames', status: 'Monitoring', tone: 'bg-emerald-400/15 text-emerald-300' },
  ];
  return (
    <>
      <ScreenHeader sub="Your learners" title="4 active learners" />
      <ul className="space-y-2 px-3">
        {rows.map((r, i) => (
          <motion.li key={r.name} {...item(i)} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-2.5 ring-1 ring-white/5">
            <img src={img(r.image, 96, 70)} alt="" className="size-9 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">{r.name}</p>
              <p className="text-[11px] text-white/45">Car · 2 centres</p>
            </div>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', r.tone)}>{r.status}</span>
          </motion.li>
        ))}
      </ul>
      <motion.div {...item(5)} className="mx-3 mt-3 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-3 text-[12px] font-semibold text-[#a9b9ff]">
        <Plus className="size-3.5" aria-hidden="true" /> Add learner
      </motion.div>
    </>
  );
}

function PreferencesScreen() {
  const centres = ['Wood Green', 'Mill Hill', 'Hendon', 'Enfield'];
  return (
    <>
      <ScreenHeader sub="Amelia · preferences" title="What are you after?" />
      <div className="space-y-3 px-3">
        <motion.div {...item(0)} className="rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-white/60"><MapPin className="size-3" aria-hidden="true" />Test centres</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {centres.map((c, i) => (
              <motion.span key={c} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 400, damping: 20 }}
                className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold', i < 3 ? 'bg-[#5b7cff] text-white' : 'bg-white/10 text-white/60')}>
                {i < 3 && <Check className="mr-1 inline size-3" aria-hidden="true" />}{c}
              </motion.span>
            ))}
          </div>
        </motion.div>
        <motion.div {...item(1)} className="rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-white/60"><CalendarDays className="size-3" aria-hidden="true" />Date range</p>
          <p className="mt-1.5 text-[14px] font-semibold text-white">6 Oct → 30 Nov</p>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {Array.from({ length: 14 }, (_, i) => (
              <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.03 }}
                className={cn('h-4 rounded', i > 1 && i < 12 ? 'bg-[#5b7cff]/70' : 'bg-white/10', (i === 5 || i === 6 || i === 12 || i === 13) && 'opacity-40')} />
            ))}
          </div>
        </motion.div>
        <motion.div {...item(2)} className="rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-white/60"><Clock3 className="size-3" aria-hidden="true" />Time window</p>
          <p className="mt-1.5 text-[14px] font-semibold text-white">08:00 – 13:00</p>
          <div className="relative mt-2.5 h-1.5 rounded-full bg-white/10">
            <motion.div initial={{ left: '0%', right: '100%' }} animate={{ left: '14%', right: '42%' }} transition={{ delay: 0.6, duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-y-0 rounded-full bg-gradient-to-r from-[#5b7cff] to-[#34d399]" />
          </div>
        </motion.div>
      </div>
    </>
  );
}

function MonitoringScreen() {
  const logs = [
    ['12:04:31', 'Wood Green', 'No match'],
    ['12:04:33', 'Mill Hill', 'No match'],
    ['12:05:31', 'Hendon', 'No match'],
    ['12:05:34', 'Wood Green', 'New slot'],
  ];
  return (
    <>
      <ScreenHeader sub="Live monitoring" title="Watching 3 centres" />
      <div className="relative mx-auto mt-1 size-40">
        {[1, 0.72, 0.44].map((s) => <span key={s} className="absolute inset-0 m-auto rounded-full border border-[#5b7cff]/25" style={{ width: `${s * 100}%`, height: `${s * 100}%` }} />)}
        <motion.span className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(91,124,255,0.55) 50deg, transparent 52deg)' }} animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
        {[[22, 30], [68, 24], [58, 70]].map(([x, y], i) => (
          <span key={i} className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
            <span className={cn('absolute inset-0 animate-ping rounded-full', i === 0 ? 'bg-emerald-400' : 'bg-[#7d98ff]')} />
            <span className={cn('absolute inset-0 rounded-full', i === 0 ? 'bg-emerald-400' : 'bg-[#7d98ff]')} />
          </span>
        ))}
        <Radar className="absolute inset-0 m-auto size-5 text-white/80" aria-hidden="true" />
      </div>
      <ul className="mt-4 space-y-1.5 px-3 font-mono text-[10.5px]">
        {logs.map(([t, c, r], i) => (
          <motion.li key={t} {...item(i + 1)} className="flex items-center justify-between rounded-lg bg-white/[0.05] px-2.5 py-1.5">
            <span className="text-white/40">{t}</span>
            <span className="text-white/75">{c}</span>
            <span className={r === 'New slot' ? 'font-semibold text-emerald-300' : 'text-white/40'}>{r}</span>
          </motion.li>
        ))}
      </ul>
    </>
  );
}

function AlertScreen() {
  return (
    <div className="relative h-full">
      <div className="absolute inset-0 overflow-hidden">
        <img src={img('towerBridgeDusk', 600, 70)} alt="" className="size-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b14]/30 via-[#070b14]/40 to-[#070b14]" />
      </div>
      <div className="relative px-3 pt-4">
        <p className="text-center font-display text-[44px] font-bold leading-none tracking-tight text-white">08:14</p>
        <p className="mt-1 text-center text-[11px] text-white/70">Tuesday 7 October</p>
        <motion.div
          initial={{ y: -80, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.25 }}
          className="mt-6 rounded-[20px] bg-white/85 p-3 text-night shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-night/50">
            <span className="flex size-4 items-center justify-center rounded-md bg-[#3b5bfd] text-white"><BellRing className="size-2.5" aria-hidden="true" /></span>
            SlotPilot · now
          </div>
          <p className="mt-1.5 text-[13px] font-bold">Slot found for Amelia 🎉</p>
          <p className="text-[12px] leading-snug text-night/70">Wood Green · Tue 14 Oct at 08:14 — matches all preferences.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.5 }} className="mt-3 rounded-[20px] bg-white/10 p-3 ring-1 ring-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-[12px] text-white/80">
            <span>Wood Green DTC</span>
            <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">Matched</span>
          </div>
          <div className="mt-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-[12px] font-bold text-night">
            Book on GOV.UK <ExternalLink className="size-3" aria-hidden="true" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export const SCREENS = { learners: LearnersScreen, preferences: PreferencesScreen, monitoring: MonitoringScreen, alert: AlertScreen };

/** iPhone-style frame. `size` controls scale. */
export function PhoneFrame({ children, className }) {
  return (
    <div className={cn('relative aspect-[9/19] w-[290px] rounded-[3rem] bg-gradient-to-b from-[#2a3348] to-[#11172a] p-[10px] shadow-[0_50px_100px_-30px_rgba(7,11,20,0.7),inset_0_0_0_1px_rgba(255,255,255,0.08)]', className)}>
      <div className="relative size-full overflow-hidden rounded-[2.4rem] bg-[#0a0f1c]">
        <div className="absolute left-1/2 top-2.5 z-20 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
        <div className="flex items-center justify-between px-7 pt-3.5 text-[11px] font-semibold text-white" aria-hidden="true">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-4 rounded-sm border border-white/80" />
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 top-10">{children}</div>
        <div className="absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/40" aria-hidden="true" />
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Hourglass, RefreshCw, Timer, Users } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { cn } from '@/utils/cn';
import { Section, SectionHeading } from './SectionHeading';
import { Stagger, StaggerItem } from './Reveal';

/* --- Mini vignettes (decorative) --- */

function RefreshVignette() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3" aria-hidden="true">
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <motion.span animate={{ rotate: 360 }} transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }} className="text-muted">
          <RefreshCw className="size-3.5" />
        </motion.span>
        <span className="h-2 flex-1 rounded-full bg-surface-sunken" />
        <span className="text-[10px] font-semibold tabular-nums text-danger-ink">Refresh #47</span>
      </div>
      {['No tests available', 'No tests available', 'No tests available'].map((t, i) => (
        <div key={i} className="mt-2 flex items-center justify-between text-[11px]">
          <span className="h-2 w-16 rounded-full bg-surface-sunken" />
          <span className="text-subtle">{t}</span>
        </div>
      ))}
    </div>
  );
}

function CancellationVignette() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3" aria-hidden="true">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-ink">Cancellation · Tue 14 Oct</span>
        <span className="text-subtle">09:10</span>
      </div>
      <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-surface-sunken">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-success to-warning"
          initial={{ width: '100%' }}
          whileInView={{ width: '12%' }}
          viewport={{ once: true }}
          transition={{ duration: 2.4, ease: 'easeInOut', delay: 0.4 }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px]">
        <span className="text-success-ink">Appeared 09:10</span>
        <span className="font-semibold text-danger-ink">Gone by 09:13</span>
      </div>
    </div>
  );
}

function LearnersVignette() {
  const people = [
    ['Ahmed Khan', 'Hendon'],
    ['Sara Ali', 'Sutton'],
    ['James Wilson', 'Barking'],
  ];
  return (
    <div className="space-y-1.5 rounded-2xl border border-line bg-surface p-3" aria-hidden="true">
      {people.map(([n, c], i) => (
        <div key={n} className="flex items-center gap-2 text-[11px]">
          <Avatar name={n} size="xs" />
          <span className="truncate font-medium text-ink">{n}</span>
          <span className="ml-auto truncate text-subtle">{c}</span>
          <span className={cn('size-1.5 shrink-0 rounded-full', i === 1 ? 'bg-warning' : 'bg-line-strong')} />
        </div>
      ))}
    </div>
  );
}

const problems = [
  {
    icon: RefreshCw,
    title: 'Manual searching',
    text: "Constantly checking availability wastes time and still doesn't guarantee you'll catch a suitable slot.",
    vignette: RefreshVignette,
  },
  {
    icon: Timer,
    title: 'Fast-moving availability',
    text: 'Suitable cancellations can appear and disappear quickly.',
    vignette: CancellationVignette,
  },
  {
    icon: Users,
    title: 'Multiple learners',
    text: 'Managing several learners manually makes the process even harder.',
    vignette: LearnersVignette,
  },
];

export function ProblemSection() {
  return (
    <Section id="problem">
      <div className="container-page">
        <SectionHeading
          eyebrow="The problem"
          title="Stop Refreshing. Start Monitoring."
          description="Finding a suitable test slot usually means checking the same pages again and again, hoping to be looking at the right moment. It is slow, easy to miss and hard to keep up with when you are teaching all day."
        />
        <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
          {problems.map(({ icon: Icon, title, text, vignette: Vignette }) => (
            <StaggerItem
              key={title}
              className="group flex flex-col rounded-3xl border border-line bg-surface p-6 shadow-soft transition-shadow duration-300 hover:shadow-card"
            >
              <div className="rounded-2xl bg-surface-muted p-4">
                <Vignette />
              </div>
              <span className="mt-6 flex size-10 items-center justify-center rounded-xl border border-line bg-surface text-ink shadow-soft">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{text}</p>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="mx-auto mt-10 flex max-w-xl items-center justify-center gap-2 text-center text-sm text-muted">
          <Hourglass className="size-4 shrink-0 text-brand" aria-hidden="true" />
          SlotPilot does the watching, so you only step in when there is something worth acting on.
        </p>
      </div>
    </Section>
  );
}

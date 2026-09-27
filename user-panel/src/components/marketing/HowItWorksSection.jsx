import { BellRing, Check, MapPin, Play, SlidersHorizontal, UserPlus } from 'lucide-react';
import { Avatar, MonitoringPulse } from '@/components/ui';
import { Section, SectionHeading } from './SectionHeading';
import { Stagger, StaggerItem } from './Reveal';

function LearnerVisual() {
  return (
    <div className="space-y-2" aria-hidden="true">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-2">
        <Avatar name="Sara Ali" size="xs" />
        <span className="text-[12px] font-medium text-ink">Sara Ali</span>
        <Check className="ml-auto size-3.5 text-success" />
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-2 text-[11px] text-subtle">
        Car · Practical test
      </div>
    </div>
  );
}

function PreferencesVisual() {
  return (
    <div className="space-y-2" aria-hidden="true">
      <div className="flex flex-wrap gap-1.5">
        {['Hendon', 'Sutton', 'Barking'].map((c, i) => (
          <span
            key={c}
            className={
              i < 2
                ? 'inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-1 text-[11px] font-semibold text-brand-ink'
                : 'inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-1 text-[11px] text-muted'
            }
          >
            <MapPin className="size-3" /> {c}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        <span className="rounded-lg border border-line bg-surface px-2 py-1.5 text-ink-soft">1 – 31 Oct</span>
        <span className="rounded-lg border border-line bg-surface px-2 py-1.5 text-ink-soft">09:00 – 12:00</span>
      </div>
    </div>
  );
}

function StartVisual() {
  return (
    <div className="space-y-2" aria-hidden="true">
      <div className="flex items-center justify-between rounded-lg border border-line bg-surface px-2.5 py-2">
        <span className="text-[12px] font-medium text-ink">Monitoring</span>
        <span className="relative h-5 w-9 rounded-full bg-success">
          <span className="absolute right-0.5 top-0.5 size-4 rounded-full bg-white shadow" />
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-success/25 bg-success-soft px-2.5 py-2 text-[11px] font-semibold text-success-ink">
        <MonitoringPulse size="sm" /> Monitoring Active
      </div>
    </div>
  );
}

function AlertVisual() {
  return (
    <div className="rounded-lg border border-brand/30 bg-surface p-2.5 shadow-soft" aria-hidden="true">
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-brand text-white">
          <BellRing className="size-3.5" />
        </span>
        <span className="text-[12px] font-semibold text-ink">Slot Found</span>
        <span className="ml-auto text-[10px] text-subtle">now</span>
      </div>
      <p className="mt-1.5 text-[11px] text-muted">Sutton · 18 Oct · 10:24</p>
    </div>
  );
}

const steps = [
  {
    n: '01',
    icon: UserPlus,
    title: 'Add your learner',
    text: 'Create a profile for each learner with the details needed to organise their monitoring.',
    visual: LearnerVisual,
  },
  {
    n: '02',
    icon: SlidersHorizontal,
    title: 'Choose test centres & preferences',
    text: 'Pick the centres that suit them, an acceptable date range and a preferred time window.',
    visual: PreferencesVisual,
  },
  {
    n: '03',
    icon: Play,
    title: 'Start monitoring',
    text: 'Turn monitoring on. SlotPilot checks availability at a regular interval in the background.',
    visual: StartVisual,
  },
  {
    n: '04',
    icon: BellRing,
    title: 'Get alerted when a match appears',
    text: 'When availability matches your preferences you are alerted instantly — then you complete the booking yourself.',
    visual: AlertVisual,
  },
];

export function HowItWorksSection({ tone = 'surface', id = 'how-it-works', eyebrow = 'How it works', title = 'Four steps to smarter slot monitoring.' }) {
  return (
    <Section id={id} tone={tone}>
      <div className="container-page">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description="Set things up once. SlotPilot keeps watching so you can get on with teaching."
        />
        <div className="relative mt-14">
          {/* Connecting route line (desktop) */}
          <div
            className="absolute left-[12%] right-[12%] top-[26px] hidden border-t-2 border-dashed border-line-strong lg:block"
            aria-hidden="true"
          />
          <Stagger as="ol" className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ n, icon: Icon, title: stepTitle, text, visual: Visual }) => (
              <StaggerItem as="li" key={n} className="flex flex-col">
                <div className="flex items-center gap-3 lg:flex-col lg:items-center">
                  <span className="relative flex size-[52px] items-center justify-center rounded-2xl border border-line bg-surface text-brand shadow-card">
                    <Icon className="size-5" aria-hidden="true" />
                    <span className="absolute -right-2 -top-2 rounded-full bg-night px-1.5 py-0.5 font-display text-[10px] font-bold text-white dark:bg-brand">
                      {n}
                    </span>
                  </span>
                </div>
                <div className="mt-5 flex flex-1 flex-col rounded-3xl border border-line bg-canvas p-5">
                  <p className="font-display text-xs font-bold tracking-widest text-brand">STEP {n}</p>
                  <h3 className="mt-1.5 text-lg font-semibold leading-snug text-ink">{stepTitle}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{text}</p>
                  <div className="mt-5 rounded-2xl bg-surface-muted p-3">
                    <Visual />
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </Section>
  );
}

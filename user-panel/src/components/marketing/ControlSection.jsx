import { Activity, ExternalLink, Hand, Lock, ShieldCheck } from 'lucide-react';
import { SmartImage } from '@/components/ui';
import { RoutePattern } from './RoutePattern';
import { Reveal, Stagger, StaggerItem } from './Reveal';
import { Section, SectionHeading } from './SectionHeading';

const points = [
  { icon: Lock, title: 'Secure data', text: 'Sensitive learner details are handled by our secure backend and are never stored in your browser.' },
  { icon: Hand, title: 'User control', text: 'You decide what to book. SlotPilot never books, confirms or changes a test on your behalf.' },
  { icon: ShieldCheck, title: 'Privacy first', text: 'We only collect what monitoring needs, and you can edit or delete learner information at any time.' },
  { icon: Activity, title: 'Activity monitoring', text: 'A clear activity log shows every check, match and action, so you always know what happened.' },
];

export function ControlSection() {
  return (
    <Section id="control" tone="night">
      <RoutePattern onDark className="opacity-70" />
      <div className="container-page relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <SectionHeading
            align="left"
            onDark
            eyebrow="Security & control"
            title="You stay in control."
            description="SlotPilot helps you monitor availability and respond quickly. The final booking and confirmation remain under the user's control."
          />
          <Stagger as="ul" className="mt-10 grid gap-4 sm:grid-cols-2">
            {points.map(({ icon: Icon, title, text }) => (
              <StaggerItem as="li" key={title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-[#a9b9ff]">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/65">{text}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <p className="mt-8 text-xs leading-relaxed text-white/50">
            SlotPilot is an independent tool. It is not affiliated with, endorsed by or connected to the DVSA or GOV.UK, and it does not bypass
            any security, CAPTCHA or sign-in step.
          </p>
        </div>

        <Reveal delay={0.1} className="relative">
          <SmartImage
            image="londonBus"
            sizes="(min-width: 1024px) 40vw, 100vw"
            width={1200}
            className="aspect-[4/5] w-full rounded-3xl ring-1 ring-white/10 sm:aspect-[4/3] lg:aspect-[4/5]"
            overlay={<div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" aria-hidden="true" />}
          />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-night/80 p-4 backdrop-blur sm:inset-x-6 sm:bottom-6 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">How booking works</p>
            <ol className="mt-3 space-y-2.5 text-sm text-white/85">
              {['SlotPilot alerts you to a matching slot', 'You open the official booking service', 'You complete and confirm the booking yourself'].map(
                (s, i) => (
                  <li key={s} className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10 font-display text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    {s}
                    {i === 1 && <ExternalLink className="size-3.5 shrink-0 text-white/40" aria-hidden="true" />}
                  </li>
                ),
              )}
            </ol>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

import { ArrowRight, BellRing, Hand, Radar, ShieldCheck } from 'lucide-react';
import { Button, SmartImage } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';
import { paths } from '@/routes/paths';
import { PageIntro } from '@/components/marketing/PageIntro';
import { Reveal, Stagger, StaggerItem } from '@/components/marketing/Reveal';
import { Section, SectionHeading } from '@/components/marketing/SectionHeading';
import { FinalCta } from '@/components/marketing/FinalCta';

const principles = [
  { icon: Radar, title: 'Monitoring, done properly', text: 'Reliable checks against the centres, dates and times you actually care about.' },
  { icon: BellRing, title: 'Alerts that matter', text: 'Only genuine matches reach you, so every notification is worth a look.' },
  { icon: Hand, title: 'You stay in control', text: 'We never book, confirm or change a test. That decision is always yours.' },
  { icon: ShieldCheck, title: 'Honest by design', text: 'No bypassing of security checks, no grey areas, and no inflated claims.' },
];

export default function AboutPage() {
  useDocumentTitle('About');
  return (
    <>
      <PageIntro
        eyebrow="About"
        title="Built for the people who help learners pass."
        description="SlotPilot is an independent tool made for driving instructors and schools who spend too much of their day looking for test slots."
      />

      <Section tone="canvas">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <SmartImage image="handsOnWheel" width={1200} sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-[4/3] rounded-3xl shadow-card" />
          </Reveal>
          <div className="order-1 lg:order-2">
            <SectionHeading align="left" eyebrow="Our story" title="Why SlotPilot exists" />
            <Reveal delay={0.1} className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted sm:text-base">
              <p>
                Anyone who manages driving tests for learners knows the routine: checking availability between lessons, late at night and
                first thing in the morning, hoping a suitable cancellation appears at the right centre on the right day.
              </p>
              <p>
                SlotPilot takes that repetitive watching off your hands. You tell it which centres, dates and times suit each learner, and it
                monitors for matching availability and alerts you the moment something suitable appears.
              </p>
              <p>
                What happens next is always up to you. SlotPilot does not book tests and never tries to get around the official service’s
                security. When you get an alert, you open the official booking service and complete the booking yourself.
              </p>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <div className="container-page">
          <SectionHeading eyebrow="What we believe" title="Principles we build by" />
          <Stagger as="ul" className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map(({ icon: Icon, title, text }) => (
              <StaggerItem as="li" key={title} className="rounded-3xl border border-line bg-canvas p-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mx-auto mt-12 max-w-3xl rounded-3xl border border-line bg-surface-muted p-6 text-center text-sm leading-relaxed text-muted">
            <strong className="font-semibold text-ink">Independence notice:</strong> SlotPilot is not affiliated with, endorsed by or
            connected to the Driver and Vehicle Standards Agency (DVSA) or GOV.UK. Official test bookings are always made through the
            official service.
          </Reveal>
          <div className="mt-10 flex justify-center">
            <Button to={paths.contact} variant="secondary" rightIcon={ArrowRight}>
              Get in touch
            </Button>
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}

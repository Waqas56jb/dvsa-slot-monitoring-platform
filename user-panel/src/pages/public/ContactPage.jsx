import { ArrowRight, Clock, LifeBuoy, Mail } from 'lucide-react';
import { useDocumentTitle } from '@/hooks';
import { SUPPORT_EMAIL } from '@/config/app';
import { paths } from '@/routes/paths';
import { Button } from '@/components/ui';
import { PageIntro } from '@/components/marketing/PageIntro';
import { ContactForm } from '@/components/marketing/ContactForm';
import { Reveal } from '@/components/marketing/Reveal';

const details = [
  {
    icon: Mail,
    title: 'Email support',
    body: (
      <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-brand hover:text-brand-hover hover:underline">
        {SUPPORT_EMAIL}
      </a>
    ),
  },
  { icon: Clock, title: 'Response time', body: 'Usually within one working day, Monday to Friday.' },
  {
    icon: LifeBuoy,
    title: 'Quick answers',
    body: (
      <Button to={paths.faq} variant="link" rightIcon={ArrowRight}>
        Browse the FAQ
      </Button>
    ),
  },
];

export default function ContactPage() {
  useDocumentTitle('Contact');
  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="Talk to the SlotPilot team"
        description="Questions about plans, setting up a driving school, or how monitoring works? Send us a message and a real person will reply."
        compact
      />
      <section className="py-16 lg:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal as="aside" aria-label="Contact details" className="space-y-4">
            {details.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-4 rounded-3xl border border-line bg-surface p-5 shadow-soft">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 text-sm text-muted">
                  <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
                  <div className="mt-1 break-words">{body}</div>
                </div>
              </div>
            ))}
            <p className="px-1 text-xs leading-relaxed text-subtle">
              SlotPilot is an independent monitoring tool and cannot help with bookings made on the official DVSA service. For questions about an
              existing test booking, please contact the DVSA directly.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="min-w-0">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}

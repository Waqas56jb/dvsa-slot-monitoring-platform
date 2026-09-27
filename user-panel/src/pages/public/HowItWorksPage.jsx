import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';
import { useHashScroll } from '@/components/marketing/useHashScroll';
import { paths } from '@/routes/paths';
import { PageIntro } from '@/components/marketing/PageIntro';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { SlotDetectionShowcase } from '@/components/marketing/SlotDetectionShowcase';
import { AlertsShowcase } from '@/components/marketing/AlertsShowcase';
import { ControlSection } from '@/components/marketing/ControlSection';
import { FinalCta } from '@/components/marketing/FinalCta';

export default function HowItWorksPage() {
  useDocumentTitle('How It Works');
  useHashScroll();
  return (
    <>
      <PageIntro
        eyebrow="How it works"
        title="Set it up once. Let SlotPilot keep watch."
        description="Add a learner, choose centres and preferences, start monitoring and get alerted the moment a suitable slot appears. You always complete the official booking yourself."
      >
        <Button to={paths.register} size="lg" rightIcon={ArrowRight}>
          Start Monitoring
        </Button>
        <Button href="#control" size="lg" variant="secondary">
          How you stay in control
        </Button>
      </PageIntro>
      <HowItWorksSection tone="surface" id="steps" eyebrow="The process" title="From setup to alert in four steps." />
      <SlotDetectionShowcase tone="canvas" />
      <AlertsShowcase tone="surface" />
      <ControlSection />
      <FinalCta />
    </>
  );
}

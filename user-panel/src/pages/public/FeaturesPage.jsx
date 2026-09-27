import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';
import { useHashScroll } from '@/components/marketing/useHashScroll';
import { paths } from '@/routes/paths';
import { PageIntro } from '@/components/marketing/PageIntro';
import { FeatureGrid } from '@/components/marketing/FeatureGrid';
import { CentresShowcase } from '@/components/marketing/CentresShowcase';
import { SlotDetectionShowcase } from '@/components/marketing/SlotDetectionShowcase';
import { AlertsShowcase } from '@/components/marketing/AlertsShowcase';
import { LearnersShowcase } from '@/components/marketing/LearnersShowcase';
import { ControlSection } from '@/components/marketing/ControlSection';
import { FinalCta } from '@/components/marketing/FinalCta';

export default function FeaturesPage() {
  useDocumentTitle('Features');
  useHashScroll();
  return (
    <>
      <PageIntro
        eyebrow="Features"
        title="Everything you need to catch the right slot."
        description="Multi-centre monitoring, precise preferences, instant alerts and calm multi-learner management — in one focused tool."
      >
        <Button to={paths.register} size="lg" rightIcon={ArrowRight}>
          Start Monitoring
        </Button>
        <Button to={paths.pricing} size="lg" variant="secondary">
          View pricing
        </Button>
      </PageIntro>
      <FeatureGrid />
      <CentresShowcase tone="surface" />
      <SlotDetectionShowcase tone="canvas" />
      <AlertsShowcase tone="surface" />
      <LearnersShowcase tone="canvas" />
      <ControlSection />
      <FinalCta secondary={{ label: 'See How It Works', to: paths.howItWorks }} />
    </>
  );
}

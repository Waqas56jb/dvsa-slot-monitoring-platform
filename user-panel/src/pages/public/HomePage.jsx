import { useDocumentTitle } from '@/hooks';
import { useHashScroll } from '@/components/marketing/useHashScroll';
import { Hero } from '@/components/marketing/Hero';
import { TrustStrip } from '@/components/marketing/TrustStrip';
import { ProblemSection } from '@/components/marketing/ProblemSection';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { CentresShowcase } from '@/components/marketing/CentresShowcase';
import { SlotDetectionShowcase } from '@/components/marketing/SlotDetectionShowcase';
import { AlertsShowcase } from '@/components/marketing/AlertsShowcase';
import { LearnersShowcase } from '@/components/marketing/LearnersShowcase';
import { ControlSection } from '@/components/marketing/ControlSection';
import { PricingSection } from '@/components/marketing/PricingSection';
import { FaqSection } from '@/components/marketing/FaqAccordion';
import { FinalCta } from '@/components/marketing/FinalCta';

export default function HomePage() {
  useDocumentTitle('');
  useHashScroll();
  return (
    <>
      <Hero />
      <TrustStrip />
      <ProblemSection />
      <HowItWorksSection tone="surface" />
      <CentresShowcase tone="canvas" />
      <SlotDetectionShowcase tone="surface" />
      <AlertsShowcase tone="canvas" />
      <LearnersShowcase tone="surface" />
      <ControlSection />
      <PricingSection tone="canvas" />
      <FaqSection tone="surface" ids={['what', 'how', 'auto', 'learners', 'speed', 'stop']} />
      <FinalCta />
    </>
  );
}

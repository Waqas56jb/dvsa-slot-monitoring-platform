import { useDocumentTitle } from '@/hooks';
import { useHashScroll } from '@/components/marketing/useHashScroll';
import { LandingHero } from '@/components/landing/hero/LandingHero';
import { TrustMarquee } from '@/components/landing/TrustMarquee';
import { AudienceSection } from '@/components/landing/AudienceSection';
import { WorkflowSection } from '@/components/landing/workflow/WorkflowSection';
import { CoverageSection } from '@/components/landing/CoverageSection';
import { FeatureBento } from '@/components/landing/FeatureBento';
import { StatsBand } from '@/components/landing/StatsBand';
import { Testimonials } from '@/components/landing/Testimonials';
import { GalleryMarquee } from '@/components/landing/GalleryMarquee';
import { LandingFinalCta } from '@/components/landing/FinalCta';
import { useSmoothScroll } from '@/components/landing/useSmoothScroll';
import { PricingSection } from '@/components/marketing/PricingSection';
import { FaqSection } from '@/components/marketing/FaqAccordion';

export default function HomePage() {
  useDocumentTitle('');
  useHashScroll();
  useSmoothScroll();
  return (
    <>
      <LandingHero />
      <TrustMarquee />
      <AudienceSection />
      <WorkflowSection />
      <CoverageSection />
      <FeatureBento />
      <StatsBand />
      <Testimonials />
      <GalleryMarquee />
      <PricingSection tone="surface" />
      <FaqSection tone="canvas" ids={['what', 'how', 'auto', 'learners', 'speed', 'stop']} />
      <LandingFinalCta />
    </>
  );
}

import { useDocumentTitle } from '@/hooks';
import { paths } from '@/routes/paths';
import { PageIntro } from '@/components/marketing/PageIntro';
import { PricingSection } from '@/components/marketing/PricingSection';
import { FaqSection } from '@/components/marketing/FaqAccordion';
import { FinalCta } from '@/components/marketing/FinalCta';

export default function PricingPage() {
  useDocumentTitle('Pricing');
  return (
    <>
      <PageIntro
        eyebrow="Pricing"
        title="Simple plans for every diary."
        description="Choose the plan that matches how many learners you manage. Change or cancel whenever you need to."
        compact
      />
      <PricingSection tone="canvas" showHeading={false} />
      <FaqSection tone="surface" title="Pricing & plan questions" ids={['centres', 'learners', 'auto', 'stop', 'data']} />
      <FinalCta secondary={{ label: 'Contact us', to: paths.contact }} />
    </>
  );
}

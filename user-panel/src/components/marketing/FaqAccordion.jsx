import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { faqs as allFaqs } from '@/data/faqs';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';
import { EASE, Reveal } from './Reveal';
import { Section, SectionHeading } from './SectionHeading';

function FaqItem({ item, open, onToggle, baseId }) {
  const buttonId = `${baseId}-${item.id}-q`;
  const panelId = `${baseId}-${item.id}-a`;
  return (
    <li className="border-b border-line last:border-b-0">
      <h3 className="text-base">
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="group flex w-full items-center justify-between gap-6 rounded-lg py-5 text-left font-sans text-[15px] font-semibold text-ink transition-colors hover:text-brand sm:text-base"
        >
          <span>{item.question}</span>
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color] duration-300',
              open ? 'rotate-45 border-brand bg-brand text-white' : 'border-line-strong text-muted group-hover:border-brand group-hover:text-brand',
            )}
            aria-hidden="true"
          >
            <Plus className="size-4" />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-6 pr-12 text-[15px] leading-relaxed text-muted">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/** Accessible accordion. Pass `ids` to show a subset of the shared FAQs. */
export function FaqAccordion({ items, ids, defaultOpen, className }) {
  const list = items || (ids ? ids.map((id) => allFaqs.find((f) => f.id === id)).filter(Boolean) : allFaqs);
  const [openId, setOpenId] = useState(defaultOpen ?? list[0]?.id ?? null);
  const baseId = useId();
  return (
    <ul className={cn('rounded-3xl border border-line bg-surface px-5 shadow-soft sm:px-8', className)}>
      {list.map((item) => (
        <FaqItem
          key={item.id}
          item={item}
          baseId={baseId}
          open={openId === item.id}
          onToggle={() => setOpenId((cur) => (cur === item.id ? null : item.id))}
        />
      ))}
    </ul>
  );
}

/** Landing / sub-page FAQ section with heading and optional link to the full FAQ. */
export function FaqSection({ ids, tone = 'surface', showAllLink = true, title = 'Questions, answered.' }) {
  return (
    <Section id="faq" tone={tone}>
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeading
            align="left"
            eyebrow="FAQ"
            title={title}
            description="Everything you need to know about how SlotPilot monitors availability and keeps you in control."
          />
          {showAllLink && (
            <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-3">
              <Button to={paths.faq} variant="secondary" rightIcon={ArrowRight}>
                View all FAQs
              </Button>
              <Button to={paths.contact} variant="ghost">
                Contact us
              </Button>
            </Reveal>
          )}
        </div>
        <Reveal delay={0.1} className="min-w-0">
          <FaqAccordion ids={ids} />
        </Reveal>
      </div>
    </Section>
  );
}

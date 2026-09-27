import { useMemo, useState } from 'react';
import { ArrowRight, Mail, MessageSquare, Search, SearchX } from 'lucide-react';
import { Button, EmptyState, Input } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';
import { faqs } from '@/data/faqs';
import { SUPPORT_EMAIL } from '@/config/app';
import { paths } from '@/routes/paths';
import { PageIntro } from '@/components/marketing/PageIntro';
import { FaqAccordion } from '@/components/marketing/FaqAccordion';
import { Reveal } from '@/components/marketing/Reveal';

export default function FaqPage() {
  useDocumentTitle('FAQ');
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }, [query]);

  return (
    <>
      <PageIntro
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="How SlotPilot monitors availability, sends alerts and keeps you in control of every booking."
        compact
      />

      <section className="py-16 lg:py-24" aria-label="Questions and answers">
        <div className="container-page max-w-3xl">
          <Input
            name="faq-search"
            label="Search questions"
            icon={Search}
            type="search"
            placeholder="e.g. alerts, learners, booking"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <p className="mt-3 text-sm text-muted" aria-live="polite">
            {query ? `${results.length} of ${faqs.length} questions match` : `${faqs.length} questions`}
          </p>

          <div className="mt-6">
            {results.length ? (
              <FaqAccordion key={query} items={results} defaultOpen={query ? results[0]?.id : 'what'} />
            ) : (
              <EmptyState
                icon={SearchX}
                title="No matching questions"
                description="Try a different word, or get in touch and we will answer you directly."
                action={
                  <Button variant="secondary" onClick={() => setQuery('')}>
                    Clear search
                  </Button>
                }
              />
            )}
          </div>

          <Reveal className="mt-14 flex flex-col items-start gap-6 rounded-3xl border border-line bg-surface p-6 shadow-soft sm:flex-row sm:items-center sm:p-8">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <MessageSquare className="size-6" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-ink">Still have a question?</h2>
              <p className="mt-1 text-sm text-muted">
                Send us a message and we will get back to you, usually within one working day.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto">
              <Button to={paths.contact} rightIcon={ArrowRight}>
                Contact us
              </Button>
              <Button href={`mailto:${SUPPORT_EMAIL}`} variant="ghost" size="sm" leftIcon={Mail}>
                {SUPPORT_EMAIL}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

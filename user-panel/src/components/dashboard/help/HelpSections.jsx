import { motion } from 'framer-motion';
import { ArrowRight, Mail, MessageSquare, SearchX, FileText, LifeBuoy } from 'lucide-react';
import { Button, Card, EmptyState } from '@/components/ui';
import { SUPPORT_EMAIL } from '@/config/app';
import { paths } from '@/routes/paths';
import { categoryIcon, Highlight, excerpt } from './helpUtils';

export function CategoryGrid({ categories, onSelect }) {
  return (
    <section aria-labelledby="help-topics">
      <h2 id="help-topics" className="mb-4 text-lg font-semibold text-ink">
        Browse by topic
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c, i) => {
          const Icon = categoryIcon(c.icon);
          return (
            <motion.li key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.04 }}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className="group flex h-full w-full flex-col rounded-3xl border border-line bg-surface p-5 text-left shadow-soft transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card sm:p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="mt-4 block font-semibold text-ink">{c.title}</span>
                <span className="mt-1 block flex-1 text-sm leading-relaxed text-muted">{c.description}</span>
                <span className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brand">
                  {c.articles.length} articles
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

export function SearchResults({ query, results, onOpen, onClear }) {
  if (!results.length) {
    return (
      <EmptyState
        icon={SearchX}
        title={`No results for “${query}”`}
        description="Try different keywords, browse the topics below, or contact support and we'll help."
        action={
          <Button variant="secondary" onClick={onClear}>
            Clear search
          </Button>
        }
        secondaryAction={
          <Button variant="ghost" leftIcon={Mail} href={`mailto:${SUPPORT_EMAIL}`}>
            Email support
          </Button>
        }
      />
    );
  }
  return (
    <section aria-labelledby="help-results">
      <h2 id="help-results" className="mb-4 text-sm font-medium text-muted" aria-live="polite">
        {results.length} {results.length === 1 ? 'result' : 'results'} for <span className="font-semibold text-ink">“{query}”</span>
      </h2>
      <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
        {results.map((r) => (
          <li key={r.id}>
            <button type="button" onClick={() => onOpen(r)} className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-muted/60 sm:px-5">
              <FileText className="mt-0.5 size-4 shrink-0 text-subtle" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink">
                  <Highlight text={r.title} query={query} />
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">
                  <Highlight text={excerpt(r.body, query)} query={query} />
                </span>
                <span className="mt-2 inline-flex rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-medium text-ink-soft">{r.category.title}</span>
              </span>
              <ArrowRight className="mt-1 size-4 shrink-0 text-subtle" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ContactSupportCard() {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-success-soft text-success-ink">
            <LifeBuoy className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-ink">Still need help?</h2>
            <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted">
              Our support team can help with your account, monitoring set-up and alerts. We usually reply within one working day.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
          <Button variant="secondary" leftIcon={MessageSquare} to={paths.contact}>
            Contact form
          </Button>
          <Button leftIcon={Mail} href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('SlotPilot support request')}`}>
            Email support
          </Button>
        </div>
      </div>
    </Card>
  );
}

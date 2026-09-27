import { Link } from 'react-router-dom';
import { CalendarDays, FileText } from 'lucide-react';
import { Alert } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';
import { SUPPORT_EMAIL } from '@/config/app';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';
import { PageIntro } from '@/components/marketing/PageIntro';
import { privacy } from '@/components/marketing/legal/privacy';
import { terms } from '@/components/marketing/legal/terms';
import { cookies } from '@/components/marketing/legal/cookies';

const docs = { privacy, terms, cookies };
const LAST_UPDATED = '27 September 2026';

const related = [
  { key: 'privacy', label: 'Privacy Policy', to: paths.privacy },
  { key: 'terms', label: 'Terms of Service', to: paths.terms },
  { key: 'cookies', label: 'Cookie Policy', to: paths.cookies },
];

export default function LegalPage({ doc = 'privacy' }) {
  const content = docs[doc] || privacy;
  useDocumentTitle(content.title);

  return (
    <>
      <PageIntro eyebrow="Legal" title={content.title} description={content.summary} align="left" compact>
        <p className="inline-flex items-center gap-2 text-sm text-muted">
          <CalendarDays className="size-4" aria-hidden="true" />
          Last updated {LAST_UPDATED}
        </p>
      </PageIntro>

      <div className="container-page grid gap-10 py-14 lg:grid-cols-[240px_1fr] lg:gap-16 lg:py-20">
        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="On this page">
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">On this page</p>
          <ol className="mt-3 space-y-0.5 border-l border-line">
            {content.sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-muted transition-colors hover:border-brand hover:text-ink"
                >
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-subtle">Other policies</p>
          <ul className="mt-3 space-y-1">
            {related
              .filter((r) => r.key !== doc)
              .map((r) => (
                <li key={r.key}>
                  <Link to={r.to} className="inline-flex min-h-9 items-center gap-2 text-sm font-medium text-ink-soft hover:text-brand">
                    <FileText className="size-4" aria-hidden="true" />
                    {r.label}
                  </Link>
                </li>
              ))}
          </ul>
        </aside>

        <article className="min-w-0 max-w-3xl">
          <Alert tone="info" title="Draft policy">
            This is a plain-English placeholder written for the product demo. It will be reviewed and finalised by a qualified adviser before
            SlotPilot launches.
          </Alert>

          {content.sections.map((s, i) => (
            <section key={s.id} id={s.id} className={cn('scroll-mt-24', i === 0 ? 'mt-10' : 'mt-12')} aria-labelledby={`${s.id}-h`}>
              <h2 id={`${s.id}-h`} className="text-xl font-bold text-ink sm:text-2xl">
                <span className="mr-2 font-display text-base font-semibold tabular-nums text-subtle">{String(i + 1).padStart(2, '0')}</span>
                {s.heading}
              </h2>
              {s.paragraphs?.map((p) => (
                <p key={p.slice(0, 32)} className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                  {p}
                </p>
              ))}
              {s.list && (
                <ul className="mt-4 space-y-2.5">
                  {s.list.map((item) => (
                    <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink-soft">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.contact && (
                <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                  Email{' '}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-brand hover:underline">
                    {SUPPORT_EMAIL}
                  </a>{' '}
                  or use our{' '}
                  <Link to={paths.contact} className="font-medium text-brand hover:underline">
                    contact form
                  </Link>
                  .
                </p>
              )}
            </section>
          ))}
        </article>
      </div>
    </>
  );
}

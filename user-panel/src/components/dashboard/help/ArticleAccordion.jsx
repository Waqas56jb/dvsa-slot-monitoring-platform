import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { categoryIcon } from './helpUtils';
import { cn } from '@/utils/cn';

/** Articles of one category as an accessible accordion. */
export function ArticleAccordion({ category, openId, onToggle, onBack }) {
  const Icon = categoryIcon(category.icon);
  return (
    <Card as="section" aria-labelledby="help-cat-title" id="help-category" className="scroll-mt-24">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="help-cat-title" className="text-lg font-semibold text-ink">
              {category.title}
            </h2>
            <p className="text-sm text-muted">{category.description}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" leftIcon={ArrowLeft} onClick={onBack} className="self-start sm:self-auto">
          All topics
        </Button>
      </div>
      <ul className="divide-y divide-line rounded-2xl border border-line">
        {category.articles.map((a) => {
          const open = openId === a.id;
          return (
            <li key={a.id} id={`article-${a.id}`} className="scroll-mt-28">
              <h3>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`article-body-${a.id}`}
                  onClick={() => onToggle(open ? null : a.id)}
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left text-[15px] font-medium text-ink transition-colors hover:bg-surface-muted/60 sm:px-5"
                >
                  {a.title}
                  <ChevronDown className={cn('size-4 shrink-0 text-muted transition-transform duration-200', open && 'rotate-180')} aria-hidden="true" />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    id={`article-body-${a.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-5 text-[15px] leading-relaxed text-ink-soft sm:px-5">{a.body}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

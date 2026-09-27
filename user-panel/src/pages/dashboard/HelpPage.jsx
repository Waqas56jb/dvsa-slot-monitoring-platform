import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { SearchBar } from '@/components/ui';
import { ArticleAccordion } from '@/components/dashboard/help/ArticleAccordion';
import { CategoryGrid, SearchResults, ContactSupportCard } from '@/components/dashboard/help/HelpSections';
import { searchArticles } from '@/components/dashboard/help/helpUtils';
import { helpCategories } from '@/data/helpArticles';
import { useDebounce, useDocumentTitle } from '@/hooks';

const POPULAR = ['browser notifications', 'add a learner', 'pause', 'password'];

export default function HelpPage() {
  useDocumentTitle('Help Centre');
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 250).trim();
  const [categoryId, setCategoryId] = useState(null);
  const [openArticle, setOpenArticle] = useState(null);
  const [scrollTarget, setScrollTarget] = useState(null);

  const results = useMemo(() => searchArticles(debounced), [debounced]);
  const category = helpCategories.find((c) => c.id === categoryId);

  useEffect(() => {
    if (!scrollTarget) return;
    // Wait until the target has rendered (the search view clears after the debounce).
    const t = setTimeout(() => {
      const el = document.getElementById(scrollTarget);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.querySelector('button')?.focus({ preventScroll: true });
      setScrollTarget(null);
    }, 60);
    return () => clearTimeout(t);
  }, [scrollTarget, debounced]);

  const selectCategory = (id) => {
    setCategoryId(id);
    setOpenArticle(null);
    setScrollTarget('help-category');
  };

  const openResult = (r) => {
    setQuery('');
    setCategoryId(r.category.id);
    setOpenArticle(r.id);
    setScrollTarget(`article-${r.id}`);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        aria-labelledby="help-title"
        className="relative mb-8 overflow-hidden rounded-3xl bg-night px-5 py-10 text-center sm:px-10 sm:py-14"
      >
        <div className="bg-grid mask-radial absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/60">Help Centre</p>
          <h1 id="help-title" className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How can we help?
          </h1>
          <p className="mt-2 text-[15px] text-white/70">Search guides on learners, monitoring, alerts and your account.</p>
          <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-6">
            <SearchBar id="help-search" value={query} onChange={setQuery} placeholder="Search for answers…" label="Search help articles" className="[&_input]:h-12 [&_input]:shadow-float" />
          </form>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-white/60">Popular:</span>
            {POPULAR.map((p) => (
              <button key={p} type="button" onClick={() => setQuery(p)} className="min-h-9 rounded-full bg-white/10 px-3 text-white/85 ring-1 ring-white/15 transition-colors hover:bg-white/15">
                {p}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="space-y-8">
        {debounced ? (
          <SearchResults query={debounced} results={results} onOpen={openResult} onClear={() => setQuery('')} />
        ) : category ? (
          <ArticleAccordion category={category} openId={openArticle} onToggle={setOpenArticle} onBack={() => setCategoryId(null)} />
        ) : null}

        {!debounced && <CategoryGrid categories={helpCategories} onSelect={selectCategory} />}

        <ContactSupportCard />
      </div>
    </>
  );
}

import { motion } from 'framer-motion';
import { ArrowLeft, LifeBuoy, MapPinOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';
import { paths } from '@/routes/paths';
import { RoutePattern } from '@/components/marketing/RoutePattern';
import { EASE } from '@/components/marketing/Reveal';

const publicLinks = [
  { label: 'Features', to: paths.features },
  { label: 'How It Works', to: paths.howItWorks },
  { label: 'Pricing', to: paths.pricing },
  { label: 'FAQ', to: paths.faq },
];

const dashboardLinks = [
  { label: 'Learners', to: paths.learners },
  { label: 'Slots', to: paths.slots },
  { label: 'Monitoring', to: paths.monitoring },
  { label: 'Help', to: paths.help },
];

export default function NotFoundPage({ inDashboard = false }) {
  useDocumentTitle('Page not found');
  const links = inDashboard ? dashboardLinks : publicLinks;

  return (
    <section
      className={
        inDashboard
          ? 'relative flex min-h-[60vh] items-center justify-center overflow-hidden rounded-3xl border border-line bg-surface px-4 py-16'
          : 'relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-20'
      }
      aria-labelledby="not-found-title"
    >
      <RoutePattern />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative mx-auto max-w-lg text-center"
      >
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-line bg-surface text-brand shadow-card">
          <MapPinOff className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-6 font-display text-sm font-bold tracking-widest text-brand">ERROR 404</p>
        <h1 id="not-found-title" className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          This route doesn’t lead anywhere
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted">
          The page you are looking for may have moved or no longer exists. Let’s get you back on the road.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button to={inDashboard ? paths.dashboard : paths.home} size="lg" leftIcon={ArrowLeft}>
            {inDashboard ? 'Back to dashboard' : 'Back to home'}
          </Button>
          <Button to={inDashboard ? paths.help : paths.contact} size="lg" variant="secondary" leftIcon={LifeBuoy}>
            {inDashboard ? 'Get help' : 'Contact us'}
          </Button>
        </div>
        <nav aria-label="Popular pages" className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Popular pages</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="inline-flex h-10 items-center rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </motion.div>
    </section>
  );
}

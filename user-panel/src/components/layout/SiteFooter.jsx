import { Link } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';
import { paths } from '@/routes/paths';
import { APP_TAGLINE } from '@/config/app';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: paths.features },
      { label: 'How It Works', to: paths.howItWorks },
      { label: 'Pricing', to: paths.pricing },
      { label: 'FAQ', to: paths.faq },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: paths.about },
      { label: 'Contact', to: paths.contact },
      { label: 'Help', to: paths.faq },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: paths.privacy },
      { label: 'Terms', to: paths.terms },
      { label: 'Cookie Policy', to: paths.cookies },
    ],
  },
];

/* Brand glyphs (lucide no longer ships brand icons). Links are intentionally
   not set until official profiles exist — no fake social URLs. */
const socials = [
  {
    label: 'LinkedIn',
    path: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.83v1.54h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13V21h-4v-4.98c0-1.19-.02-2.72-1.66-2.72-1.66 0-1.91 1.3-1.91 2.63V21h-4V9.75Z',
  },
  {
    label: 'X',
    path: 'M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z',
  },
  {
    label: 'Instagram',
    path: 'M12 2.8c3 0 3.36.01 4.54.07 1.1.05 1.7.23 2.1.39.52.2.9.45 1.3.84.4.4.64.78.84 1.3.16.4.34 1 .39 2.1.06 1.18.07 1.54.07 4.54s-.01 3.36-.07 4.54c-.05 1.1-.23 1.7-.39 2.1-.2.52-.45.9-.84 1.3-.4.4-.78.64-1.3.84-.4.16-1 .34-2.1.39-1.18.06-1.54.07-4.54.07s-3.36-.01-4.54-.07c-1.1-.05-1.7-.23-2.1-.39a3.5 3.5 0 0 1-1.3-.84 3.5 3.5 0 0 1-.84-1.3c-.16-.4-.34-1-.39-2.1C2.81 15.36 2.8 15 2.8 12s.01-3.36.07-4.54c.05-1.1.23-1.7.39-2.1.2-.52.45-.9.84-1.3.4-.4.78-.64 1.3-.84.4-.16 1-.34 2.1-.39C8.64 2.81 9 2.8 12 2.8Zm0 4.62a4.58 4.58 0 1 0 0 9.16 4.58 4.58 0 0 0 0-9.16Zm0 7.55a2.97 2.97 0 1 1 0-5.94 2.97 2.97 0 0 1 0 5.94Zm4.76-8.8a1.07 1.07 0 1 0 0 2.14 1.07 1.07 0 0 0 0-2.14Z',
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-16">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-[15px] leading-relaxed text-muted">Driving test slot monitoring made simple.</p>
          <p className="mt-2 text-sm text-subtle">{APP_TAGLINE}</p>
          <p className="mt-6 text-xs leading-relaxed text-subtle">
            SlotPilot is an independent monitoring and alert service. It is not affiliated with, endorsed by or a partner of the DVSA or GOV.UK.
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="font-sans text-sm font-semibold text-ink">{col.title}</h2>
            <ul className="mt-4 space-y-1">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="inline-flex min-h-9 items-center text-[15px] text-muted transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-sm text-muted">© 2026 SlotPilot. All rights reserved.</p>
          <ul className="flex items-center gap-1" aria-label="Social media">
            {socials.map((s) => (
              <li key={s.label}>
                <span
                  className="flex size-10 items-center justify-center rounded-xl text-subtle"
                  title={`${s.label} — coming soon`}
                  aria-label={`${s.label} (profile coming soon)`}
                  role="img"
                >
                  <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

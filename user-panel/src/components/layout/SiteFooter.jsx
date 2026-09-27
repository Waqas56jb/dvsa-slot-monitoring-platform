import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUp, Check, Mail } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { paths } from '@/routes/paths';
import { SUPPORT_EMAIL } from '@/config/app';

const columns = [
  { title: 'Product', links: [{ label: 'Features', to: paths.features }, { label: 'How It Works', to: paths.howItWorks }, { label: 'Pricing', to: paths.pricing }, { label: 'FAQ', to: paths.faq }] },
  { title: 'Company', links: [{ label: 'About', to: paths.about }, { label: 'Contact', to: paths.contact }, { label: 'Help centre', to: paths.faq }] },
  { title: 'Legal', links: [{ label: 'Privacy Policy', to: paths.privacy }, { label: 'Terms', to: paths.terms }, { label: 'Cookie Policy', to: paths.cookies }] },
];

/* Brand glyphs (lucide no longer ships brand icons). Profiles are not live yet — no fake URLs. */
const socials = [
  { label: 'LinkedIn', path: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.83v1.54h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13V21h-4v-4.98c0-1.19-.02-2.72-1.66-2.72-1.66 0-1.91 1.3-1.91 2.63V21h-4V9.75Z' },
  { label: 'X', path: 'M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z' },
  { label: 'Instagram', path: 'M12 2.8c3 0 3.36.01 4.54.07 1.1.05 1.7.23 2.1.39.52.2.9.45 1.3.84.4.4.64.78.84 1.3.16.4.34 1 .39 2.1.06 1.18.07 1.54.07 4.54s-.01 3.36-.07 4.54c-.05 1.1-.23 1.7-.39 2.1-.2.52-.45.9-.84 1.3-.4.4-.78.64-1.3.84-.4.16-1 .34-2.1.39-1.18.06-1.54.07-4.54.07s-3.36-.01-4.54-.07c-1.1-.05-1.7-.23-2.1-.39a3.5 3.5 0 0 1-1.3-.84 3.5 3.5 0 0 1-.84-1.3c-.16-.4-.34-1-.39-2.1C2.81 15.36 2.8 15 2.8 12s.01-3.36.07-4.54c.05-1.1.23-1.7.39-2.1.2-.52.45-.9.84-1.3.4-.4.78-.64 1.3-.84.4-.16 1-.34 2.1-.39C8.64 2.81 9 2.8 12 2.8Zm0 4.62a4.58 4.58 0 1 0 0 9.16 4.58 4.58 0 0 0 0-9.16Zm0 7.55a2.97 2.97 0 1 1 0-5.94 2.97 2.97 0 0 1 0 5.94Zm4.76-8.8a1.07 1.07 0 1 0 0 2.14 1.07 1.07 0 0 0 0-2.14Z' },
];

function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setState('error'); return; }
    setState('done'); // TODO: POST to the newsletter endpoint once the API exists.
  };
  if (state === 'done') {
    return <p className="flex items-center gap-2 rounded-2xl bg-emerald-400/10 px-4 py-3.5 text-sm text-emerald-300 ring-1 ring-emerald-400/20"><Check className="size-4" aria-hidden="true" /> You’re on the list. Tips and product news only — no spam.</p>;
  }
  return (
    <form onSubmit={submit} noValidate className="w-full">
      <label htmlFor="footer-email" className="sr-only">Email address</label>
      <div className="flex items-center gap-2 rounded-2xl bg-white/[0.06] p-1.5 ring-1 ring-white/10 focus-within:ring-[#7d98ff]">
        <Mail className="ml-3 size-4 shrink-0 text-white/40" aria-hidden="true" />
        <input
          id="footer-email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setState('idle'); }}
          placeholder="you@example.com"
          aria-invalid={state === 'error' || undefined}
          aria-describedby={state === 'error' ? 'footer-email-error' : undefined}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-white placeholder:text-white/35 focus:outline-none"
        />
        <button type="submit" className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-night transition-transform hover:-translate-y-px">
          Subscribe <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
      {state === 'error' && <p id="footer-email-error" className="mt-2 text-sm text-red-300">Enter a valid email address.</p>}
    </form>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative isolate overflow-hidden bg-[#070b14] text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#3b5bfd]/15 blur-[140px]" aria-hidden="true" />

      <div className="container-page">
        {/* Top band */}
        <div className="grid gap-10 border-b border-white/[0.08] py-16 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:py-20">
          <div>
            <h2 className="max-w-lg text-balance font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">Driving-test tips and product news, once a month.</h2>
            <p className="mt-3 max-w-md text-white/55">Join instructors and learners who hear about new features and seasonal availability trends first.</p>
          </div>
          <Newsletter />
        </div>

        {/* Links */}
        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo inverted />
            <p className="mt-5 text-[15px] leading-relaxed text-white/55">Smart monitoring for UK driving test slots. You set the preferences — we watch, you book.</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-5 inline-flex items-center gap-2 text-[15px] font-medium text-white/80 hover:text-white">
              <Mail className="size-4" aria-hidden="true" /> {SUPPORT_EMAIL}
            </a>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">{col.title}</h3>
              <ul className="mt-5 space-y-1">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="group inline-flex min-h-10 items-center gap-1 text-[15px] text-white/70 transition-colors hover:text-white">
                      {l.label}
                      <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Giant wordmark */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none select-none bg-gradient-to-b from-white/[0.14] to-white/[0.01] bg-clip-text text-center font-display text-[22vw] font-extrabold leading-[0.8] tracking-[-0.06em] text-transparent lg:text-[15.5rem]"
          aria-hidden="true"
        >
          SlotPilot
        </motion.p>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-5 border-t border-white/[0.08] py-7 pb-[max(env(safe-area-inset-bottom),1.75rem)] text-center md:flex-row md:text-left">
          <div>
            <p className="text-sm text-white/50">© {new Date().getFullYear()} SlotPilot. All rights reserved.</p>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-white/35">Independent monitoring and alert service. Not affiliated with, endorsed by or a partner of the DVSA or GOV.UK. All bookings are completed by you on the official service.</p>
          </div>
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <span key={s.label} role="img" aria-label={`${s.label} (profile coming soon)`} title={`${s.label} — coming soon`} className="flex size-10 items-center justify-center rounded-full bg-white/[0.06] text-white/50 ring-1 ring-white/10">
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true"><path d={s.path} /></svg>
              </span>
            ))}
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="ml-2 flex size-10 items-center justify-center rounded-full bg-white text-night transition-transform hover:-translate-y-0.5" aria-label="Back to top">
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { motion } from 'framer-motion'
import { Activity, BellRing, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { APP_TAGLINE } from '@/constants/config'
import { useDocumentTitle } from '@/hooks/useUtils'

const HERO = 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad'
const heroSrc = (w) => `${HERO}?auto=format&fit=crop&w=${w}&q=70`

const POINTS = [
  { icon: Activity, title: 'Live monitoring operations', body: 'Every job, worker and detection in one place.' },
  { icon: BellRing, title: 'Alert delivery you can trace', body: 'From slot detected to user notified, end to end.' },
  { icon: ShieldCheck, title: 'Role-based and fully audited', body: 'Every admin action is recorded.' },
]

/** Split-screen frame shared by login / forgot / reset. */
export function AuthShell({ title, children }) {
  useDocumentTitle(title)
  return (
    <div className="grid min-h-screen bg-surface lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14">
        <Logo />
        <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          {children}
        </motion.main>
        <p className="text-xs text-ink-4">© {new Date().getFullYear()} SlotPilot · Internal admin workspace. Access is monitored.</p>
      </div>

      <aside className="relative hidden overflow-hidden bg-nav lg:block" aria-hidden>
        <img
          src={heroSrc(1600)}
          srcSet={`${heroSrc(1280)} 1280w, ${heroSrc(1600)} 1600w, ${heroSrc(2400)} 2400w`}
          sizes="50vw"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#0b1220]/80 to-[#0b1220]/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(53,112,240,0.35),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-end p-12 xl:p-16">
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-brand-300 uppercase">SlotPilot Admin</p>
          <h2 className="max-w-md text-3xl leading-tight font-semibold tracking-[-0.02em] text-white xl:text-4xl">{APP_TAGLINE}</h2>
          <ul className="mt-10 grid max-w-lg gap-5">
            {POINTS.map(({ icon: Icon, title: t, body }) => (
              <li key={t} className="flex gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-brand-300 backdrop-blur"><Icon className="h-4 w-4" /></span>
                <span>
                  <span className="block text-sm font-medium text-white">{t}</span>
                  <span className="block text-sm text-white/60">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}

import { LogOut } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Button, Stepper } from '@/components/ui';
import { cn } from '@/utils/cn';

/** Full-screen, distraction-free frame for the onboarding wizard. */
export function OnboardingShell({ steps, current, onSignOut, signingOut, footer, children, hideProgress = false }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-canvas">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-dots opacity-60 mask-fade-b" aria-hidden="true" />

      <header className="relative z-10 border-b border-line/70 bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo to="/" />
          {onSignOut && (
            <Button variant="ghost" size="md" leftIcon={LogOut} onClick={onSignOut} loading={signingOut}>
              Sign out
            </Button>
          )}
        </div>
      </header>

      <main id="main" className="relative z-10 flex flex-1 flex-col">
        {!hideProgress && (
          <div className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6 sm:pt-10">
            <Stepper steps={steps} current={current} />
          </div>
        )}
        <div className={cn('mx-auto w-full max-w-2xl flex-1 px-4 sm:px-6', hideProgress ? 'flex items-center py-10' : 'pb-8 pt-6 sm:pt-10')}>
          <div className="w-full">{children}</div>
        </div>
        {footer && (
          <div className="sticky bottom-0 z-20 border-t border-line bg-canvas/90 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:backdrop-blur-none">
            <div className="mx-auto w-full max-w-2xl px-4 py-3 sm:px-6 sm:pb-12 sm:pt-0">{footer}</div>
          </div>
        )}
      </main>
    </div>
  );
}

/** Title block shown at the top of each wizard step. */
export function StepHeader({ icon: Icon, step, title, description }) {
  return (
    <header className="mb-7">
      <div className="mb-4 flex items-center gap-3">
        {Icon && (
          <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink ring-1 ring-brand/10">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        )}
        {step && <span className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">{step}</span>}
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[28px]">{title}</h1>
      {description && <p className="mt-2 text-[15px] leading-relaxed text-muted">{description}</p>}
    </header>
  );
}

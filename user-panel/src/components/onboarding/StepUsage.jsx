import { AnimatePresence, motion } from 'framer-motion';
import { Building2, CalendarClock, Car, Compass, Sparkles, UserRound } from 'lucide-react';
import { ChoiceCard, Input } from '@/components/ui';
import { USAGE_TYPES } from '@/config/app';
import { StepHeader } from './OnboardingShell';

const icons = { instructor: Car, school: Building2, learner: UserRound, manager: CalendarClock, other: Sparkles };

export const needsBusinessName = (type) => type === 'instructor' || type === 'school';

export function StepUsage({ form }) {
  const { values, setValue, error } = form;
  const showBusiness = needsBusinessName(values.usageType);

  return (
    <>
      <StepHeader icon={Compass} step="Step 1" title="How will you use SlotPilot?" description="We'll tailor your dashboard to the way you work. You can change this later in settings." />
      <div role="radiogroup" aria-label="How will you use SlotPilot?" aria-describedby={error('usageType') ? 'usageType-error' : undefined} id="usageType" tabIndex={-1} className="grid gap-3 outline-none sm:grid-cols-2">
        {USAGE_TYPES.map((t) => (
          <ChoiceCard
            key={t.value}
            selected={values.usageType === t.value}
            onSelect={() => setValue('usageType', t.value)}
            title={t.label}
            description={t.description}
            icon={icons[t.value] || Sparkles}
            className={t.value === 'other' ? 'sm:col-span-2' : undefined}
          />
        ))}
      </div>
      {error('usageType') && (
        <p id="usageType-error" role="alert" className="mt-3 text-[13px] text-danger-ink">
          {error('usageType')}
        </p>
      )}

      <AnimatePresence initial={false}>
        {showBusiness && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <Input
              {...form.field('businessName')}
              className="pt-6"
              label={values.usageType === 'school' ? 'Driving school name' : 'Business name'}
              placeholder={values.usageType === 'school' ? 'e.g. Northside Driving School' : 'e.g. Ahmed Driving Tuition'}
              optional
              autoComplete="organization"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

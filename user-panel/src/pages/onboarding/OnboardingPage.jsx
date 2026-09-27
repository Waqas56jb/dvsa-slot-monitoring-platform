import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Radar } from 'lucide-react';
import { Button } from '@/components/ui';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { StepUsage, needsBusinessName } from '@/components/onboarding/StepUsage';
import { StepLearner } from '@/components/onboarding/StepLearner';
import { StepCentres } from '@/components/onboarding/StepCentres';
import { StepDates } from '@/components/onboarding/StepDates';
import { StepTime } from '@/components/onboarding/StepTime';
import { StepNotifications } from '@/components/onboarding/StepNotifications';
import { CompletionCelebration } from '@/components/onboarding/CompletionCelebration';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle, useForm } from '@/hooks';
import { userService } from '@/services';
import { rules } from '@/utils/validation';
import { addDays, toISODate } from '@/utils/format';
import { paths } from '@/routes/paths';

const STEPS = [
  { label: 'Usage', fields: ['usageType', 'businessName'], component: StepUsage },
  { label: 'Learner', fields: ['learnerName', 'learnerEmail', 'learnerPhone'], component: StepLearner },
  { label: 'Centres', fields: ['centreIds'], component: StepCentres },
  { label: 'Dates', fields: ['dateFrom', 'dateTo'], component: StepDates },
  { label: 'Time', fields: ['timeFrom', 'timeTo'], component: StepTime },
  { label: 'Alerts', fields: [], component: StepNotifications },
];
const ALL_FIELDS = STEPS.flatMap((s) => s.fields);

const schema = {
  usageType: [(v) => (v ? '' : 'Choose how you’ll use SlotPilot to continue.')],
  learnerName: [rules.required('Full name'), (v) => (String(v).trim().split(/\s+/).length >= 2 ? '' : 'Enter the learner’s first and last name.')],
  learnerEmail: [rules.required('Email'), rules.email()],
  learnerPhone: [rules.ukPhone()],
  centreIds: [rules.minItems(1, 'Choose at least one test centre.')],
  dateFrom: [rules.required('Earliest date'), rules.dateNotPast()],
  dateTo: [rules.required('Latest date'), rules.dateAfter('dateFrom')],
  timeFrom: [rules.required('Start time')],
  timeTo: [rules.required('End time'), rules.timeAfter('timeFrom')],
};

const initialValues = () => ({
  usageType: '',
  businessName: '',
  learnerName: '',
  learnerEmail: '',
  learnerPhone: '',
  centreIds: [],
  dateFrom: toISODate(new Date()),
  dateTo: toISODate(addDays(new Date(), 30)),
  timeFrom: '09:00',
  timeTo: '12:00',
  notifications: { dashboard: true, browser: false, sound: true, email: false },
});

const splitName = (name) => {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
};

const variants = {
  enter: (dir) => ({ opacity: 0, x: dir * 32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir * -32 }),
};

export default function OnboardingPage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  // Captured once so the refreshed user after completion doesn't bounce us off the celebration screen.
  const [alreadyOnboarded] = useState(() => Boolean(user?.onboardingComplete));
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [completed, setCompleted] = useState(null);
  const form = useForm(initialValues, schema);

  useDocumentTitle(completed ? 'Monitoring is live' : `Set up · ${STEPS[step].label}`);

  if (alreadyOnboarded && !completed) return <Navigate to={paths.dashboard} replace />;

  const goTo = (next) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const focusFirstError = (names) => {
    const first = names.find((n) => form.errors[n]);
    if (first) requestAnimationFrame(() => document.getElementById(first === 'dateFrom' || first === 'dateTo' ? `dates-${first === 'dateFrom' ? 'from' : 'to'}` : first)?.focus?.());
  };

  const next = () => {
    const fields = STEPS[step].fields;
    if (!form.validateFields(fields)) return focusFirstError(fields);
    goTo(step + 1);
  };

  const back = () => step > 0 && goTo(step - 1);

  const finish = async () => {
    if (!form.validateFields(ALL_FIELDS)) {
      const bad = STEPS.findIndex((s) => s.fields.some((f) => form.errors[f]));
      toast.warning('A few details need attention', { description: `Please review the ${STEPS[bad]?.label.toLowerCase()} step.` });
      if (bad >= 0) goTo(bad);
      return;
    }
    const v = form.values;
    setSubmitting(true);
    try {
      const { firstName, lastName } = splitName(v.learnerName);
      await userService.completeOnboarding({
        usageType: v.usageType,
        businessName: needsBusinessName(v.usageType) ? v.businessName.trim() : '',
        learner: { firstName, lastName, email: v.learnerEmail.trim(), phone: v.learnerPhone.trim() },
        centreIds: v.centreIds,
        dateFrom: v.dateFrom,
        dateTo: v.dateTo,
        timeFrom: v.timeFrom,
        timeTo: v.timeTo,
        notifications: { ...v.notifications },
        startMonitoring: true,
      });
      setCompleted({ learnerName: firstName });
      toast.success('You’re all set', { description: 'Monitoring has started for your first learner.' });
      window.scrollTo({ top: 0 });
    } catch (err) {
      toast.error('We couldn’t finish setting up', { description: err?.message || 'Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      navigate(paths.login, { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  if (completed) {
    const v = form.values;
    return (
      <OnboardingShell hideProgress steps={STEPS} current={STEPS.length - 1}>
        <CompletionCelebration learnerName={completed.learnerName} centreCount={v.centreIds.length} dateFrom={v.dateFrom} dateTo={v.dateTo} timeFrom={v.timeFrom} timeTo={v.timeTo} />
      </OnboardingShell>
    );
  }

  const StepComponent = STEPS[step].component;
  const isLast = step === STEPS.length - 1;
  const learnerFirstName = splitName(form.values.learnerName).firstName;

  const footer = (
    <div className="flex items-center justify-between gap-3">
      <Button variant="ghost" size="lg" leftIcon={ArrowLeft} onClick={back} disabled={step === 0 || submitting} className={step === 0 ? 'invisible' : undefined}>
        Back
      </Button>
      {isLast ? (
        <Button size="lg" leftIcon={Radar} onClick={finish} loading={submitting} className="flex-1 sm:flex-none">
          {submitting ? 'Starting…' : 'Start Monitoring'}
        </Button>
      ) : (
        <Button size="lg" rightIcon={ArrowRight} onClick={next} className="flex-1 sm:flex-none sm:min-w-36">
          Continue
        </Button>
      )}
    </div>
  );

  return (
    <OnboardingShell steps={STEPS} current={step} onSignOut={signOut} signingOut={signingOut} footer={footer}>
      <div className="overflow-x-clip">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.section
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step].label}`}
          >
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (isLast) finish();
                else next();
              }}
            >
              <StepComponent form={form} learnerFirstName={learnerFirstName} onEditStep={goTo} />
              <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
            </form>
          </motion.section>
        </AnimatePresence>
      </div>
    </OnboardingShell>
  );
}

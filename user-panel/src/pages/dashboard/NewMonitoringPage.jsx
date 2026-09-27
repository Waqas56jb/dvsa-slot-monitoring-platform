import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Radar, X } from 'lucide-react';
import { PageHeader, Stepper, Button, Card } from '@/components/ui';
import { StepLearners } from '@/components/dashboard/monitoring/wizard/StepLearners';
import { StepCentres, StepDates, StepTimes, StepNotify } from '@/components/dashboard/monitoring/wizard/StepPreferences';
import { StepReview } from '@/components/dashboard/monitoring/wizard/StepReview';
import { STEPS, initialValues, defaultsFromLearners, validateStep } from '@/components/dashboard/monitoring/wizard/wizardUtils';
import { learnerService, monitoringService, userService } from '@/services';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle, useResource } from '@/hooks';
import { paths } from '@/routes/paths';

const COPY = [
  ['Who should we monitor?', 'Select one or more learners. Their saved preferences become the starting point.'],
  ['Which test centres?', 'Choose every centre you’re happy to travel to — more centres means more chances.'],
  ['When can they take the test?', 'Only slots inside this date range will trigger an alert.'],
  ['Preferred times', 'Pick a quick window or set exact earliest and latest times.'],
  ['How should we alert you?', 'Choose your notification channels and how often to check.'],
  ['Review and start', 'Check everything looks right. You can edit any section before starting.'],
];

const FOCUS_IDS = { dateFrom: 'date-from', dateTo: 'date-to' };

const variants = {
  enter: (dir) => ({ opacity: 0, x: dir * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir * -24 }),
};

export default function NewMonitoringPage() {
  useDocumentTitle('New Monitoring');
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const { data: learners, loading, error, reload } = useResource(() => learnerService.list(), []);

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef(null);
  const preselected = useRef(false);
  const prefCentres = useRef([]);

  // Account-level defaults (Settings → Monitoring / Notifications).
  useEffect(() => {
    let cancelled = false;
    userService
      .getPreferences()
      .then((prefs) => {
        if (cancelled || !prefs) return;
        const m = prefs.monitoring || {};
        const n = prefs.notifications || {};
        prefCentres.current = m.preferredCentreIds || [];
        setValues((v) => ({
          ...v,
          interval: m.interval ? String(m.interval) : v.interval,
          startNow: m.autoStart !== false,
          notify: { dashboard: n.dashboard ?? v.notify.dashboard, browser: n.browser ?? v.notify.browser, sound: n.sound ?? v.notify.sound, email: n.email ?? v.notify.email },
        }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // ?learner=<id> preselects a learner once the list has loaded.
  useEffect(() => {
    const id = params.get('learner');
    if (preselected.current || !learners || !id) return;
    preselected.current = true;
    if (learners.some((l) => l.id === id)) setValues((v) => ({ ...v, learnerIds: [id] }));
  }, [learners, params]);

  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) headingRef.current?.focus();
    mounted.current = true;
  }, [step]);

  const setField = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    const group = name === 'centreIds' ? 'centres' : name.startsWith('date') ? 'dates' : name.startsWith('time') ? 'times' : null;
    if (group) setTouched((t) => ({ ...t, [group]: true }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const applyDefaults = (current) => {
    const chosen = (learners || []).filter((l) => current.learnerIds.includes(l.id));
    const d = defaultsFromLearners(chosen, prefCentres.current);
    return {
      ...current,
      ...(touched.centres ? {} : { centreIds: d.centreIds }),
      ...(touched.dates ? {} : { dateFrom: d.dateFrom, dateTo: d.dateTo }),
      ...(touched.times ? {} : { timeFrom: d.timeFrom, timeTo: d.timeTo }),
    };
  };

  const goTo = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = () => {
    const e = validateStep(step, values);
    if (Object.keys(e).length) {
      setErrors(e);
      const first = Object.keys(e)[0];
      document.getElementById(FOCUS_IDS[first] || first)?.focus?.();
      return;
    }
    setErrors({});
    if (step === 0) setValues((v) => applyDefaults(v));
    goTo(step + 1);
  };

  const back = () => (step === 0 ? navigate(paths.monitoring) : goTo(step - 1));

  const submit = async () => {
    for (let i = 0; i < STEPS.length - 1; i++) {
      const e = validateStep(i, values);
      if (Object.keys(e).length) {
        setErrors(e);
        goTo(i);
        return;
      }
    }
    setSubmitting(true);
    try {
      const session = await monitoringService.createSession({
        name: values.name.trim(),
        learnerIds: values.learnerIds,
        criteria: { centreIds: values.centreIds, dateFrom: values.dateFrom, dateTo: values.dateTo, timeFrom: values.timeFrom, timeTo: values.timeTo },
        notify: values.notify,
        interval: values.interval,
        start: values.startNow,
      });
      if (values.startNow) toast.success('Monitoring started', { description: `${session.name} is now checking for matching slots.` });
      else toast.success('Session saved', { description: `${session.name} is paused — start it from Monitoring when you’re ready.` });
      navigate(paths.monitoring);
    } catch (err) {
      toast.error('Could not start monitoring', { description: err.message });
      if (err.field === 'learnerIds') goTo(0);
      setSubmitting(false);
    }
  };

  const suggested = defaultsFromLearners((learners || []).filter((l) => values.learnerIds.includes(l.id))).centreIds.length;
  const isLast = step === STEPS.length - 1;
  const noLearners = !loading && !error && learners?.length === 0;

  const body = [
    <StepLearners key="0" learners={learners} loading={loading} error={error} onRetry={reload} value={values.learnerIds} onChange={(ids) => setField('learnerIds', ids)} fieldError={errors.learnerIds} />,
    <StepCentres key="1" value={values.centreIds} onChange={(ids) => setField('centreIds', ids)} error={errors.centreIds} suggestedCount={touched.centres ? 0 : suggested} />,
    <StepDates key="2" values={values} setField={setField} errors={errors} />,
    <StepTimes key="3" values={values} setField={setField} errors={errors} />,
    <StepNotify key="4" values={values} setField={setField} errors={errors} />,
    <StepReview key="5" values={values} learners={learners} onEdit={goTo} />,
  ][step];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="New monitoring"
        description="Set up a monitoring session in a few steps. You can pause or change it at any time."
        breadcrumbs={[{ label: 'Monitoring', to: paths.monitoring }, { label: 'New monitoring' }]}
        actions={
          <Button variant="ghost" leftIcon={X} to={paths.monitoring}>
            Cancel
          </Button>
        }
      />

      <Stepper steps={STEPS} current={step} className="mb-6 sm:mb-8" />

      <Card padded={false} className="overflow-hidden">
        <div className="p-5 sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              Step {step + 1} of {STEPS.length}
            </p>
            <h2 ref={headingRef} tabIndex={-1} className="mt-1.5 text-xl font-semibold text-ink outline-none sm:text-2xl">
              {COPY[step][0]}
            </h2>
            <p className="mt-1 text-sm text-muted">{COPY[step][1]}</p>
          </div>

          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
              {body}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface-muted/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Button variant="ghost" leftIcon={ArrowLeft} onClick={back} disabled={submitting}>
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {isLast ? (
            <Button size="lg" leftIcon={Radar} onClick={submit} loading={submitting}>
              {values.startNow ? 'Start monitoring' : 'Save session'}
            </Button>
          ) : (
            <Button rightIcon={ArrowRight} onClick={next} disabled={step === 0 && (loading || noLearners || Boolean(error))}>
              Continue
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import { Alert, Button, Checkbox, Input } from '@/components/ui';
import { AuthBody, AuthHeading, AuthSwitch } from '@/components/auth/AuthHeading';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { Divider } from '@/components/auth/Divider';
import { DemoCredentials } from '@/components/auth/DemoCredentials';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle, useForm } from '@/hooks';
import { rules } from '@/utils/validation';
import { DEMO_CREDENTIALS } from '@/config/app';
import { paths } from '@/routes/paths';

const schema = {
  email: [rules.required('Email'), rules.email()],
  password: [rules.required('Password')],
};

export default function LoginPage() {
  useDocumentTitle('Sign in');
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');
  const form = useForm({ email: '', password: '', remember: true }, schema);

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError('');
    try {
      const user = await login({ email: values.email.trim(), password: values.password, remember: values.remember });
      toast.success('Signed in', { description: `Welcome back${user.firstName ? `, ${user.firstName}` : ''}.` });
      const from = location.state?.from?.pathname;
      const target = !user.onboardingComplete ? paths.onboarding : from && from !== paths.login ? from : paths.dashboard;
      navigate(target, { replace: true });
    } catch (err) {
      setFormError(err?.message || 'We could not sign you in. Please try again.');
    }
  });

  const fillDemo = () => {
    form.setValues((v) => ({ ...v, email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password }));
    setFormError('');
    document.getElementById('password')?.focus();
  };

  return (
    <>
      <AuthHeading title="Welcome back" description="Sign in to check your learners, live slot matches and monitoring status." />
      <AuthBody>
        <AnimatePresence initial={false}>
          {formError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <Alert tone="danger" title="Sign in failed" onDismiss={() => setFormError('')} className="mb-6">
                {formError}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Input {...form.field('email')} type="email" label="Email" icon={Mail} autoComplete="email" placeholder="you@example.co.uk" required />
          <Input
            {...form.field('password')}
            type="password"
            label="Password"
            icon={Lock}
            autoComplete="current-password"
            placeholder="Your password"
            required
            labelAction={
              <Link to={paths.forgotPassword} className="rounded text-sm font-medium text-brand hover:text-brand-hover hover:underline underline-offset-4">
                Forgot password?
              </Link>
            }
          />
          <Checkbox id="remember" name="remember" label="Remember me" checked={form.values.remember} onChange={(e) => form.setValue('remember', e.target.checked)} />
          <Button type="submit" size="lg" fullWidth loading={form.submitting}>
            {form.submitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <Divider />
        <GoogleButton />

        <AuthSwitch>
          Don&apos;t have an account?{' '}
          <Link to={paths.register} className="font-semibold text-brand hover:text-brand-hover hover:underline underline-offset-4">
            Create one
          </Link>
        </AuthSwitch>

        <DemoCredentials onUse={fillDemo} />
      </AuthBody>
    </>
  );
}

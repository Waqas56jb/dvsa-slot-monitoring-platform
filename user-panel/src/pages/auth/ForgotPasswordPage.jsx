import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, KeyRound, Mail } from 'lucide-react';
import { Alert, Button, Input, SuccessState } from '@/components/ui';
import { AuthBody, AuthHeading } from '@/components/auth/AuthHeading';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle, useForm } from '@/hooks';
import { rules } from '@/utils/validation';
import { paths } from '@/routes/paths';

const schema = { email: [rules.required('Email'), rules.email()] };

function BackToLogin() {
  return (
    <Link to={paths.login} className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-muted hover:text-ink">
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back to sign in
    </Link>
  );
}

export default function ForgotPasswordPage() {
  useDocumentTitle('Forgot password');
  const { requestPasswordReset } = useAuth();
  const toast = useToast();
  const [sentTo, setSentTo] = useState('');
  const [formError, setFormError] = useState('');
  const form = useForm({ email: '' }, schema);

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setFormError('');
    try {
      const clean = email.trim();
      await requestPasswordReset(clean);
      setSentTo(clean);
      toast.success('Reset link requested');
    } catch (err) {
      setFormError(err?.message || 'Something went wrong. Please try again.');
    }
  });

  if (sentTo) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
        <SuccessState
          title="Check your inbox"
          description={`If an account exists for ${sentTo}, we have sent a link to reset your password. The link expires in 60 minutes — check your spam folder if it doesn't arrive.`}
        />
        <div className="mt-8 rounded-2xl border border-dashed border-line-strong bg-surface-muted/60 p-4">
          <p className="text-sm font-semibold text-ink">Demo mode</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            No real email is sent in this preview. Use the button below as a stand-in for the link in the email.
          </p>
          <Button
            to={`${paths.resetPassword}?email=${encodeURIComponent(sentTo)}`}
            variant="secondary"
            fullWidth
            rightIcon={ArrowRight}
            className="mt-3"
          >
            Continue to reset (demo)
          </Button>
        </div>
        <div className="mt-6 flex flex-col items-center gap-1">
          <button type="button" onClick={() => setSentTo('')} className="min-h-11 rounded-lg text-sm font-medium text-brand hover:underline underline-offset-4">
            Use a different email
          </button>
          <BackToLogin />
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <AuthHeading icon={KeyRound} title="Forgot your password?" description="Enter the email you signed up with and we'll send you a secure link to choose a new one." />
      <AuthBody>
        {formError && (
          <Alert tone="danger" onDismiss={() => setFormError('')} className="mb-6">
            {formError}
          </Alert>
        )}
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Input {...form.field('email')} type="email" label="Email" icon={Mail} autoComplete="email" placeholder="you@example.co.uk" required />
          <Button type="submit" size="lg" fullWidth loading={form.submitting}>
            {form.submitting ? 'Sending link…' : 'Send reset link'}
          </Button>
        </form>
        <div className="mt-8 flex justify-center">
          <BackToLogin />
        </div>
      </AuthBody>
    </>
  );
}

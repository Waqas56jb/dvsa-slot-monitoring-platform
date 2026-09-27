import { useState } from 'react';
import { Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

function GoogleG(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.28 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.27a12 12 0 0 0 0 10.76l4.01-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.94 11.94 0 0 0 12 0 12 12 0 0 0 1.27 6.62l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77Z" />
    </svg>
  );
}

/** "Continue with Google" — placeholder until Supabase OAuth is connected. */
export function GoogleButton({ label = 'Continue with Google' }) {
  const { signInWithGoogle } = useAuth();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const onClick = async () => {
    setPending(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      toast.info('Google sign-in not available yet', { description: err?.message || 'Please use email and password for now.' });
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending || undefined}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-line-strong bg-surface text-[15px] font-semibold text-ink shadow-[0_1px_2px_rgb(15_23_42/0.05)] transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
    >
      {pending ? <Spinner className="size-4" /> : <GoogleG className="size-[18px]" />}
      {label}
    </button>
  );
}

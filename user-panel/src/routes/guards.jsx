import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/ui';
import { paths } from './paths';

/** Requires a signed-in user; sends new users to onboarding first. */
export function ProtectedRoute({ children, allowIncompleteOnboarding = false }) {
  const { user, initialising, signedOut } = useAuth();
  const location = useLocation();
  if (initialising) return <LoadingState fullPage label="Loading your workspace…" />;
  if (!user) return <Navigate to={paths.login} replace state={signedOut ? undefined : { from: location }} />;
  if (!allowIncompleteOnboarding && !user.onboardingComplete) return <Navigate to={paths.onboarding} replace />;
  return children;
}

/** Auth pages (login/register) redirect signed-in users to the dashboard. */
export function PublicOnlyRoute({ children }) {
  const { user, initialising } = useAuth();
  const location = useLocation();
  if (initialising) return <LoadingState fullPage />;
  if (user) {
    const from = location.state?.from?.pathname;
    const target = !user.onboardingComplete ? paths.onboarding : from || paths.dashboard;
    return <Navigate to={target} replace />;
  }
  return children;
}

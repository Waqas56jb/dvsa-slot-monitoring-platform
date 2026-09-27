import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '@/services/authService';
import { subscribe } from '@/services/realtime';

const AuthContext = createContext(null);

/**
 * Auth state for the whole app. Components use `useAuth()` and never touch
 * the auth service or storage directly. Swapping the mock for Supabase only
 * changes `authService`, not this context's API.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialising, setInitialising] = useState(true);
  // True after an explicit sign-out, so guards don't send the next sign-in
  // back to the page the previous session was on.
  const [signedOut, setSignedOut] = useState(false);

  const getCurrentUser = useCallback(async () => {
    const u = await authService.getCurrentUser();
    setUser(u);
    return u;
  }, []);

  useEffect(() => {
    getCurrentUser().finally(() => setInitialising(false));
  }, [getCurrentUser]);

  // Keep the user object fresh after profile/onboarding updates.
  useEffect(() => subscribe('user', () => getCurrentUser()), [getCurrentUser]);

  const login = useCallback(async (credentials) => {
    const u = await authService.login(credentials);
    setSignedOut(false);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const u = await authService.register(data);
    setSignedOut(false);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSignedOut(true);
    setUser(null);
  }, []);

  const requestPasswordReset = useCallback((email) => authService.requestPasswordReset(email), []);
  const resetPassword = useCallback((data) => authService.resetPassword(data), []);
  const signInWithGoogle = useCallback(() => authService.signInWithGoogle(), []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initialising,
      signedOut,
      login,
      register,
      logout,
      getCurrentUser,
      requestPasswordReset,
      resetPassword,
      signInWithGoogle,
    }),
    [user, initialising, signedOut, login, register, logout, getCurrentUser, requestPasswordReset, resetPassword, signInWithGoogle],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

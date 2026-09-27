import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingState } from '@/components/ui';
import { ProtectedRoute, PublicOnlyRoute } from './guards';

// Layouts
const PublicLayout = lazy(() => import('@/layouts/PublicLayout'));
const AuthLayout = lazy(() => import('@/layouts/AuthLayout'));
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'));

// Public pages
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const FeaturesPage = lazy(() => import('@/pages/public/FeaturesPage'));
const HowItWorksPage = lazy(() => import('@/pages/public/HowItWorksPage'));
const PricingPage = lazy(() => import('@/pages/public/PricingPage'));
const FaqPage = lazy(() => import('@/pages/public/FaqPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const LegalPage = lazy(() => import('@/pages/public/LegalPage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));

// Auth
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const OnboardingPage = lazy(() => import('@/pages/onboarding/OnboardingPage'));

// Dashboard
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const LearnersPage = lazy(() => import('@/pages/dashboard/LearnersPage'));
const LearnerFormPage = lazy(() => import('@/pages/dashboard/LearnerFormPage'));
const LearnerDetailsPage = lazy(() => import('@/pages/dashboard/LearnerDetailsPage'));
const SlotsPage = lazy(() => import('@/pages/dashboard/SlotsPage'));
const SlotDetailsPage = lazy(() => import('@/pages/dashboard/SlotDetailsPage'));
const MonitoringPage = lazy(() => import('@/pages/dashboard/MonitoringPage'));
const NewMonitoringPage = lazy(() => import('@/pages/dashboard/NewMonitoringPage'));
const NotificationsPage = lazy(() => import('@/pages/dashboard/NotificationsPage'));
const HistoryPage = lazy(() => import('@/pages/dashboard/HistoryPage'));
const ProfilePage = lazy(() => import('@/pages/dashboard/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/dashboard/SettingsPage'));
const HelpPage = lazy(() => import('@/pages/dashboard/HelpPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState fullPage />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="features" element={<FeaturesPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="privacy" element={<LegalPage doc="privacy" />} />
          <Route path="terms" element={<LegalPage doc="terms" />} />
          <Route path="cookies" element={<LegalPage doc="cookies" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<PublicOnlyRoute><AuthLayout /></PublicOnlyRoute>}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route
          path="onboarding"
          element={
            <ProtectedRoute allowIncompleteOnboarding>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="learners" element={<LearnersPage />} />
          <Route path="learners/new" element={<LearnerFormPage />} />
          <Route path="learners/:id" element={<LearnerDetailsPage />} />
          <Route path="learners/:id/edit" element={<LearnerFormPage />} />
          <Route path="slots" element={<SlotsPage />} />
          <Route path="slots/:id" element={<SlotDetailsPage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="monitoring/new" element={<NewMonitoringPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="*" element={<NotFoundPage inDashboard />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

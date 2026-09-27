import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { ThemeProvider } from '@/context/ThemeContext'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { RealtimeProvider } from '@/context/RealtimeContext'
import { AppRoutes } from '@/routes/AppRoutes'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ThemeProvider>
          <AdminAuthProvider>
            <NotificationProvider>
              <RealtimeProvider>
                <AppRoutes />
              </RealtimeProvider>
            </NotificationProvider>
          </AdminAuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </MotionConfig>
  )
}

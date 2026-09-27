# SlotPilot — User Panel

The customer-facing web app for **SlotPilot**, a UK driving-test slot monitoring and alert platform for driving instructors, driving schools and learners.

SlotPilot **monitors and alerts** — it never books tests and never bypasses DVSA security, CAPTCHA, sign-in or anti-bot controls. The user always completes the final booking on the official GOV.UK service.

> This phase is **frontend only**. All data comes from a local mock service layer, and monitoring is a clearly labelled in-browser simulation. The structure is ready for a Node.js/Express API and Supabase.

## Quick start

```bash
cd user-panel
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the production build
```

**Demo account:** `ahmed@slotpilot.demo` / `Demo1234!` (also offered on the login page).
Registering a new account takes you through onboarding with an empty workspace.
Settings → Account → *Reset demo data* restores the seeded demo workspace.

## Tech stack

React 19 · Vite · React Router · Tailwind CSS v4 · Framer Motion · Lucide icons · Recharts. Plain JavaScript/JSX.

## Project structure

```
src/
  assets/          static assets (images are remote — nothing copyrighted is stored locally)
  components/
    ui/            design-system primitives (Button, Input, Modal, Tabs, Table, Toast…)
    brand/         logo
    layout/        site header/footer, dashboard sidebar, topbar, mobile tab bar
    marketing/     landing-page sections
    auth/          auth form pieces
    onboarding/    onboarding wizard steps
    dashboard/     product components (SlotCard, LearnerCard, CentrePicker, alerts…)
    feedback/      toast viewport
  config/          public app config, navigation, feature settings
  context/         AuthContext, ThemeContext, ToastContext, MonitoringContext
  data/            ALL mock/seed data and static content (centres, learners, pricing, FAQ…)
  hooks/           useResource, useForm, useAsyncAction, useDebounce, useCountUp…
  layouts/         PublicLayout, AuthLayout, DashboardLayout
  pages/           route pages (public, auth, onboarding, dashboard)
  routes/          route table (lazy-loaded), guards, path helpers
  services/        the service layer — the only code that touches data
  styles/          Tailwind entry + design tokens (light & dark)
  utils/           formatting, validation, storage, sound, browser notifications
```

## Architecture

```
Pages & components
   │  (hooks: useResource / useAsyncAction / contexts)
   ▼
services/*Service.js        ← stable API used by the UI
   │  today: mockDb.js (localStorage) + monitoringSimulator.js
   │  later: apiClient.js → Node.js / Express API
   ▼
Node.js API  →  Supabase (Postgres, Auth, Realtime)  →  monitoring / detection workers
```

- **No data access in components.** Pages call `authService`, `learnerService`, `monitoringService`, `slotService`, `notificationService`, `userService`, `activityService`, `centreService`, `dashboardService` — never `fetch`/`axios` or storage directly.
- **Realtime-ready.** `services/realtime.js` is a small pub/sub channel. Services publish on `learners`, `slots`, `notifications`, `monitoring`, `activity`, `user`; `useResource(..., { topics })` refreshes silently. Swap its source for Supabase Realtime or a WebSocket later without touching pages.
- **Auth.** `AuthContext` exposes `login`, `register`, `logout`, `getCurrentUser`, `resetPassword` (plus `requestPasswordReset`, `signInWithGoogle`). The mock hashes passwords (SHA-256) and persists the session in localStorage ("remember me") or sessionStorage. Replace `authService` with Supabase Auth; the context API stays the same.
- **Monitoring simulation.** `MonitoringContext` + `services/monitoringSimulator.js` generate check events and occasional matches while monitoring is active, then raise the top-right slot alert, an optional chime (Web Audio, only after a user gesture) and an optional browser notification (only with permission). In production this is replaced by server-side monitoring events.
- **Official booking.** "Open Official Booking" opens the GOV.UK service in a new tab (`config/app.js → OFFICIAL_BOOKING_URLS`) and records the slot as actioned. There is no automation of the booking flow.

## Connecting the backend (next phase)

1. Set `VITE_API_BASE_URL` in `.env` (see `.env.example`).
2. In each service, replace the mock body with the `api.*` call listed in that file's header comment (e.g. `learnerService.list` → `GET /learners`). Return the same shapes the UI already uses (see `services/selectors.js` for the joined read models).
3. Replace `authService` with Supabase Auth and send the access token via `apiClient.js`.
4. Replace the simulator in `MonitoringContext` with a realtime subscription to monitoring/slot events.
5. Delete `services/mockDb.js`, `services/monitoringSimulator.js` and the seed builders in `data/`.

## Security principles

- Only public configuration is exposed to the browser (`VITE_*`). **Never** put API secrets, OpenAI keys, Supabase service-role keys or private credentials in this app.
- Sensitive learner reference/licence details are not collected in the browser; the UI explains they will be handled by the backend.
- All privileged operations will run on the Node.js backend.

## Theming & accessibility

- Semantic colour tokens (`bg-surface`, `text-ink`, `border-line`, `bg-brand`, `text-success-ink`…) are defined once in `styles/index.css` for light and dark themes. Appearance can be set to Light, Dark or System in Settings.
- Semantic HTML, labelled controls, keyboard-navigable menus/tabs/dialogs, focus trapping in modals, visible focus rings, 44px touch targets, reduced-motion support.

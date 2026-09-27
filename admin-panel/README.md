# SlotPilot Admin Panel

Internal admin console for **SlotPilot** — *Driving Test Monitoring, Built for Speed.*
Frontend only: React 19 · Vite · Tailwind CSS v4 · React Router 7 · Framer Motion · Recharts · lucide-react.

All data currently comes from an in-browser mock layer. Every screen is written against a service interface, so connecting the Node.js/Express + Supabase backend means implementing API calls, not rewriting UI.

## Getting started

```bash
cd admin-panel
npm install
cp .env.example .env   # already present for local dev
npm run dev            # http://localhost:5180
npm run build          # production build → dist/
```

### Demo accounts (mock mode)

The password for every demo account is `SlotPilot!2026`. The login screen also has one-click buttons for these accounts.

| Role | Email | What you'll see |
|---|---|---|
| Super Admin | amelia.hart@slotpilot.io | Everything, including Admins and Settings |
| Operations Admin | rhys.morgan@slotpilot.io | Operations and billing. Can view Settings but not change them, and has no admin management |
| Support Admin | priya.nair@slotpilot.io | Users, tickets and notifications. Most other areas are read-only |
| Analyst | tom.whitaker@slotpilot.io | Read-only analytics and audit data |

A login email containing `offline` simulates a network failure. Sign-in fails for `sofia.rossi@…` (the invite hasn't been accepted) and for `daniel.price@…` (the account is suspended).

## Environment

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the admin API, for example `https://api.example.com`. |
| `VITE_APP_NAME` | Product name shown in the UI. Default: `SlotPilot`. |
| `VITE_USE_MOCKS` | `true` uses the mock services and simulated realtime. Set it to `false` and set `VITE_API_BASE_URL` to use the real API. |

Every `VITE_*` value ends up in the browser bundle. **Never** put Supabase service-role keys, payment secrets, SMS or email provider keys, or any other credential in these files.

## Architecture

```text
src/
  components/   common/ tables/ charts/ forms/ modals/ layout/ notifications/ monitoring/
  pages/admin/  one folder per section (auth, dashboard, users, learners, monitoring, …)
  services/     one service per domain: identical mock + API implementations
  data/         deterministic, realistic mock data (seeded PRNG)
  context/      AdminAuthContext, NotificationContext (toasts + inbox), ThemeContext, RealtimeContext
  hooks/        useListQuery (URL-synced search/filter/sort/paging), useAsync, useExport, …
  lib/          apiClient, session, realtime bus, mock helpers, mock audit recorder
  constants/    config, roles and permissions, status→tone map, navigation
  routes/       route table (lazy-loaded pages), ProtectedAdminRoute, RequirePermission, PermissionGate
  utils/        formatting (UK timezone), CSV export, list query helper
```

### Services: switching from mocks to the API

Each file in `src/services/` exports one object built with `defineService(mock, api)`. `VITE_USE_MOCKS` decides which implementation is used. Both implementations return the same shapes:

- **List methods** return `{ data, total, page, pageSize }`. They accept `{ search, filters, sort, order, page, pageSize }`, which becomes query params (for example `GET /api/admin/users?status=Active&page=2`).
- **Detail methods** return the entity with its related records embedded.
- **Mutations** return the updated entity.

The API half of each service already contains the intended endpoints, such as `POST /api/admin/monitoring/:id/pause`. `src/lib/apiClient.js` handles the base URL, the bearer token, timeouts, error normalisation (`ApiError`), and signing out on a 401.

### Realtime

Components subscribe to channels on `src/lib/realtime.js`: `slot`, `activity`, `heartbeat`, `stats`, `audit` and `inbox`. In mock mode, `RealtimeContext` publishes calm, believable events (a new slot every 20–40 s and worker heartbeats every 4 s). In production, the same channels can be fed from Supabase Realtime or a server-sent-events stream. You can pause live mode from the dashboard's activity panel.

### Permissions

`src/constants/permissions.js` defines four roles and their permission sets. There are three layers of gating:

1. **Navigation:** the sidebar hides sections the admin can't access.
2. **Routes:** `RequirePermission` shows an "Access restricted" screen.
3. **Actions:** `can(permission)` and `<PermissionGate mode="hide|disable|restrict">`.

This is UI-only. **The backend must enforce every permission**, using Express middleware and Supabase RLS.

### Auditing

In mock mode, every admin mutation calls `recordAdminAction()`. It writes an audit log entry and an activity event, and publishes both live. The backend should produce the same records server-side.

## Compliance notes

The UI shows backend-provided availability data only. It contains no scraping, automated booking, CAPTCHA or anti-bot circumvention, and it stores no DVSA credentials. A slot moves through these stages: **Detected → Matched → User alerted → User action**. "Booked" appears only when the backend confirms it, and admins can't set it by hand. Learner licence references are masked everywhere. Revealing one needs a specific permission, and each reveal is audited.

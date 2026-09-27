# SlotPilot Admin — contributing guide

Stack: React 19 + Vite 8 + Tailwind v4 (tokens in `src/index.css`) + React Router 7 + Framer Motion + Recharts + lucide-react.
Path alias `@/` → `src/`. JavaScript/JSX only.

## Read these first (the reference implementation)
- `src/pages/admin/users/UsersPage.jsx` + `UserFormModal.jsx` — THE canonical list page + form modal. Copy its structure.
- `src/components/common/*`, `src/components/tables/*`, `src/components/charts/*`, `src/components/modals/*`, `src/components/forms/Fields.jsx`
- `src/hooks/useListQuery.js`, `useAsync.js`, `useUtils.js`, `useExport.js`
- `src/routes/guards.jsx` (PermissionGate), `src/constants/*`, `src/utils/format.js`
- Your services in `src/services/*` and data in `src/data/*`

## Rules
1. **Pages are default exports** at the exact file paths already stubbed (replace the stub).
2. **Only use semantic colour tokens** (bg-surface, bg-subtle, bg-muted, bg-canvas, text-ink/ink-2/ink-3/ink-4, border-line/line-strong, brand-50…900, success/warning/danger/info/neutral + `-soft`/`-dot`). Never raw Tailwind palette colours (no `bg-gray-100`, `text-blue-600`, etc.) — dark mode depends on this.
3. Typography scale: page title via `PageHeader`; card titles via `Card title`; body `text-sm`; secondary `text-[13px] text-ink-3`; meta `text-xs text-ink-4`. Numbers in tables: `tabular`. IDs: `CopyId` or `font-mono text-[12.5px]`.
4. Layout: stack of `Card`s / `DataTable` with `gap-6` / `space-y-6`. Grids must collapse on mobile (`grid gap-6 lg:grid-cols-3` etc.). No horizontal page overflow — use `min-w-0` on flex/grid children.
5. **Lists**: `useListQuery(service.getX, { filterKeys, arrayKeys, defaultSort })` + `DataTable` + `FilterBar`/`FilterDropdown`/`buildChips`. Give columns `mobile: 'primary' | 'badge'` roles. Include search, filters, sort, pagination, reset filters, empty state (`emptyIcon/emptyTitle/emptyDescription`), `filtered`/`onResetFilters`, loading/error (DataTable handles them).
6. **Named filters**: if a filter isn't a plain equality on a row field (date ranges, "has X", etc.), add a `xFilters()` mapper in the service like `userFilters()` in `userService.js` — the page passes plain strings; the mock turns them into predicates; the API receives them verbatim.
7. **Detail pages**: `useAsync(() => service.getXById(id), [id])`. Loading → `<SkeletonDetail />`. Error → `<ErrorState onRetry={reload} showBack />` inside a `card` (404s show "not found" copy). Use `PageHeader` with `back={{ to, label }}`, `meta={<StatusBadge/>}`, actions. Use `Tabs` for multi-section pages, `DescriptionList`, `MetricStrip`, `ActivityTimeline`.
8. **Mutations**: dangerous → `useConfirm()` (`requireReason` for suspend/stop/refund; `typeToConfirm` for delete). After success: toast via `useToast()`, update UI immediately (patch local state / `setData` / `list.patchRow`), and the service already writes an audit + activity entry via `recordAdminAction`. Errors → toast.error(err.message) (ConfirmModal shows errors inline automatically).
9. **Permissions**: gate every action with `can(P.X)` / `<PermissionGate permission mode="hide|disable">`. Route-level gating is already done.
10. **Forms**: controlled, `FormField` with label/required/hint/error, validation before submit, loading button, Cancel, success toast. Pattern = `UserFormModal.jsx`.
11. **Exports**: `useExport().runExport({ name, columns, fetch })` behind `P.EXPORT`.
12. **Realtime** (where relevant): `useRealtime('slot' | 'activity' | 'heartbeat' | 'stats' | 'audit', cb)`.
13. **Compliance**: never show/imply CAPTCHA bypass, bot evasion, automated booking, or DVSA credentials. Slots progress Detected → Matched → Alerted → user action. Show "Booked" only as a backend-confirmed status. Mask sensitive identifiers (licence refs via `licenceMasked` + `MaskedValue` gated by `P.LEARNERS_REVEAL`).
14. Dates/times ONLY via `@/utils/format` (formatDate, formatDateTime, formatTime, formatRelative, formatCurrency…).
15. Keep components small; extract page-local subcomponents into files in the same page folder when a file passes ~300 lines.
16. Prefer page-local components; change shared components (`components/*`, `hooks/`, `lib/`, `context/`) deliberately and keep their APIs backward compatible.
17. Verify with `npm run build` from `admin-panel/`.
18. Copy tone: concise, professional British English ("Monitoring job paused.", "Unable to load payments. Please try again.").

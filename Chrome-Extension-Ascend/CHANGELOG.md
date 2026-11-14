# Ascend Chrome Extension — Changelog

All notable changes to the Ascend Chrome Extension project are documented in this file.

---

## [1.0.1] - 2026-11-14

### Fixed
- **Supabase OAuth Redirect to Website**:
  - Identified root cause of auth popup redirecting to web app: Supabase falls back to `Site URL` when `chromiumapp.org` redirect is not allowlisted in Supabase Dashboard.
  - Added dynamic display of extension's `chrome.identity.getRedirectURL()` on `LoginView` with 1-click clipboard copy.
  - Added instructions to add `https://*.chromiumapp.org/**` wildcard to Supabase Redirect URLs.
- **Chrome Identity Web Auth Flow Concurrency**:
  - Added `isAuthenticatingRef` and button disabled state to prevent duplicate concurrent auth flows causing `Error: Only one web auth flow is allowed at a time`.
  - Added custom error handling catching pending Chrome auth windows with guidance to reload extension in `chrome://extensions`.
  - Added a "Cancel sign-in" button on `LoginView` to reset loading state if a window was closed or hung.
- **Supabase PKCE & Implicit Session Handling**:
  - Implemented `chromeStorageAdapter` in `src/lib/supabase.js` using `chrome.storage.local` to safely preserve PKCE `code_verifier` across extensions.
  - Added `supabase.auth.exchangeCodeForSession(code)` support alongside token hash parsing for both PKCE and implicit OAuth responses.

---

## [1.0.0] - 2026-11-12

### Added
- **Design System & Theme Integration (`THEME.md`)**:
  - Implemented **Deep Seafoam** (Light theme) and **Forest Green** (Dark theme) with semantic CSS variable tokens.
  - Implemented `ThemeContext` supporting Light, Dark, and System preference with persistence in `chrome.storage.local`.
- **Extension Infrastructure**:
  - Manifest V3 configured with `sidePanel`, `storage`, and `identity` permissions.
  - Configured Vite build producing clean `dist/` with `background.js`, `sidepanel.html`, and `dist/icons/`.
  - Built background service worker setting `openPanelOnActionClick: true`.
- **Authentication**:
  - Google Sign-In with Supabase (`chrome.identity.launchWebAuthFlow`) exchanging verified token against Spring Boot `/api/auth/register-oauth`.
  - JWT storage in `chrome.storage.local` with automatic 401 interception and logout.
  - Developer token input option for local debugging.
- **Home Dashboard & Habit Tracker**:
  - `TodayProgressCard` with SVG completion ring, daily streak counter, and challenge day count.
  - `HabitQuickStrip` enabling 1-click status cycling (`PENDING` -> `COMPLETED` -> `MISSED` -> `SKIPPED`) with optimistic UI and backend sync to `PUT /api/habits/{id}/logs`.
  - `HabitModal` supporting habit creation/editing with icon picker and schedule settings.
- **Task Management**:
  - `InlineTaskInput` directly on the Home dashboard with Enter-to-submit and priority selectors.
  - `TaskRow` with 1-click completion checkbox, priority badges, overdue indicators, and contextual edit/delete.
  - Filter tabs (`All`, `Open`, `Done`).
  - Integrated milestone checklist items directly in the today task feed.
- **Active Projects & Milestones**:
  - `ProjectSummaryRow` on dashboard displaying progress bars and milestone counts.
  - `ProjectDetailModal` for expanding milestones and ticking off child checklist items.
- **Build & Packaging**:
  - Production build generated in `dist/`.

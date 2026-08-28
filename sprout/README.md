# Sprout — Phases 1, 2 & 3

A 75-day habit tracker.

- **Phase 1** — project scaffolding, registration, login, JWT auth, protected routes, user
  profile, dark/light mode, Linear/Notion-style sidebar layout.
- **Phase 2** — daily recurring habits, auto-generated challenge days ("Day N"), today's
  motivational quote, mark complete/missed with notes, and completion history stored per day.
- **Phase 3** — a journal entry for every day: mood, gratitude, a two-part reflection, a
  markdown free-write with live preview, and photo uploads. Reachable straight from the
  current day's Dashboard.

**Not yet built:** calendar sync, analytics/heatmap, leaderboard, social feed — those come in
later phases.

```
sprout/
├── backend/     Spring Boot 3.3 · Java 17 · PostgreSQL · JWT
└── frontend/    React 18 · Vite · Tailwind CSS · React Router
```

---

## Prerequisites

| Tool | Version | Check with |
|---|---|---|
| Java (JDK) | 17+ | `java -version` |
| Maven | 3.9+ (or use the wrapper you generate — see below) | `mvn -version` |
| Node.js | 18+ | `node -v` |
| PostgreSQL | 14+ | `psql --version` |

This project doesn't ship a Maven wrapper. If you don't have Maven installed globally, run
`mvn -N wrapper:wrapper` once inside `backend/` to generate `mvnw` / `mvnw.cmd`.

---

## 1. Database

Create a local database and (optionally) a matching test database:

```bash
createdb sprout
createdb sprout_test   # only needed if you run the backend test suite
```

If you'd rather not use the `createdb` CLI, any Postgres GUI (TablePlus, pgAdmin, etc.) works
the same way — just create a database named `sprout`.

---

## 2. Backend

```bash
cd backend
```

### Configure environment variables

`application.yml` reads all secrets and connection details from environment variables, with
dev-friendly defaults so the app still boots without any setup. For anything beyond your own
machine, set these for real:

| Variable | Purpose | Local default |
|---|---|---|
| `DB_NAME` | Postgres database name | `sprout` |
| `DB_USERNAME` | Postgres username | `postgres` |
| `DB_PASSWORD` | Postgres password | `postgres` |
| `JWT_SECRET` | HMAC signing key for JWTs — **must** be 32+ characters | a dev-only placeholder |
| `JWT_EXPIRATION_MS` | Token lifetime in milliseconds | `86400000` (24h) |
| `CORS_ALLOWED_ORIGIN` | Origin allowed to call the API | `http://localhost:5173` |
| `CHALLENGE_TOTAL_DAYS` | Length of the challenge, for the "Day N of ___" display | `75` |
| `UPLOADS_DIR` | Where journal photos are written on disk | `./uploads` (relative to wherever the app runs) |

See `src/main/resources/application-example.yml` for a copy-pasteable reference. Export them in
your shell, an `.env` loaded by your shell profile, or your IDE's run configuration — just don't
commit real secrets.

```bash
export DB_PASSWORD=your-local-postgres-password
export JWT_SECRET=$(openssl rand -base64 48)
```

### Run it

```bash
mvn spring-boot:run
# or, once you've generated the wrapper:
./mvnw spring-boot:run
```

The API starts on **http://localhost:8080**. On first boot, Hibernate creates the `users` table
automatically (`ddl-auto: update`) — fine for this phase; swap in Flyway or Liquibase before this
goes anywhere near production.

### Try it

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Rucha","username":"rucha","email":"rucha@example.com","password":"grow-slowly"}'

# Login (returns the same shape: { token, tokenType, user })
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rucha@example.com","password":"grow-slowly"}'

# Call a protected route with the token from either response above
curl http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <token>"
```

### Endpoints in this phase

| Method | Path | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account, returns a token + user |
| POST | `/api/auth/login` | No | Authenticate, returns a token + user |
| GET | `/api/users/me` | Yes | Current user's profile |
| PATCH | `/api/users/me` | Yes | Update `name`, `bio`, `timezone` |

#### Phase 2 — habits, days, completion history

| Method | Path | Auth required | Description |
|---|---|---|---|
| POST | `/api/habits` | Yes | Create a daily habit (`title`, `icon`, `color`, optional `reminderTime`) |
| GET | `/api/habits` | Yes | List your active habits |
| PATCH | `/api/habits/{id}` | Yes | Update a habit (partial — send only the fields you're changing) |
| DELETE | `/api/habits/{id}` | Yes | Soft-delete a habit (history is kept, it just stops showing up) |
| GET | `/api/days/today` | Yes | Day number, today's quote, today's habits + status, completion % |
| GET | `/api/days/{dayNumber}` | Yes | Same payload for any day of the challenge (1–365) |
| PUT | `/api/habits/{habitId}/logs?date=` | Yes | Mark/re-mark a habit's status + note for a date (defaults to today) — upsert, one row per habit per day |
| GET | `/api/habits/{habitId}/logs?from=&to=` | Yes | That habit's completion history (optionally bounded by date) |

`status` accepts `COMPLETED`, `MISSED`, or `SKIPPED`. There's no `PENDING` status to send —
it's just what a day looks like before any log exists for it.

```bash
TOKEN="<paste a token from /api/auth/login>"

# Create a habit
curl -X POST http://localhost:8080/api/habits \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Drink 3L water","icon":"Droplet","color":"#8FA6FF","reminderTime":"09:00"}'

# See today
curl http://localhost:8080/api/days/today -H "Authorization: Bearer $TOKEN"

# Mark habit 1 complete today, with a note
curl -X PUT http://localhost:8080/api/habits/1/logs \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"COMPLETED","note":"Refilled the bottle twice"}'

# That habit's history
curl http://localhost:8080/api/habits/1/logs -H "Authorization: Bearer $TOKEN"
```

#### Phase 3 — journal

| Method | Path | Auth required | Description |
|---|---|---|---|
| GET | `/api/journal/{date}` | Yes | That day's entry — returns an empty shell (`id: null`) if nothing's saved yet |
| PUT | `/api/journal/{date}` | Yes | Save the entry: `mood`, `gratitude`, `wentWell`, `couldImprove`, `content` — full replace, not a partial patch |
| POST | `/api/journal/{date}/images` | Yes | Upload a photo (`multipart/form-data`, field `file`) — PNG/JPEG/WEBP/GIF, 8MB max |
| DELETE | `/api/journal/{date}/images/{imageId}` | Yes | Remove a photo (deletes the DB row and the file on disk) |
| GET | `/api/journal/images/{imageId}/file` | Yes | Streams the raw image bytes |

`mood` accepts `GREAT`, `GOOD`, `OKAY`, `ROUGH`, or `HARD` (or omit it to leave the mood unset).
`date` is a plain ISO date (`YYYY-MM-DD`) — there's no separate "day number" route here; the
Dashboard already knows today's exact date from `/api/days/today` and links straight to it.

The image endpoint requires the same Bearer token as everything else, which is why the frontend
fetches photos with axios (as a blob, turned into an object URL) instead of a plain `<img src>` —
journal photos are personal, so they're not sitting at a guessable public URL.

```bash
# Save today's entry
curl -X PUT http://localhost:8080/api/journal/2026-08-25 \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"mood":"GOOD","gratitude":"Slept well","wentWell":"Finished the 5k","couldImprove":"Skipped stretching","content":"Solid day. **Legs are tired** though."}'

# Read it back
curl http://localhost:8080/api/journal/2026-08-25 -H "Authorization: Bearer $TOKEN"

# Upload a photo
curl -X POST http://localhost:8080/api/journal/2026-08-25/images \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/photo.jpg"
```

---

## 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # defaults to http://localhost:8080/api — change if your API runs elsewhere
npm run dev
```

Opens on **http://localhost:5173**.

### What's wired up

- **Register / Login** — plain forms, no styling framework beyond Tailwind, posting straight to
  the backend's `/api/auth/*` endpoints.
- **JWT storage** — the token and cached user are kept in `localStorage` and attached to every
  request by an axios interceptor. A 401 response clears both and bounces you to `/login`.
  This is the simplest option for Phase 1; if this app ever needs to resist XSS more seriously,
  move the token into an httpOnly cookie set by the backend instead.
- **Protected routes** — `<ProtectedRoute />` checks auth state before rendering `/` and
  `/profile`; unauthenticated visitors are redirected to `/login`.
- **Sidebar layout** — a persistent left sidebar (Dashboard, Profile, user info, log out) wrapping
  every protected page, in the spirit of Linear/Notion.
- **Dark / light mode** — toggled from the top bar, persisted in `localStorage`, applied via a
  `.dark` class on `<html>` that flips a small set of CSS variables (`--bg`, `--surface`,
  `--text`, etc.) — the same variable-driven approach used in the Sprout dashboard prototype.
- **Dashboard** — now the real Phase 2 view: today's day-number badge, quote, a completion ring,
  and every active habit with a status marker (tap to cycle Complete → Missed → Skipped) and an
  inline note field (saves on blur). Empty state points you at the Habits page if you have none
  yet.
- **Habits page** — create a habit (title, icon picker, color swatch, optional reminder time),
  and edit or delete existing ones inline. This is habit *definitions*; marking a day's status
  happens on the Dashboard.
- **Profile page** — edit name, bio, and timezone against `PATCH /api/users/me`.
- **Journal page** — mood picker, the two-part reflection + gratitude prompts, a markdown
  free-write with an Edit/Preview toggle (rendered via `react-markdown`), and photo upload with
  a delete-on-hover grid. Reached either from the sidebar (which resolves "today" from the
  server before loading) or from the new journal card on the Dashboard, which links straight to
  the current day's exact date and shows whether you've already started that entry.

---

## Project structure

```
backend/src/main/java/com/sprout/backend/
├── SproutBackendApplication.java
├── config/                             SecurityConfig, DataSeeder (seeds the quote rotation)
├── controller/                         AuthController, UserController,
│                                        HabitController, HabitLogController, DayController,
│                                        JournalController
├── dto/request/                        RegisterRequest, LoginRequest, UpdateProfileRequest,
│                                        CreateHabitRequest, UpdateHabitRequest, MarkHabitLogRequest,
│                                        UpsertJournalRequest
├── dto/response/                       AuthResponse, UserResponse,
│                                        HabitResponse, HabitLogResponse, HabitStatusResponse, TodayResponse,
│                                        JournalResponse, JournalImageResponse
├── entity/                             User, Habit, HabitLog, HabitStatus (enum), Quote,
│                                        JournalEntry, JournalImage, JournalMood (enum)
├── exception/                          ApiException, ErrorResponse, GlobalExceptionHandler
├── repository/                         UserRepository, HabitRepository, HabitLogRepository, QuoteRepository,
│                                        JournalEntryRepository, JournalImageRepository
├── security/                           JwtService, JwtAuthenticationFilter,
│                                        UserPrincipal, UserDetailsServiceImpl
├── service/                            AuthService, UserService, UserMapper,
│                                        HabitService, HabitLogService, HabitMapper,
│                                        QuoteService, DayService, JournalService
└── util/ChallengeDayCalculator.java     Shared start-date ⇄ day-number ⇄ date math (Days + Journal)

frontend/src/
├── api/                                axios.js (client + interceptors), habits.js, days.js, journal.js
├── context/                            AuthContext, ThemeContext
├── components/                         Sidebar, Layout, ProtectedRoute, ThemeToggle
├── lib/habitIcons.js                   Icon-name → lucide-react component map, color palette
├── pages/                              Login, Register, Dashboard, Habits, Journal, Profile
├── App.jsx                             Route definitions
└── main.jsx
```

---

## Notes & what's deliberately not here yet

- **Passwords** are hashed with BCrypt (`spring-boot-starter-security`'s default) — never stored
  or logged in plain text.
- **No refresh tokens** in this phase — tokens simply expire after `JWT_EXPIRATION_MS` and the
  person logs in again. Refresh tokens are a reasonable Phase 2+ addition once habits/streaks
  make session length matter more.
- **No email verification** — the original spec listed it as optional; skipped here to keep this
  phase focused on the auth loop.
- **No rate limiting** on `/api/auth/*` yet — worth adding before this is public-facing.
- **One log per habit per day** is enforced at the database level (a unique constraint on
  `habit_id` + `log_date`), so marking a day twice updates that day's row instead of duplicating
  it — this *is* the completion history the habits carry forward.
- **Streaks aren't computed yet.** `currentStreak` / `longestStreak` already exist on `User` from
  Phase 1, but what should count toward a streak — every habit done, most of them, any activity
  at all — wasn't specified here, so I left them unset rather than guess. Good candidate for
  Phase 3 alongside the heatmap and analytics.
- **Deleting a habit is a soft delete** (`active = false`) specifically so its history doesn't
  disappear from the database if it's ever surfaced again in analytics.
- **Reminders are stored, not sent.** There's no notification/push system yet — `reminderTime`
  is just a time-of-day value waiting for that feature.
- **Journal images live on local disk**, not object storage — fine for one server, not fine for
  anything horizontally scaled or ephemeral (containers, ephemeral filesystems). Swapping the
  storage calls in `JournalService` for an S3-compatible client is a contained change whenever
  that matters; the `JournalImage` DTO/entity shape doesn't need to move to make that swap.
- **One journal entry per calendar date**, same unique-constraint pattern as habit logs — saving
  twice in one day overwrites, it doesn't create a second entry.
- Calendar sync, analytics/heatmap, leaderboard, and social features are all still ahead, and
  match the tabs already mocked up in the Sprout frontend prototype.

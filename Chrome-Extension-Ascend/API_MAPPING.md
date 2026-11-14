# Ascend Chrome Extension — API Mapping Specification

This document maps all Chrome Extension user actions and interface components to the existing Spring Boot REST API endpoints.

**Backend Base URL:** `http://localhost:8080/api` (configurable via `VITE_API_URL`)  
**Authorization Format:** Standard HTTP Header: `Authorization: Bearer <JWT>`

---

## 1. Authentication & User Profile

| UI Action / Feature | HTTP Method | Endpoint | Request Payload / Params | Response Payload | Error Handling & Status Codes |
|---|---|---|---|---|---|
| **Google Sign-In Exchange** | `POST` | `/api/auth/register-oauth` *(or dedicated extension Google exchange endpoint)* | Header: `Authorization: Bearer <OAuth/ID_Token>` | `{ "token": "string", "user": UserResponse }` | `401 Unauthorized` (invalid Google token), `400 Bad Request` |
| **Get Authenticated User** | `GET` | `/api/users/me` | None (Bearer token in Header) | `UserResponse` (`id`, `name`, `username`, `email`, `currentStreak`, `longestStreak`, etc.) | `401 Unauthorized` -> clears token, prompts Google login |
| **Update User Profile (optional)** | `PATCH` | `/api/users/me` | `{ "name": "string", "bio": "string", "timezone": "string" }` | `UserResponse` | `400 Bad Request`, `401 Unauthorized` |

---

## 2. Home Dashboard (Daily Overview & Today Workspace)

The Home Dashboard relies on two primary aggregated calls to assemble today's command center:

| UI Action / Feature | HTTP Method | Endpoint | Request Payload / Params | Response Payload | Description / Usage |
|---|---|---|---|---|---|
| **Load Today's Summary & Habits** | `GET` | `/api/days/today` | None | `TodayResponse` | Returns today's `date`, `dayNumber`, `quote`, `completionPercentage`, `completedCount`, `totalCount`, and today's list of `habits` with their log status. |
| **Load Today's Tasks & Milestones** | `GET` | `/api/todos/today` | None | `List<TodayTodoItemResponse>` | Merged feed of tasks due today (`TASK`), milestones due today (`MILESTONE`), checklist items under today's milestones (`CHECKLIST`). |
| **Cycle Habit Status** | `PUT` | `/api/habits/{habitId}/logs` | Query: `?date=YYYY-MM-DD` (optional, defaults to today)<br>Body: `{ "status": "COMPLETED", "note": "" }` | `HabitLogResponse` | Upserts status: `PENDING` -> `COMPLETED` -> `MISSED` -> `SKIPPED`. Updates progress ring immediately. |
| **Toggle Task from Dashboard** | `PATCH` | `/api/todos/{id}/toggle` | None | `TodoResponse` | Instantly flips task `completed` boolean and sets `completedAt`. |
| **Toggle Checklist Item from Dashboard** | `PATCH` | `/api/todos/checklist/{projectId}/{milestoneId}/{itemId}/toggle` | Path variables | `204 No Content` | Toggles child checklist item under a milestone directly from the Home dashboard. |
| **Inline "Add Task" from Dashboard** | `POST` | `/api/todos/quick` | Body: `{ "title": "string", "priority": "LOW"|"MEDIUM"|"HIGH" }` | `TodoResponse` | High-speed creation: automatically assigns `dueDate = today` so it appears immediately on the dashboard. |

---

## 3. Habit Management

| UI Action / Feature | HTTP Method | Endpoint | Request Payload / Params | Response Payload | Notes |
|---|---|---|---|---|---|
| **List All Active Habits** | `GET` | `/api/habits` | None | `List<HabitResponse>` | Fetches all active habit definitions (title, icon, color, scheduleType, daysOfWeek). |
| **Create New Habit** | `POST` | `/api/habits` | Body: `CreateHabitRequest`<br>`{ "title": "...", "icon": "...", "color": "...", "reminderTime": "HH:mm", "scheduleType": "EVERY_DAY"|"SPECIFIC_DAYS", "daysOfWeek": [] }` | `HabitResponse` (`id`, `title`, etc.) | Created with HTTP 201. Automatically reflected in today's day view. |
| **Edit Existing Habit** | `PATCH` | `/api/habits/{id}` | Body: `UpdateHabitRequest` (partial fields) | `HabitResponse` | Updates title, icon, color, reminderTime, or schedule days. |
| **Delete Habit** | `DELETE` | `/api/habits/{id}` | None | `204 No Content` | Soft delete (`active = false`). Preserves historical logs in database. |
| **Get Habit Log History** | `GET` | `/api/habits/{habitId}/logs` | Query: `?from=YYYY-MM-DD&to=YYYY-MM-DD` | `List<HabitLogResponse>` | Retrieves completion history for streak inspection. |

---

## 4. Task Management

| UI Action / Feature | HTTP Method | Endpoint | Request Payload / Params | Response Payload | Notes |
|---|---|---|---|---|---|
| **List Tasks (Filtered)** | `GET` | `/api/todos` | Query: `?completed=false` (or `true`)<br>`?dueDate=YYYY-MM-DD` | `List<TodoResponse>` | Used when filtering tasks by Open, Completed, or All. |
| **Detailed Task Creation** | `POST` | `/api/todos` | Body: `CreateTodoRequest`<br>`{ "title": "...", "notes": "...", "dueDate": "YYYY-MM-DD", "priority": "LOW"|"MEDIUM"|"HIGH", "tags": [] }` | `TodoResponse` | Allows custom due dates, notes, and tags beyond the quick-add. |
| **Edit Task Details** | `PATCH` | `/api/todos/{id}` | Body: `UpdateTodoRequest`<br>`{ "title": "...", "notes": "...", "dueDate": "...", "priority": "...", "tags": [] }` | `TodoResponse` | Edits title, due date, priority, or notes inline/contextually. |
| **Delete Task** | `DELETE` | `/api/todos/{id}` | None | `204 No Content` | Permanently deletes task. |

---

## 5. Projects and Milestones

| UI Action / Feature | HTTP Method | Endpoint | Request Payload / Params | Response Payload | Notes |
|---|---|---|---|---|---|
| **List Active Projects** | `GET` | `/api/projects` | None | `List<ProjectSummaryResponse>` | Lightweight summary: returns `name`, `description`, `deadline`, `progressPercent`, `totalMilestones`, `completedMilestones`. |
| **Get Project Details** | `GET` | `/api/projects/{projectId}` | None | `ProjectResponse` | Full hierarchical response containing all milestones and child checklist items. |
| **Add Milestone to Project** | `POST` | `/api/projects/{projectId}/milestones` | Body: `CreateMilestoneRequest`<br>`{ "name": "...", "dueDate": "YYYY-MM-DD" }` | `ProjectResponse` | Adds milestone and recalculates project progress percent. |
| **Update Milestone** | `PATCH` | `/api/projects/{projectId}/milestones/{milestoneId}` | Body: `UpdateMilestoneRequest`<br>`{ "name": "...", "dueDate": "YYYY-MM-DD" }` | `ProjectResponse` | Updates milestone metadata. |
| **Delete Milestone** | `DELETE` | `/api/projects/{projectId}/milestones/{milestoneId}` | None | `ProjectResponse` | Deletes milestone and cascading checklist items. |
| **Add Checklist Item** | `POST` | `/api/projects/{projectId}/milestones/{milestoneId}/items` | Body: `CreateChecklistItemRequest`<br>`{ "title": "..." }` | `ProjectResponse` | Adds checklist item under milestone. |
| **Toggle Checklist Item** | `PATCH` | `/api/projects/{projectId}/milestones/{milestoneId}/items/{itemId}/toggle` | None | `ProjectResponse` | Toggles item completion status and recalculates milestone progress. |
| **Update Checklist Item** | `PATCH` | `/api/projects/{projectId}/milestones/{milestoneId}/items/{itemId}` | Body: `UpdateChecklistItemRequest`<br>`{ "title": "..." }` | `ProjectResponse` | Renames checklist item. |
| **Delete Checklist Item** | `DELETE` | `/api/projects/{projectId}/milestones/{milestoneId}/items/{itemId}` | None | `ProjectResponse` | Deletes checklist item. |

---

## 6. Endpoints Status Summary

- **100% Reused Existing Endpoints:** All Habit, Task, Project, Milestone, and User endpoints are reused without any backend modifications.
- **Authentication:** Evaluated in `IMPLEMENTATION_PLAN.md` with options to either leverage the existing `/api/auth/register-oauth` flow or add a lightweight Google token verification endpoint.
- **Excluded Features:** Journaling (`/api/journal/**`) and Complex Analytics (`/api/analytics/**`) remain strictly outside extension scope.

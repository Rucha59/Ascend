import api from "./client";

/**
 * Fetches merged today view:
 * Contains TASK (user todos due today), MILESTONE (milestones due today),
 * and CHECKLIST (items under milestones due today).
 */
export async function getTodayTodos() {
  const response = await api.get("/todos/today");
  return response.data;
}

/**
 * Lists tasks with optional filters (?completed=true/false, ?dueDate=YYYY-MM-DD).
 */
export async function listTodos(params = {}) {
  const response = await api.get("/todos", { params });
  return response.data;
}

/**
 * Dashboard "Add a task" quick action:
 * Automatically creates task with dueDate = today.
 */
export async function quickCreateTodo(title, priority = "MEDIUM") {
  const response = await api.post("/todos/quick", { title, priority });
  return response.data;
}

/**
 * Creates task with full options (notes, custom dueDate, tags).
 */
export async function createTodo(payload) {
  const response = await api.post("/todos", payload);
  return response.data;
}

/**
 * Toggles task complete/incomplete directly.
 */
export async function toggleTodo(id) {
  const response = await api.patch(`/todos/${id}/toggle`);
  return response.data;
}

/**
 * Updates task fields (title, notes, dueDate, priority, tags).
 */
export async function updateTodo(id, payload) {
  const response = await api.patch(`/todos/${id}`, payload);
  return response.data;
}

/**
 * Deletes task permanently.
 */
export async function deleteTodo(id) {
  await api.delete(`/todos/${id}`);
}

/**
 * Toggles a milestone checklist item directly from the today dashboard feed.
 */
export async function toggleChecklistItemFromToday(projectId, milestoneId, itemId) {
  await api.patch(`/todos/checklist/${projectId}/${milestoneId}/${itemId}/toggle`);
}

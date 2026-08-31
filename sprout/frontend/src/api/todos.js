import api from "./axios";

export const listTodos = (params = {}) => api.get("/todos", { params }).then((r) => r.data);

export const getTodayTodos = () => api.get("/todos/today").then((r) => r.data);

/** Creates a task with dueDate = today on the server. Always appears in today's list. */
export const quickCreateTodo = (title, priority = "MEDIUM") =>
    api.post("/todos/quick", { title, priority }).then((r) => r.data);

export const createTodo = (payload) => api.post("/todos", payload).then((r) => r.data);

export const updateTodo = (id, payload) => api.patch(`/todos/${id}`, payload).then((r) => r.data);

export const toggleTodo = (id) => api.patch(`/todos/${id}/toggle`).then((r) => r.data);

export const deleteTodo = (id) => api.delete(`/todos/${id}`);

/** Toggle a checklist item from the today view. projectId is needed for ownership validation. */
export const toggleChecklistItem = (projectId, milestoneId, itemId) =>
    api.patch(`/todos/checklist/${projectId}/${milestoneId}/${itemId}/toggle`);


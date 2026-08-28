import api from "./axios";

export const listTodos = (params = {}) => api.get("/todos", { params }).then((r) => r.data);

/** Merged view: today's own tasks + today's calendar events (if connected). */
export const getTodayTodos = () => api.get("/todos/today").then((r) => r.data);

export const createTodo = (payload) => api.post("/todos", payload).then((r) => r.data);

export const updateTodo = (id, payload) => api.patch(`/todos/${id}`, payload).then((r) => r.data);

export const toggleTodo = (id) => api.patch(`/todos/${id}/toggle`).then((r) => r.data);

export const deleteTodo = (id) => api.delete(`/todos/${id}`);

import api from "./client";

export async function listHabits() {
  const response = await api.get("/habits");
  return response.data;
}

export async function createHabit(payload) {
  const response = await api.post("/habits", payload);
  return response.data;
}

export async function updateHabit(id, payload) {
  const response = await api.patch(`/habits/${id}`, payload);
  return response.data;
}

export async function deleteHabit(id) {
  await api.delete(`/habits/${id}`);
}

/**
 * Upserts today's (or a given date's) status and note for one habit.
 * status: "COMPLETED" | "MISSED" | "SKIPPED"
 */
export async function markHabitLog(habitId, { status, note, date } = {}) {
  const params = date ? { date } : {};
  const response = await api.put(`/habits/${habitId}/logs`, { status, note }, { params });
  return response.data;
}

export async function getHabitHistory(habitId, { from, to } = {}) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  const response = await api.get(`/habits/${habitId}/logs`, { params });
  return response.data;
}

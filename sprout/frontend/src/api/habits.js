import api from "./axios";

export const listHabits = () => api.get("/habits").then((r) => r.data);

export const createHabit = (payload) => api.post("/habits", payload).then((r) => r.data);

export const updateHabit = (id, payload) => api.patch(`/habits/${id}`, payload).then((r) => r.data);

export const deleteHabit = (id) => api.delete(`/habits/${id}`);

/** Upserts today's (or a given date's) status + note for one habit. */
export const markHabitLog = (habitId, { status, note, date }) => {
  const params = date ? { date } : {};
  return api.put(`/habits/${habitId}/logs`, { status, note }, { params }).then((r) => r.data);
};

export const getHabitHistory = (habitId, { from, to } = {}) =>
    api.get(`/habits/${habitId}/logs`, { params: { from, to } }).then((r) => r.data);

/** Evidence attaches to an existing log — mark the habit for that day first. */
export const addHabitStat = (habitId, { label, value, unit }, date) => {
  const params = date ? { date } : {};
  return api.post(`/habits/${habitId}/logs/stats`, { label, value, unit }, { params }).then((r) => r.data);
};

export const deleteHabitStat = (habitId, statId, date) => {
  const params = date ? { date } : {};
  return api.delete(`/habits/${habitId}/logs/stats/${statId}`, { params });
};

export const addHabitPhoto = (habitId, file, date) => {
  const formData = new FormData();
  formData.append("file", file);
  const params = date ? { date } : {};
  return api.post(`/habits/${habitId}/logs/images`, formData, { params }).then((r) => r.data);
};

export const deleteHabitPhoto = (habitId, photoId, date) => {
  const params = date ? { date } : {};
  return api.delete(`/habits/${habitId}/logs/images/${photoId}`, { params });
};

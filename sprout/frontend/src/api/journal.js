import api from "./axios";

export const getJournal = (date) => api.get(`/journal/${date}`).then((r) => r.data);

/** Full replace — send the whole form every save. */
export const saveJournal = (date, payload) => api.put(`/journal/${date}`, payload).then((r) => r.data);

/**
 * Returns an array of ISO date strings ("YYYY-MM-DD") for days in the given
 * year-month that have a journal entry — used by the calendar to mark filled days.
 */
export const getFilledDates = (year, month) =>
    api.get("/journal/month", { params: { year, month } }).then((r) => r.data);

export const uploadJournalImage = (date, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/journal/${date}/images`, formData).then((r) => r.data);
};

export const deleteJournalImage = (date, imageId) => api.delete(`/journal/${date}/images/${imageId}`);

import api from "./axios";

export const getCalendarAuthUrl = () => api.get("/calendar/google/auth-url").then((r) => r.data.url);

export const getCalendarStatus = () => api.get("/calendar/google/status").then((r) => r.data);

export const disconnectCalendar = () => api.delete("/calendar/google");

/** Defaults to today (server-side) if no date is given. */
export const getCalendarEvents = (date) =>
    api.get("/calendar/events", { params: date ? { date } : {} }).then((r) => r.data);

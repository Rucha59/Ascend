import api from "./axios";

export const getToday = () => api.get("/days/today").then((r) => r.data);

export const getDay = (dayNumber) => api.get(`/days/${dayNumber}`).then((r) => r.data);

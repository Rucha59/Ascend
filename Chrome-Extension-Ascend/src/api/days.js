import api from "./client";

/**
 * Fetches today's aggregated dashboard payload:
 * dayNumber, totalDays, date, quote, habits status list, completionPercentage, counts.
 */
export async function getToday() {
  const response = await api.get("/days/today");
  return response.data;
}

/**
 * Fetches day payload for a specific challenge day number (1-365).
 */
export async function getDay(dayNumber) {
  const response = await api.get(`/days/${dayNumber}`);
  return response.data;
}

/**
 * Fetches day payload for a specific calendar date (YYYY-MM-DD).
 */
export async function getForDate(date) {
  const response = await api.get(`/days/date/${date}`);
  return response.data;
}

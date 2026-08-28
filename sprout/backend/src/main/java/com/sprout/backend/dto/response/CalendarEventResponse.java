package com.sprout.backend.dto.response;

public record CalendarEventResponse(
        String id,
        String title,
        /** ISO date ("2026-08-25") if all-day, otherwise a full ISO-8601 datetime with offset. */
        String start,
        String end,
        boolean allDay,
        String location
) {}

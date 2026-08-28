package com.sprout.backend.dto.response;

import java.util.List;

/**
 * One row in the merged "today" view — either a user's own task or an imported calendar event.
 * The two shapes differ (a calendar event has no priority/tags/completion, a task has no event
 * time), so `source` tells the frontend which fields are meaningful for that row.
 */
public record TodayTodoItemResponse(
        String source,     // "TASK" | "CALENDAR"
        Long taskId,        // present when source = TASK
        String eventId,     // present when source = CALENDAR
        String title,
        String priority,    // TASK only
        List<String> tags,  // TASK only (empty for CALENDAR)
        boolean completed,  // TASK only (always false for CALENDAR — events aren't "completable")
        String notes,       // TASK notes, or CALENDAR location
        String time,        // CALENDAR start time (ISO datetime, or ISO date if all-day); null for TASK
        Boolean allDay      // CALENDAR only
) {}

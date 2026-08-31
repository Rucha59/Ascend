package com.sprout.backend.dto.response;

import java.util.List;

/**
 * One row in the merged "today" view.
 * source = "TASK"      — user's own to-do (taskId set, completable)
 * source = "CALENDAR"  — Google Calendar event (eventId set, read-only)
 * source = "MILESTONE" — project milestone due today (milestoneId set, not completable from here)
 * source = "CHECKLIST" — individual checklist item whose milestone is due today (itemId set, toggleable)
 */
public record TodayTodoItemResponse(
        String source,
        Long taskId,        // TASK
        String eventId,     // CALENDAR
        Long milestoneId,   // MILESTONE, CHECKLIST
        Long itemId,        // CHECKLIST only
        Long projectId,     // MILESTONE, CHECKLIST — needed for the toggle endpoint
        String title,
        String priority,    // TASK only
        List<String> tags,  // TASK only
        boolean completed,
        String notes,       // TASK notes or CALENDAR location
        String time,        // CALENDAR only
        Boolean allDay,     // CALENDAR only
        String projectName  // MILESTONE / CHECKLIST — shown as context label
) {}

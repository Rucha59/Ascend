package com.sprout.backend.dto.response;

/** One column in the weekly/monthly bar chart. */
public record WeeklyBarResponse(
        String label,      // e.g. "Mon", "Tue" or "Aug 1"
        int completedHabits,
        int totalHabits,
        int completionPct,
        boolean hasJournalEntry
) {}

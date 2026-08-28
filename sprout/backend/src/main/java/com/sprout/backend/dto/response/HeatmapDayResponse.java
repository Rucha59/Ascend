package com.sprout.backend.dto.response;

import java.time.LocalDate;

/** One cell in the GitHub-style heatmap — the pct drives colour intensity on the frontend. */
public record HeatmapDayResponse(
        LocalDate date,
        int completedHabits,
        int totalHabits,
        /** 0–100, or -1 when the user had no active habits that day (renders as a neutral cell). */
        int completionPct,
        boolean hasJournalEntry
) {}

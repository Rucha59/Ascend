package com.sprout.backend.dto.response;

import java.time.LocalTime;
import java.util.List;

/** A habit as it appears on a specific day, with that day's log (if any) folded in. */
public record HabitStatusResponse(
        Long habitId,
        String title,
        String icon,
        String color,
        LocalTime reminderTime,
        String status, // "PENDING" | "COMPLETED" | "MISSED" | "SKIPPED"
        String note,
        List<HabitStatResponse> stats,
        List<HabitPhotoResponse> photos
) {}

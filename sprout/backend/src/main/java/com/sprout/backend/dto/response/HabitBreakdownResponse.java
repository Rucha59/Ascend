package com.sprout.backend.dto.response;

/** Per-habit completion count for the breakdown chart. */
public record HabitBreakdownResponse(
        Long habitId,
        String title,
        String color,
        long completedDays,
        long totalDays,
        int completionPct
) {}

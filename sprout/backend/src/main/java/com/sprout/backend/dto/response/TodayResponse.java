package com.sprout.backend.dto.response;

import java.time.LocalDate;
import java.util.List;

public record TodayResponse(
        Integer dayNumber,
        Integer totalDays,
        LocalDate date,
        String quote,
        List<HabitStatusResponse> habits,
        Integer completedCount,
        Integer totalCount,
        Integer completionPercentage,
        Boolean hasJournalEntry
) {}

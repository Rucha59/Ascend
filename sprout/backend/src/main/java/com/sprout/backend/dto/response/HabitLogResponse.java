package com.sprout.backend.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record HabitLogResponse(
        Long id,
        Long habitId,
        LocalDate logDate,
        String status,
        String note,
        List<HabitStatResponse> stats,
        List<HabitPhotoResponse> photos,
        Instant completedAt
) {}

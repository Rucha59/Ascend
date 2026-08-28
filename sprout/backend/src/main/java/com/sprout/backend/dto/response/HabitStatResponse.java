package com.sprout.backend.dto.response;

import java.time.Instant;

public record HabitStatResponse(
        Long id,
        String label,
        Double value,
        String unit,
        Instant createdAt
) {}

package com.sprout.backend.dto.response;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;

public record HabitResponse(
        Long id,
        String title,
        String icon,
        String color,
        LocalTime reminderTime,
        Boolean active,
        Instant createdAt,
        String scheduleType,
        List<String> daysOfWeek
) {}
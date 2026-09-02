package com.sprout.backend.dto.request;

import jakarta.validation.constraints.Size;

import java.time.LocalTime;
import java.util.List;

public record UpdateHabitRequest(

        @Size(max = 100, message = "Title must be 100 characters or fewer")
        String title,

        String icon,

        String color,

        LocalTime reminderTime,

        Boolean active,

        /** Null = leave unchanged, same convention as the other fields here. */
        String scheduleType,

        List<String> daysOfWeek
) {}
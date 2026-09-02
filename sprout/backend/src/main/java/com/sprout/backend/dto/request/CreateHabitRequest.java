package com.sprout.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;
import java.util.List;

public record CreateHabitRequest(

        @NotBlank(message = "Title is required")
        @Size(max = 100, message = "Title must be 100 characters or fewer")
        String title,

        @NotBlank(message = "Icon is required")
        String icon,

        @NotBlank(message = "Color is required")
        String color,

        LocalTime reminderTime,

        /** "EVERY_DAY" | "SPECIFIC_DAYS" — optional, defaults to EVERY_DAY */
        String scheduleType,

        /** Required when scheduleType = SPECIFIC_DAYS, e.g. ["MONDAY","WEDNESDAY","FRIDAY"] */
        List<String> daysOfWeek
) {}
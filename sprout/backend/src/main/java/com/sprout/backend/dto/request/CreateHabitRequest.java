package com.sprout.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;

public record CreateHabitRequest(

        @NotBlank(message = "Title is required")
        @Size(max = 100, message = "Title must be 100 characters or fewer")
        String title,

        @NotBlank(message = "Icon is required")
        String icon,

        @NotBlank(message = "Color is required")
        String color,

        /** Optional daily reminder, e.g. "07:00". Null means no reminder. */
        LocalTime reminderTime
) {}

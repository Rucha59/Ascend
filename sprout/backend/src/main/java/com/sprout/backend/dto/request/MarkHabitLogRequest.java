package com.sprout.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MarkHabitLogRequest(

        @NotBlank(message = "Status is required")
        String status, // "COMPLETED" | "MISSED" | "SKIPPED" — validated in HabitLogService

        @Size(max = 1000, message = "Notes must be 1000 characters or fewer")
        String note
) {}

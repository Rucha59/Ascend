package com.sprout.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AddHabitStatRequest(

        @NotBlank(message = "Label is required")
        @Size(max = 60, message = "Label must be 60 characters or fewer")
        String label, // e.g. "Distance", "Reps", "Duration"

        @NotNull(message = "Value is required")
        Double value,

        @Size(max = 20, message = "Unit must be 20 characters or fewer")
        String unit // e.g. "km", "kg", "min" — optional
) {}

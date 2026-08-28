package com.sprout.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateMilestoneRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 200)
        String name,

        LocalDate dueDate
) {}

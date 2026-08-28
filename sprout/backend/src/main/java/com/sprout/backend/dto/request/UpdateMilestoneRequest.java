package com.sprout.backend.dto.request;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdateMilestoneRequest(
        @Size(max = 200)
        String name,

        LocalDate dueDate
) {}

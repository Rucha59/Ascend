package com.sprout.backend.dto.request;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdateProjectRequest(
        @Size(max = 200)
        String name,

        String description,

        LocalDate deadline
) {}

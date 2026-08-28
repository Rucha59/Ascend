package com.sprout.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateChecklistItemRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 300)
        String title
) {}

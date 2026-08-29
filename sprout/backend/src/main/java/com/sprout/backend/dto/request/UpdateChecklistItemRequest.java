package com.sprout.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateChecklistItemRequest(
        @NotBlank(message = "Title is required")
        String title
) {}
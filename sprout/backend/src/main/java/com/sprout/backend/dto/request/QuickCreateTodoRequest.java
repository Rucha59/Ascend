package com.sprout.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Lightweight create used by the Dashboard's "Add today's to-do" form.
 * Always sets dueDate = today server-side; priority defaults to MEDIUM.
 */
public record QuickCreateTodoRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 200)
        String title,

        String priority
) {}

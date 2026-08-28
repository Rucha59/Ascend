package com.sprout.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CreateTodoRequest(

        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must be 200 characters or fewer")
        String title,

        @Size(max = 3000, message = "Notes must be 3000 characters or fewer")
        String notes,

        LocalDate dueDate,

        String priority, // "LOW" | "MEDIUM" | "HIGH" — defaults to MEDIUM if omitted

        List<String> tags
) {}

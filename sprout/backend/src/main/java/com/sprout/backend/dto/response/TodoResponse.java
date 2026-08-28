package com.sprout.backend.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record TodoResponse(
        Long id,
        String title,
        String notes,
        LocalDate dueDate,
        String priority,
        List<String> tags,
        Boolean completed,
        Instant completedAt,
        Instant createdAt,
        Instant updatedAt
) {}

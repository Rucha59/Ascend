package com.sprout.backend.dto.response;

import java.time.Instant;

public record ChecklistItemResponse(
        Long id,
        String title,
        Boolean completed,
        Integer position,
        Instant createdAt
) {}

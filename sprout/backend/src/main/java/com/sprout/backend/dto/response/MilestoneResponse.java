package com.sprout.backend.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record MilestoneResponse(
        Long id,
        String name,
        LocalDate dueDate,
        Integer position,
        List<ChecklistItemResponse> checklistItems,
        /** 0–100, computed from checklistItems. 0 if no items. */
        Integer progressPercent,
        Integer completedItems,
        Integer totalItems,
        Instant createdAt,
        Instant updatedAt
) {}

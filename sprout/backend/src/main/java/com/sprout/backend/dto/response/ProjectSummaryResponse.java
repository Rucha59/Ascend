package com.sprout.backend.dto.response;

import java.time.Instant;
import java.time.LocalDate;

/** Lighter shape for list views — no milestone/checklist detail. */
public record ProjectSummaryResponse(
        Long id,
        String name,
        String description,
        LocalDate deadline,
        Integer progressPercent,
        Integer totalMilestones,
        Integer completedMilestones,
        Instant createdAt,
        Instant updatedAt
) {}

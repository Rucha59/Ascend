package com.sprout.backend.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ProjectResponse(
        Long id,
        String name,
        String description,
        LocalDate deadline,
        List<MilestoneResponse> milestones,
        /** 0–100, computed as the average of each milestone's progressPercent. 0 if no milestones. */
        Integer progressPercent,
        Instant createdAt,
        Instant updatedAt
) {}

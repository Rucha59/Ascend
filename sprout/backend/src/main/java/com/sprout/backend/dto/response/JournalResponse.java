package com.sprout.backend.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record JournalResponse(
        Long id, // null if nothing has been saved for this day yet — the entry still "exists" conceptually
        LocalDate entryDate,
        Integer dayNumber,
        String mood,
        String gratitude,
        String wentWell,
        String couldImprove,
        String content,
        List<JournalImageResponse> images,
        Instant createdAt,
        Instant updatedAt
) {}

package com.sprout.backend.dto.response;

import java.time.Instant;
import java.time.LocalDate;

public record UserResponse(
        Long id,
        String name,
        String username,
        String email,
        String bio,
        String timezone,
        LocalDate challengeStartDate,
        Integer currentStreak,
        Integer longestStreak,
        Instant createdAt
) {}

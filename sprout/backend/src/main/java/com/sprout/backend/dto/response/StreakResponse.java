package com.sprout.backend.dto.response;

public record StreakResponse(
        int currentStreak,
        int longestStreak,
        int totalCompletedDays,
        int challengeDay,
        int totalChallengeDays
) {}

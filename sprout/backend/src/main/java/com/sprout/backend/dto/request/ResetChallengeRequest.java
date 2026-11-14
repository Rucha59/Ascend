package com.sprout.backend.dto.request;

public record ResetChallengeRequest(
        String mode,
        Integer challengeDays
) {}

package com.sprout.backend.dto.response;

import java.time.Instant;

public record CalendarStatusResponse(
        boolean connected,
        Instant connectedAt
) {}

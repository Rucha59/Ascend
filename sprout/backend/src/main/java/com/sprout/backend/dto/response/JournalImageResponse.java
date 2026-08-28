package com.sprout.backend.dto.response;

import java.time.Instant;

public record JournalImageResponse(
        Long id,
        String originalFileName,
        String contentType,
        Long sizeBytes,
        Instant createdAt,
        /** Relative to the API base, e.g. "/journal/images/42/file". Requires the same JWT as everything else. */
        String url
) {}

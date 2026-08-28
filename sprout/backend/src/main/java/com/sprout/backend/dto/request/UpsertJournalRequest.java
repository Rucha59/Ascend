package com.sprout.backend.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Full replace, not a partial patch — the frontend always sends the whole entry it has open,
 * same as the "Save Entry" pattern in the dashboard prototype. Any field left null is saved
 * as empty, it isn't left untouched.
 */
public record UpsertJournalRequest(

        String mood, // "GREAT" | "GOOD" | "OKAY" | "ROUGH" | "HARD", or null to clear

        @Size(max = 3000, message = "Gratitude must be 3000 characters or fewer")
        String gratitude,

        @Size(max = 3000, message = "This must be 3000 characters or fewer")
        String wentWell,

        @Size(max = 3000, message = "This must be 3000 characters or fewer")
        String couldImprove,

        @Size(max = 20000, message = "Entry must be 20,000 characters or fewer")
        String content
) {}

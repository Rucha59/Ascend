package com.sprout.backend.dto.request;

import jakarta.validation.constraints.Size;

import java.time.LocalTime;

/**
 * All fields optional — only non-null values are applied.
 * Note: there's currently no way to *clear* an existing reminder via this endpoint,
 * since null here means "leave unchanged". A dedicated clear-reminder action is a
 * reasonable follow-up if that turns out to matter.
 */
public record UpdateHabitRequest(

        @Size(max = 100, message = "Title must be 100 characters or fewer")
        String title,

        String icon,

        String color,

        LocalTime reminderTime,

        Boolean active
) {}

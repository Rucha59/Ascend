package com.sprout.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** All fields optional — only non-null values are applied. */
public record UpdateProfileRequest(

        String name,

        @Size(max = 500, message = "Bio must be 500 characters or fewer")
        String bio,

        String timezone,

        @Min(value = 1, message = "Challenge days must be at least 1")
        @Max(value = 365, message = "Challenge days must be at most 365")
        Integer challengeDays,

        LocalDate challengeStartDate
) {}

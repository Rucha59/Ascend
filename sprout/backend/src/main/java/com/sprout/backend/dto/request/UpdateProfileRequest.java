package com.sprout.backend.dto.request;

import jakarta.validation.constraints.Size;

/** All fields optional — only non-null values are applied. */
public record UpdateProfileRequest(

        String name,

        @Size(max = 500, message = "Bio must be 500 characters or fewer")
        String bio,

        String timezone
) {}

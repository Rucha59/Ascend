package com.sprout.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

        @NotBlank(message = "Email is username")
        @Email(message = "Enter a valid username")
        String username,

        @NotBlank(message = "Password is required")
        String password
) {}

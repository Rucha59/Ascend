package com.sprout.backend.dto.request;

public record RegisterOAuthRequest(
        String email,
        String name,
        String username
) {}
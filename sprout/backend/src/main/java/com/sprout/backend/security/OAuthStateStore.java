package com.sprout.backend.security;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Short-lived, in-memory state-token → user-id mapping for the OAuth "connect" flow.
 * Google's redirect back to our callback is a plain browser GET with no way to carry our JWT,
 * so this is what ties that request back to the user who started it. Fine for a single
 * instance; a multi-instance deployment would want this in Redis or the database instead.
 */
@Component
public class OAuthStateStore {

    private record StateEntry(Long userId, Instant expiresAt) {}

    private final Map<String, StateEntry> states = new ConcurrentHashMap<>();

    public String create(Long userId) {
        cleanup();
        String token = UUID.randomUUID().toString();
        states.put(token, new StateEntry(userId, Instant.now().plus(Duration.ofMinutes(10))));
        return token;
    }

    /** One-time use — returns null if the token is unknown or expired. */
    public Long consume(String token) {
        StateEntry entry = states.remove(token);
        if (entry == null || entry.expiresAt().isBefore(Instant.now())) return null;
        return entry.userId();
    }

    private void cleanup() {
        Instant now = Instant.now();
        states.entrySet().removeIf(e -> e.getValue().expiresAt().isBefore(now));
    }
}

package com.sprout.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * One row per user (userId doubles as the primary key — a user has at most one Google
 * connection). Tokens are stored as-is; in a real deployment these should be encrypted at
 * rest rather than plain columns, same as any other long-lived OAuth credential.
 */
@Entity
@Table(name = "google_calendar_connections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleCalendarConnection {

    @Id
    private Long userId;

    @Column(nullable = false, length = 2048)
    private String accessToken;

    @Column(nullable = false, length = 2048)
    private String refreshToken;

    @Column(nullable = false)
    private Instant accessTokenExpiresAt;

    @Column(nullable = false)
    private Instant connectedAt;
}

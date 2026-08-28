package com.sprout.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/** A single numeric measurement attached to a completion — "Distance" 5.0 "km", "Reps" 8, etc. */
@Entity
@Table(name = "habit_evidence_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitEvidenceStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "habit_log_id", nullable = false)
    private HabitLog habitLog;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private Double value;

    /** e.g. "kg", "km", "min", "pages" — nullable, since not every stat has a unit. */
    private String unit;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}

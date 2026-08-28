package com.sprout.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "habit_evidence_photos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitEvidencePhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "habit_log_id", nullable = false)
    private HabitLog habitLog;

    /** Randomly generated name the file is actually saved under on disk — never the original name. */
    @Column(nullable = false)
    private String storedFileName;

    private String originalFileName;

    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false)
    private Long sizeBytes;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}

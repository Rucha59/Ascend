package com.sprout.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "habit_logs", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"habit_id", "log_date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "habit_id", nullable = false)
    private Habit habit;

    /** Denormalized from habit.user so history/analytics queries don't need a join through Habit. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HabitStatus status;

    @Column(length = 1000)
    private String note;

    /** Numeric evidence — "Bench 50kg x 8", "Distance 5km", etc. Stored separately for analytics. */
    @Builder.Default
    @OneToMany(mappedBy = "habitLog", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<HabitEvidenceStat> stats = new ArrayList<>();

    /** Photo evidence attached to this day's completion. */
    @Builder.Default
    @OneToMany(mappedBy = "habitLog", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<HabitEvidencePhoto> photos = new ArrayList<>();

    @Column(nullable = false)
    private Instant completedAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (completedAt == null) completedAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        completedAt = Instant.now();
        updatedAt = Instant.now();
    }
}

package com.sprout.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "journal_entries", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "entry_date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private JournalMood mood;

    /** "What are you grateful for?" */
    @Column(columnDefinition = "TEXT")
    private String gratitude;

    /** Reflection prompt 1: "What went well today?" */
    @Column(name = "went_well", columnDefinition = "TEXT")
    private String wentWell;

    /** Reflection prompt 2: "What could have gone better?" */
    @Column(name = "could_improve", columnDefinition = "TEXT")
    private String couldImprove;

    /** Free-write body — markdown-formatted text, rendered rich on the frontend. */
    @Column(columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    @OneToMany(mappedBy = "journalEntry", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<JournalImage> images = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}

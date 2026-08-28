package com.sprout.backend.repository;

import com.sprout.backend.entity.JournalImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JournalImageRepository extends JpaRepository<JournalImage, Long> {

    /** Ownership-checked lookup — an image only resolves if it belongs to this user's entry. */
    Optional<JournalImage> findByIdAndJournalEntryUserId(Long id, Long userId);
}

package com.sprout.backend.repository;

import com.sprout.backend.entity.HabitEvidencePhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HabitEvidencePhotoRepository extends JpaRepository<HabitEvidencePhoto, Long> {

    Optional<HabitEvidencePhoto> findByIdAndHabitLogId(Long id, Long habitLogId);

    /** Ownership-checked lookup for the standalone file-serving endpoint (no habitId/date in that route). */
    Optional<HabitEvidencePhoto> findByIdAndHabitLogUserId(Long id, Long userId);

    List<HabitEvidencePhoto> findByHabitLogIdOrderByCreatedAtAsc(Long habitLogId);
}

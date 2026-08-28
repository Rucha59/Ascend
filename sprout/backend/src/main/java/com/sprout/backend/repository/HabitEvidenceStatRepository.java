package com.sprout.backend.repository;

import com.sprout.backend.entity.HabitEvidenceStat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HabitEvidenceStatRepository extends JpaRepository<HabitEvidenceStat, Long> {

    Optional<HabitEvidenceStat> findByIdAndHabitLogId(Long id, Long habitLogId);

    List<HabitEvidenceStat> findByHabitLogIdOrderByIdAsc(Long habitLogId);
}

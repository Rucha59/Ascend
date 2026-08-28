package com.sprout.backend.repository;

import com.sprout.backend.entity.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {

    Optional<HabitLog> findByHabitIdAndLogDate(Long habitId, LocalDate logDate);

    /** All of a user's logs for one calendar date, across every habit — powers the "today" view. */
    List<HabitLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);

    List<HabitLog> findByHabitIdOrderByLogDateDesc(Long habitId);
}

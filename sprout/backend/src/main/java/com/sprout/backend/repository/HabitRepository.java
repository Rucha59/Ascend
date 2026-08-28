package com.sprout.backend.repository;

import com.sprout.backend.entity.Habit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HabitRepository extends JpaRepository<Habit, Long> {

    List<Habit> findByUserIdAndActiveTrueOrderByCreatedAtAsc(Long userId);

    Optional<Habit> findByIdAndUserId(Long id, Long userId);
}

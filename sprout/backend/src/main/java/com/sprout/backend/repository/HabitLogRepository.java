package com.sprout.backend.repository;

import com.sprout.backend.entity.HabitLog;
import com.sprout.backend.entity.HabitStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {

    Optional<HabitLog> findByHabitIdAndLogDate(Long habitId, LocalDate logDate);

    /** All of a user's logs for one calendar date, across every habit — powers the "today" view. */
    List<HabitLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);

    List<HabitLog> findByHabitIdOrderByLogDateDesc(Long habitId);

    /** All logs for a user in a date range — the base of all analytics aggregations. */
    @Query("SELECT h FROM HabitLog h WHERE h.user.id = :userId AND h.logDate BETWEEN :from AND :to ORDER BY h.logDate ASC")
    List<HabitLog> findByUserIdBetween(Long userId, LocalDate from, LocalDate to);

    /** Distinct dates in range that have at least one COMPLETED log — used for streak computation. */
    @Query("SELECT DISTINCT h.logDate FROM HabitLog h WHERE h.user.id = :userId AND h.status = com.sprout.backend.entity.HabitStatus.COMPLETED AND h.logDate BETWEEN :from AND :to ORDER BY h.logDate ASC")
    List<LocalDate> findCompletedDatesByUserIdBetween(Long userId, LocalDate from, LocalDate to);

    /** Per-habit completion counts for the breakdown chart. */
    @Query("SELECT h.habit.id, h.habit.title, h.habit.color, COUNT(h) FROM HabitLog h WHERE h.user.id = :userId AND h.status = com.sprout.backend.entity.HabitStatus.COMPLETED AND h.logDate BETWEEN :from AND :to GROUP BY h.habit.id, h.habit.title, h.habit.color")
    List<Object[]> countCompletedPerHabit(Long userId, LocalDate from, LocalDate to);

    /** Total active habits ever logged by the user in a range — denominator for completion %. */
    @Query("SELECT h.logDate, COUNT(h) FROM HabitLog h WHERE h.user.id = :userId AND h.logDate BETWEEN :from AND :to GROUP BY h.logDate ORDER BY h.logDate ASC")
    List<Object[]> countLogsPerDate(Long userId, LocalDate from, LocalDate to);

    @Query("SELECT COUNT(h) FROM HabitLog h WHERE h.user.id = :userId AND h.status = com.sprout.backend.entity.HabitStatus.COMPLETED AND h.logDate BETWEEN :from AND :to")
    long countCompleted(Long userId, LocalDate from, LocalDate to);

    @Query("SELECT COUNT(h) FROM HabitLog h WHERE h.user.id = :userId AND h.logDate BETWEEN :from AND :to")
    long countTotal(Long userId, LocalDate from, LocalDate to);
}

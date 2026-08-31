package com.sprout.backend.repository;

import com.sprout.backend.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    Optional<Milestone> findByIdAndProjectId(Long id, Long projectId);

    /** Milestones whose dueDate is today and whose project belongs to this user. */
    @Query("SELECT m FROM Milestone m JOIN m.project p WHERE p.user.id = :userId AND m.dueDate = :date ORDER BY p.name ASC, m.position ASC")
    List<Milestone> findByUserIdAndDueDate(Long userId, LocalDate date);
}

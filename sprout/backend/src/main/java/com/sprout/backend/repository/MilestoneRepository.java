package com.sprout.backend.repository;

import com.sprout.backend.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    Optional<Milestone> findByIdAndProjectId(Long id, Long projectId);
}

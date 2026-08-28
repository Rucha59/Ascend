package com.sprout.backend.repository;

import com.sprout.backend.entity.ChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {

    Optional<ChecklistItem> findByIdAndMilestoneId(Long id, Long milestoneId);
}

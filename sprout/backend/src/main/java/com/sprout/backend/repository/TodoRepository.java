package com.sprout.backend.repository;

import com.sprout.backend.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    List<Todo> findByUserIdOrderByDueDateAscCreatedAtDesc(Long userId);

    List<Todo> findByUserIdAndDueDate(Long userId, LocalDate dueDate);

    Optional<Todo> findByIdAndUserId(Long id, Long userId);
}

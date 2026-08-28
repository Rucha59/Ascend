package com.sprout.backend.repository;

import com.sprout.backend.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {

    Optional<JournalEntry> findByUserIdAndEntryDate(Long userId, LocalDate entryDate);

    @Query("SELECT j.entryDate FROM JournalEntry j WHERE j.user.id = :userId AND j.entryDate BETWEEN :from AND :to ORDER BY j.entryDate ASC")
    List<LocalDate> findEntryDatesByUserIdBetween(Long userId, LocalDate from, LocalDate to);

    @Query("SELECT COUNT(j) FROM JournalEntry j WHERE j.user.id = :userId AND j.entryDate BETWEEN :from AND :to")
    long countByUserIdBetween(Long userId, LocalDate from, LocalDate to);
}

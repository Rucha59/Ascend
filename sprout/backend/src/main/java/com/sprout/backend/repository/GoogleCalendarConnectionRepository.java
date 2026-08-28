package com.sprout.backend.repository;

import com.sprout.backend.entity.GoogleCalendarConnection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoogleCalendarConnectionRepository extends JpaRepository<GoogleCalendarConnection, Long> {
    // userId is the primary key, so findById/deleteById already do exactly what's needed.
}

package com.sprout.backend.entity;

/** PENDING is never stored — it's the implicit state when no HabitLog row exists yet for a day. */
public enum HabitStatus {
    COMPLETED,
    MISSED,
    SKIPPED
}

package com.sprout.backend.util;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/** Shared start-date ⇄ day-number ⇄ calendar-date conversion, used by both Days and Journal. */
public final class ChallengeDayCalculator {

    private ChallengeDayCalculator() {}

    /** Day 1 is the start date itself. Never returns less than 1, even for a date before the start. */
    public static int dayNumberFor(LocalDate startDate, LocalDate date) {
        if (startDate == null) return 1;
        long days = ChronoUnit.DAYS.between(startDate, date);
        return (int) Math.max(1, days + 1);
    }

    /** Inverse of dayNumberFor: the calendar date that corresponds to a given day number. */
    public static LocalDate dateForDayNumber(LocalDate startDate, int dayNumber) {
        LocalDate base = startDate != null ? startDate : LocalDate.now();
        return base.plusDays(dayNumber - 1L);
    }
}

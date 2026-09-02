package com.sprout.backend.service;

import com.sprout.backend.dto.request.CreateHabitRequest;
import com.sprout.backend.dto.request.UpdateHabitRequest;
import com.sprout.backend.dto.response.HabitResponse;
import com.sprout.backend.entity.Habit;
import com.sprout.backend.entity.HabitScheduleType;
import com.sprout.backend.exception.ApiException;
import com.sprout.backend.repository.HabitRepository;
import com.sprout.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HabitService {

    private final HabitRepository habitRepository;

    public HabitResponse createHabit(UserPrincipal principal, CreateHabitRequest req) {
        String title = req.title().trim();
        if (habitRepository.existsByUserIdAndTitleIgnoreCaseAndActiveTrue(principal.getId(), title)) {
            throw new ApiException(HttpStatus.CONFLICT, "You already have a habit named \"" + title + "\"");
        }

        HabitScheduleType scheduleType = parseScheduleType(req.scheduleType());
        Set<DayOfWeek> days = scheduleType == HabitScheduleType.SPECIFIC_DAYS
                ? parseDays(req.daysOfWeek()) : Set.of();
        validateSchedule(scheduleType, days);

        Habit habit = Habit.builder()
                .user(principal.getUser())
                .title(title)
                .icon(req.icon().trim())
                .color(req.color().trim())
                .reminderTime(req.reminderTime())
                .active(true)
                .scheduleType(scheduleType)
                .scheduledDays(days)
                .build();
        return HabitMapper.toResponse(habitRepository.save(habit));
    }

    public List<HabitResponse> listHabits(UserPrincipal principal) {
        return habitRepository.findByUserIdAndActiveTrueOrderByCreatedAtAsc(principal.getId()).stream()
                .map(HabitMapper::toResponse)
                .toList();
    }

    public HabitResponse updateHabit(UserPrincipal principal, Long habitId, UpdateHabitRequest req) {
        Habit habit = getOwnedHabit(principal.getId(), habitId);

        if (req.title() != null && !req.title().isBlank()) {
            String newTitle = req.title().trim();
            if (!newTitle.equalsIgnoreCase(habit.getTitle())
                    && habitRepository.existsByUserIdAndTitleIgnoreCaseAndActiveTrueAndIdNot(principal.getId(), newTitle, habitId)) {
                throw new ApiException(HttpStatus.CONFLICT, "You already have a habit named \"" + newTitle + "\"");
            }
            habit.setTitle(newTitle);
        }        if (req.icon() != null && !req.icon().isBlank()) habit.setIcon(req.icon().trim());
        if (req.color() != null && !req.color().isBlank()) habit.setColor(req.color().trim());
        if (req.reminderTime() != null) habit.setReminderTime(req.reminderTime());
        if (req.active() != null) habit.setActive(req.active());

        if (req.scheduleType() != null && !req.scheduleType().isBlank()) {
            HabitScheduleType scheduleType = parseScheduleType(req.scheduleType());
            Set<DayOfWeek> days = req.daysOfWeek() != null ? parseDays(req.daysOfWeek()) : habit.getScheduledDays();
            validateSchedule(scheduleType, days);
            habit.setScheduleType(scheduleType);
            habit.setScheduledDays(scheduleType == HabitScheduleType.EVERY_DAY ? Set.of() : days);
        } else if (req.daysOfWeek() != null) {
            Set<DayOfWeek> days = parseDays(req.daysOfWeek());
            validateSchedule(habit.getScheduleType(), days);
            habit.setScheduledDays(habit.getScheduleType() == HabitScheduleType.EVERY_DAY ? Set.of() : days);
        }

        return HabitMapper.toResponse(habitRepository.save(habit));
    }

    /** Soft delete — keeps history intact for any day the habit was ever logged against. */
    public void deleteHabit(UserPrincipal principal, Long habitId) {
        Habit habit = getOwnedHabit(principal.getId(), habitId);
        habit.setActive(false);
        habitRepository.save(habit);
    }

    Habit getOwnedHabit(Long userId, Long habitId) {
        return habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Habit not found"));
    }

    private HabitScheduleType parseScheduleType(String value) {
        if (value == null || value.isBlank()) return HabitScheduleType.EVERY_DAY;
        try {
            return HabitScheduleType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "scheduleType must be EVERY_DAY or SPECIFIC_DAYS");
        }
    }

    private Set<DayOfWeek> parseDays(List<String> daysOfWeek) {
        if (daysOfWeek == null) return Set.of();
        try {
            return daysOfWeek.stream()
                    .map(d -> DayOfWeek.valueOf(d.trim().toUpperCase()))
                    .collect(Collectors.toSet());
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Days must be valid day names, e.g. MONDAY");
        }
    }

    private void validateSchedule(HabitScheduleType type, Set<DayOfWeek> days) {
        if (type == HabitScheduleType.SPECIFIC_DAYS && (days == null || days.isEmpty())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Select at least one day for a specific-days habit");
        }
    }
}
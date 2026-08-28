package com.sprout.backend.service;

import com.sprout.backend.dto.request.MarkHabitLogRequest;
import com.sprout.backend.dto.response.HabitLogResponse;
import com.sprout.backend.entity.Habit;
import com.sprout.backend.entity.HabitLog;
import com.sprout.backend.entity.HabitStatus;
import com.sprout.backend.exception.ApiException;
import com.sprout.backend.repository.HabitLogRepository;
import com.sprout.backend.repository.HabitRepository;
import com.sprout.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HabitLogService {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;

    /**
     * Marks (or re-marks) a habit's status for a given day — this is the "Mark Complete" /
     * "Mark Missed" / "Add Notes" action. One log row per habit per day: if today already has
     * a log, it's updated in place rather than duplicated.
     */
    public HabitLogResponse markLog(UserPrincipal principal, Long habitId, LocalDate date, MarkHabitLogRequest req) {
        Habit habit = getOwnedHabit(principal.getId(), habitId);
        LocalDate logDate = date != null ? date : LocalDate.now();
        HabitStatus status = parseStatus(req.status());

        HabitLog log = habitLogRepository.findByHabitIdAndLogDate(habit.getId(), logDate)
                .orElseGet(() -> HabitLog.builder()
                        .habit(habit)
                        .user(principal.getUser())
                        .logDate(logDate)
                        .build());

        log.setStatus(status);
        log.setNote(req.note());

        return HabitMapper.toResponse(habitLogRepository.save(log));
    }

    public List<HabitLogResponse> getHistory(UserPrincipal principal, Long habitId, LocalDate from, LocalDate to) {
        Habit habit = getOwnedHabit(principal.getId(), habitId);
        return habitLogRepository.findByHabitIdOrderByLogDateDesc(habit.getId()).stream()
                .filter(l -> from == null || !l.getLogDate().isBefore(from))
                .filter(l -> to == null || !l.getLogDate().isAfter(to))
                .map(HabitMapper::toResponse)
                .toList();
    }

    private Habit getOwnedHabit(Long userId, Long habitId) {
        return habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Habit not found"));
    }

    private HabitStatus parseStatus(String value) {
        try {
            return HabitStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Status must be one of: " + Arrays.toString(HabitStatus.values()));
        }
    }
}

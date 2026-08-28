package com.sprout.backend.service;

import com.sprout.backend.dto.request.CreateHabitRequest;
import com.sprout.backend.dto.request.UpdateHabitRequest;
import com.sprout.backend.dto.response.HabitResponse;
import com.sprout.backend.entity.Habit;
import com.sprout.backend.exception.ApiException;
import com.sprout.backend.repository.HabitRepository;
import com.sprout.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HabitService {

    private final HabitRepository habitRepository;

    public HabitResponse createHabit(UserPrincipal principal, CreateHabitRequest req) {
        Habit habit = Habit.builder()
                .user(principal.getUser())
                .title(req.title().trim())
                .icon(req.icon().trim())
                .color(req.color().trim())
                .reminderTime(req.reminderTime())
                .active(true)
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

        if (req.title() != null && !req.title().isBlank()) habit.setTitle(req.title().trim());
        if (req.icon() != null && !req.icon().isBlank()) habit.setIcon(req.icon().trim());
        if (req.color() != null && !req.color().isBlank()) habit.setColor(req.color().trim());
        if (req.reminderTime() != null) habit.setReminderTime(req.reminderTime());
        if (req.active() != null) habit.setActive(req.active());

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
}

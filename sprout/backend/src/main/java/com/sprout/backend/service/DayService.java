package com.sprout.backend.service;

import com.sprout.backend.dto.response.HabitPhotoResponse;
import com.sprout.backend.dto.response.HabitStatResponse;
import com.sprout.backend.dto.response.HabitStatusResponse;
import com.sprout.backend.dto.response.TodayResponse;
import com.sprout.backend.entity.Habit;
import com.sprout.backend.entity.HabitLog;
import com.sprout.backend.entity.HabitScheduleType;
import com.sprout.backend.entity.User;
import com.sprout.backend.exception.ApiException;
import com.sprout.backend.repository.HabitLogRepository;
import com.sprout.backend.repository.HabitRepository;
import com.sprout.backend.repository.JournalEntryRepository;
import com.sprout.backend.security.UserPrincipal;
import com.sprout.backend.util.ChallengeDayCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Turns a challenge start date into "Day N", and assembles that day's dashboard payload:
 * the day number, today's quote, every active habit with its status for that date, a
 * completion percentage, and whether a journal entry exists yet for that date. This is the
 * single endpoint the Dashboard screen depends on.
 */
@Service
@RequiredArgsConstructor
public class DayService {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final QuoteService quoteService;

    @Value("${sprout.challenge.total-days:75}")
    private int totalDays;

    @Transactional(readOnly = true)
    public TodayResponse getToday(UserPrincipal principal) {
        LocalDate startDate = principal.getUser().getChallengeStartDate();
        LocalDate date = LocalDate.now();
        int dayNumber = ChallengeDayCalculator.dayNumberFor(startDate, date);
        return buildForDate(principal, date, dayNumber);
    }

    @Transactional(readOnly = true)
    public TodayResponse getForDayNumber(UserPrincipal principal, int dayNumber) {
        if (dayNumber < 1 || dayNumber > 365) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Day must be between 1 and 365");
        }
        User user = principal.getUser();
        LocalDate date = ChallengeDayCalculator.dateForDayNumber(user.getChallengeStartDate(), dayNumber);
        return buildForDate(principal, date, dayNumber);
    }

    @Transactional(readOnly = true)
    public TodayResponse getForDate(UserPrincipal principal, LocalDate date) {
        LocalDate startDate = principal.getUser().getChallengeStartDate();
        int dayNumber = ChallengeDayCalculator.dayNumberFor(startDate, date);
        return buildForDate(principal, date, dayNumber);
    }

    private TodayResponse buildForDate(UserPrincipal principal, LocalDate date, int dayNumber) {
        User user = principal.getUser();

        List<Habit> habits = habitRepository.findByUserIdAndActiveTrueOrderByCreatedAtAsc(user.getId()).stream()
                .filter(h -> isScheduledFor(h, date.getDayOfWeek()))
                .toList();
        Map<Long, HabitLog> logByHabitId = new HashMap<>();
        for (HabitLog log : habitLogRepository.findByUserIdAndLogDate(user.getId(), date)) {
            logByHabitId.put(log.getHabit().getId(), log);
        }

        List<HabitStatusResponse> habitStatuses = habits.stream()
                .map(h -> {
                    HabitLog log = logByHabitId.get(h.getId());
                    String status = log != null ? log.getStatus().name() : "PENDING";
                    String note = log != null ? log.getNote() : null;
                    List<HabitStatResponse> stats = log != null ? HabitMapper.statsOf(log) : List.of();
                    List<HabitPhotoResponse> photos = log != null ? HabitMapper.photosOf(log) : List.of();
                    return new HabitStatusResponse(
                            h.getId(), h.getTitle(), h.getIcon(), h.getColor(), h.getReminderTime(),
                            status, note, stats, photos);
                })
                .toList();

        int totalCount = habitStatuses.size();
        int completedCount = (int) habitStatuses.stream().filter(h -> "COMPLETED".equals(h.status())).count();
        int completionPercentage = totalCount == 0 ? 0 : (int) Math.round((completedCount * 100.0) / totalCount);

        String quote = quoteService.getQuoteForDay(dayNumber);
        boolean hasJournalEntry = journalEntryRepository.findByUserIdAndEntryDate(user.getId(), date).isPresent();

        return new TodayResponse(
                dayNumber, totalDays, date, quote, habitStatuses,
                completedCount, totalCount, completionPercentage, hasJournalEntry);
    }

    private boolean isScheduledFor(Habit habit, DayOfWeek dayOfWeek) {
        if (habit.getScheduleType() == HabitScheduleType.EVERY_DAY) return true;
        return habit.getScheduledDays().contains(dayOfWeek);
    }

}

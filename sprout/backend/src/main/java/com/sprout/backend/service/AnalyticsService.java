package com.sprout.backend.service;

import com.sprout.backend.dto.response.*;
import com.sprout.backend.entity.HabitLog;
import com.sprout.backend.entity.User;
import com.sprout.backend.repository.*;
import com.sprout.backend.security.UserPrincipal;
import com.sprout.backend.util.ChallengeDayCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * All analytics are computed on the fly from existing tables — nothing is pre-aggregated.
 * This is fine at the scale of one user's data (a year of daily habits is ~365 × n_habits rows).
 * If it ever becomes slow, the heatmap query is the one to materialise first.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final HabitLogRepository habitLogRepository;
    private final HabitRepository habitRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Value("${sprout.challenge.total-days:75}")
    private int totalChallengeDays;

    public AnalyticsResponse getAnalytics(UserPrincipal principal) {
        User user = principal.getUser();
        Long userId = user.getId();
        LocalDate today = LocalDate.now();
        LocalDate heatmapStart = today.minusDays(364); // 365 days ending today

        // ── Heatmap data (365 days) ─────────────────────────────────────
        List<HabitLog> allLogs = habitLogRepository.findByUserIdBetween(userId, heatmapStart, today);
        Set<LocalDate> journalDates = new HashSet<>(journalEntryRepository.findEntryDatesByUserIdBetween(userId, heatmapStart, today));

        // Group logs by date
        Map<LocalDate, List<HabitLog>> logsByDate = allLogs.stream()
                .collect(Collectors.groupingBy(HabitLog::getLogDate));

        // Total active habits per date — we use the count of unique habits logged that day
        // as the denominator (a habit that wasn't logged yet isn't missed, it's just not logged).
        List<HeatmapDayResponse> heatmap = new ArrayList<>();
        LocalDate cursor = heatmapStart;
        while (!cursor.isAfter(today)) {
            List<HabitLog> dayLogs = logsByDate.getOrDefault(cursor, List.of());
            int total = dayLogs.size();
            int completed = (int) dayLogs.stream().filter(l -> l.getStatus().name().equals("COMPLETED")).count();
            int pct = total == 0 ? -1 : (int) Math.round((completed * 100.0) / total);
            heatmap.add(new HeatmapDayResponse(cursor, completed, total, pct, journalDates.contains(cursor)));
            cursor = cursor.plusDays(1);
        }

        // ── Streaks ──────────────────────────────────────────────────────
        Map<LocalDate, DayCompletion> dayCompletionMap = new HashMap<>();
        for (HabitLog log : allLogs) {
            dayCompletionMap.computeIfAbsent(log.getLogDate(), d -> new DayCompletion()).accept(log);
        }
        Set<LocalDate> completedDates = dayCompletionMap.entrySet().stream()
                .filter(e -> e.getValue().isFullyCompleted())
                .map(Map.Entry::getKey)
                .collect(Collectors.toCollection(TreeSet::new));
        StreakResult streaks = computeStreaks(completedDates, today);

        // Persist updated streaks back to the User row
        if (streaks.current() != user.getCurrentStreak() || streaks.longest() != user.getLongestStreak()) {
            User managed = userRepository.findById(userId).orElse(user);
            managed.setCurrentStreak(streaks.current());
            managed.setLongestStreak(Math.max(managed.getLongestStreak(), streaks.longest()));
            userRepository.save(managed);
        }

        // ── Completion percentages ────────────────────────────────────────
        int allTimePct = safePct(habitLogRepository.countCompleted(userId, heatmapStart, today),
                habitLogRepository.countTotal(userId, heatmapStart, today));
        int last7Pct = safePct(habitLogRepository.countCompleted(userId, today.minusDays(6), today),
                habitLogRepository.countTotal(userId, today.minusDays(6), today));
        int last30Pct = safePct(habitLogRepository.countCompleted(userId, today.minusDays(29), today),
                habitLogRepository.countTotal(userId, today.minusDays(29), today));

        // ── Bar charts ────────────────────────────────────────────────────
        List<WeeklyBarResponse> last7Days = buildDailyBars(logsByDate, journalDates, today.minusDays(6), today, true);
        List<WeeklyBarResponse> last30Days = buildDailyBars(logsByDate, journalDates, today.minusDays(29), today, false);

        // ── Per-habit breakdown ────────────────────────────────────────────
        List<Object[]> rawBreakdown = habitLogRepository.countCompletedPerHabit(userId, heatmapStart, today);
        long totalDays = ChronoRange.days(heatmapStart, today);
        List<HabitBreakdownResponse> breakdown = rawBreakdown.stream().map(row -> {
            long habitId = ((Number) row[0]).longValue();
            String title = (String) row[1];
            String color = (String) row[2];
            long completedCount = ((Number) row[3]).longValue();
            int pct = (int) Math.round((completedCount * 100.0) / totalDays);
            return new HabitBreakdownResponse(habitId, title, color, completedCount, totalDays, pct);
        }).sorted(Comparator.comparingLong(HabitBreakdownResponse::completedDays).reversed()).toList();

        // ── Journal stats ─────────────────────────────────────────────────
        long journalLast30 = journalEntryRepository.countByUserIdBetween(userId, today.minusDays(29), today);
        long journalAllTime = journalEntryRepository.countByUserIdBetween(userId, LocalDate.of(2020, 1, 1), today);

        // ── Project progress (reuse existing summary) ──────────────────────
        List<ProjectSummaryResponse> projects = projectRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(p -> {
                    var ms = p.getMilestones();
                    int prog = ms.isEmpty() ? 0 : (int) Math.round(ms.stream()
                            .mapToInt(m -> {
                                int tot = m.getChecklistItems().size();
                                int done = (int) m.getChecklistItems().stream().filter(i -> i.getCompleted()).count();
                                return tot == 0 ? 0 : (int) Math.round(done * 100.0 / tot);
                            }).average().orElse(0));
                    long completedMs = ms.stream().filter(m -> {
                        int tot = m.getChecklistItems().size();
                        int done = (int) m.getChecklistItems().stream().filter(i -> i.getCompleted()).count();
                        return tot > 0 && done == tot;
                    }).count();
                    return new ProjectSummaryResponse(
                            p.getId(), p.getName(), p.getDescription(), p.getDeadline(),
                            prog, ms.size(), (int) completedMs, p.getCreatedAt(), p.getUpdatedAt());
                })
                .toList();

        // ── Challenge day ─────────────────────────────────────────────────
        int challengeDay = ChallengeDayCalculator.dayNumberFor(user.getChallengeStartDate(), today);

        StreakResponse streakResp = new StreakResponse(
                streaks.current(), streaks.longest(), completedDates.size(), challengeDay, totalChallengeDays);

        return new AnalyticsResponse(
                streakResp, allTimePct, last7Pct, last30Pct,
                journalLast30, journalAllTime,
                heatmap, last7Days, last30Days, breakdown, projects);
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private record StreakResult(int current, int longest) {}

    private StreakResult computeStreaks(Set<LocalDate> completedDates, LocalDate today) {
        if (completedDates.isEmpty()) return new StreakResult(0, 0);

        // Current streak: count backwards from today (include today if completed)
        int current = 0;
        LocalDate check = today;
        while (completedDates.contains(check)) {
            current++;
            check = check.minusDays(1);
        }
        // If today isn't complete, check if yesterday starts the streak
        if (current == 0) {
            check = today.minusDays(1);
            while (completedDates.contains(check)) {
                current++;
                check = check.minusDays(1);
            }
        }

        // Longest streak: scan through sorted dates
        List<LocalDate> sorted = new ArrayList<>(completedDates);
        int longest = 0, run = 0;
        LocalDate prev = null;
        for (LocalDate d : sorted) {
            if (prev != null && d.equals(prev.plusDays(1))) {
                run++;
            } else {
                run = 1;
            }
            if (run > longest) longest = run;
            prev = d;
        }

        return new StreakResult(current, Math.max(current, longest));
    }

    private static final class DayCompletion {
        private int total;
        private int completed;

        void accept(HabitLog log) {
            total++;
            if (log.getStatus() == com.sprout.backend.entity.HabitStatus.COMPLETED) {
                completed++;
            }
        }

        boolean isFullyCompleted() {
            return total > 0 && total == completed;
        }
    }

    private List<WeeklyBarResponse> buildDailyBars(
            Map<LocalDate, List<HabitLog>> logsByDate,
            Set<LocalDate> journalDates,
            LocalDate from, LocalDate to,
            boolean shortLabel) {
        List<WeeklyBarResponse> bars = new ArrayList<>();
        LocalDate d = from;
        while (!d.isAfter(to)) {
            List<HabitLog> dayLogs = logsByDate.getOrDefault(d, List.of());
            int total = dayLogs.size();
            int completed = (int) dayLogs.stream().filter(l -> l.getStatus().name().equals("COMPLETED")).count();
            int pct = total == 0 ? 0 : (int) Math.round((completed * 100.0) / total);
            String label = shortLabel
                    ? d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                    : d.getMonthValue() + "/" + d.getDayOfMonth();
            bars.add(new WeeklyBarResponse(label, completed, total, pct, journalDates.contains(d)));
            d = d.plusDays(1);
        }
        return bars;
    }

    private int safePct(long completed, long total) {
        return total == 0 ? 0 : (int) Math.round((completed * 100.0) / total);
    }

    /** Simple day-count helper to avoid importing a separate class. */
    private static final class ChronoRange {
        static long days(LocalDate from, LocalDate to) {
            return from.until(to).getDays() + 1;
        }
    }
}

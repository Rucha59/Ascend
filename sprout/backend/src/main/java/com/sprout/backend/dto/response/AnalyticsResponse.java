package com.sprout.backend.dto.response;

import java.util.List;

public record AnalyticsResponse(
        StreakResponse streaks,
        int allTimeCompletionPct,
        int last7DaysCompletionPct,
        int last30DaysCompletionPct,
        long journalEntriesLast30Days,
        long journalEntriesAllTime,
        List<HeatmapDayResponse> heatmap,      // last 365 days
        List<WeeklyBarResponse> last7Days,     // daily bars for the last 7 days
        List<WeeklyBarResponse> last30Days,    // daily bars for the last 30 days
        List<HabitBreakdownResponse> habitBreakdown,
        List<ProjectSummaryResponse> projectProgress // reuse the existing summary shape
) {}

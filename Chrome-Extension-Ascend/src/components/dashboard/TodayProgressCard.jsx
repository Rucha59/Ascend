import React from "react";
import ProgressRing from "../common/ProgressRing";
import { CheckCircle2, Clock } from "lucide-react";

export default function TodayProgressCard({
  completionPct = 0,
  completedHabits = 0,
  totalHabits = 0,
  pendingTasksCount = 0,
  completedTasksCount = 0,
  quote,
}) {
  return (
    <div className="ascend-card p-4">
      <div className="flex items-center gap-4">
        {/* Progress Ring */}
        <ProgressRing pct={completionPct} size={84} stroke={8} />

        {/* Momentum & Stats */}
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-bold text-text leading-tight">
            Today's Progress
          </h2>
          <p className="text-[12px] text-text-secondary mt-0.5">
            {completedHabits} of {totalHabits} habits done
          </p>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 mt-2.5">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-success bg-success-surface px-2 py-0.5 rounded-pill">
              <CheckCircle2 size={12} />
              <span>{completedHabits + completedTasksCount} completed</span>
            </div>
            {pendingTasksCount > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-text-secondary bg-surface-muted px-2 py-0.5 rounded-pill">
                <Clock size={12} />
                <span>{pendingTasksCount} to-do</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Quote if available */}
      {quote && (
        <div className="mt-3 pt-2.5 border-t border-border">
          <p className="text-[11px] italic text-text-muted leading-relaxed line-clamp-2">
            "{quote}"
          </p>
        </div>
      )}
    </div>
  );
}

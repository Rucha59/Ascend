import React from "react";
import { Plus, CheckCircle2, XCircle, MinusCircle, Circle } from "lucide-react";
import { getHabitIcon } from "../../lib/habitIcons";
import StatusPill from "../common/StatusPill";

// Cycle status: PENDING -> COMPLETED -> MISSED -> SKIPPED -> PENDING
const CYCLE = ["COMPLETED", "MISSED", "SKIPPED"];
function getNextStatus(current) {
  if (!current || current === "PENDING") return "COMPLETED";
  const nextIdx = (CYCLE.indexOf(current) + 1) % (CYCLE.length + 1);
  return nextIdx === CYCLE.length ? "PENDING" : CYCLE[nextIdx];
}

export default function HabitQuickStrip({ habits = [], onCycleStatus, onOpenAddHabit }) {
  return (
    <div className="space-y-2">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[13px] font-bold text-text uppercase tracking-wider">
          Daily Habits
        </h3>
        <button
          onClick={onOpenAddHabit}
          className="text-[12px] font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
          title="Add a new habit"
        >
          <Plus size={14} />
          <span>New Habit</span>
        </button>
      </div>

      {/* Habits Grid / Horizontal scroll */}
      {habits.length === 0 ? (
        <div className="ascend-card p-4 text-center">
          <p className="text-[13px] text-text-secondary">No habits tracked yet.</p>
          <button
            onClick={onOpenAddHabit}
            className="btn-primary mt-2 text-[12px] py-1.5 px-3"
          >
            <Plus size={13} />
            <span>Create your first habit</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {habits.map((habit) => {
            const Icon = getHabitIcon(habit.icon);
            const status = habit.status || "PENDING";
            const isCompleted = status === "COMPLETED";

            return (
              <div
                key={habit.habitId}
                onClick={() => onCycleStatus(habit.habitId, getNextStatus(status))}
                className={`ascend-card p-2.5 flex flex-col justify-between cursor-pointer select-none transition-all duration-150 hover:border-border-strong active:scale-[0.98] ${
                  isCompleted ? "bg-surface-raised" : "bg-surface"
                }`}
                title={`Click to cycle: ${status} -> ${getNextStatus(status)}`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${habit.color || "var(--color-primary)"}22`,
                      color: habit.color || "var(--color-primary)",
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <StatusPill status={status} />
                </div>

                <div className="mt-2 min-w-0">
                  <p
                    className={`text-[13px] font-semibold truncate ${
                      isCompleted ? "text-text-secondary line-through opacity-85" : "text-text"
                    }`}
                  >
                    {habit.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import InlineTaskInput from "./InlineTaskInput";
import TaskRow from "./TaskRow";
import { CheckCircle2 } from "lucide-react";

export default function TaskSection({
  tasks = [],
  onAddTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
}) {
  const [filter, setFilter] = useState("all"); // "all" | "open" | "done"

  const filteredTasks = tasks.filter((t) => {
    if (filter === "open") return !t.completed;
    if (filter === "done") return !!t.completed;
    return true;
  });

  const openCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-2.5">
      {/* Section Header with Filter Tabs */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[13px] font-bold text-text uppercase tracking-wider">
            Tasks
          </h3>
          {openCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-pill bg-primary-subtle text-primary">
              {openCount}
            </span>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-surface-muted p-0.5 rounded-md border border-border">
          {["all", "open", "done"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded-sm text-[11px] font-semibold capitalize transition-all ${
                filter === f
                  ? "bg-surface text-primary shadow-sm"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Inline Task Creation directly on Home */}
      <InlineTaskInput onAddTask={onAddTask} />

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="ascend-card p-4 text-center">
          {filter === "done" ? (
            <p className="text-[12px] text-text-muted">No completed tasks yet.</p>
          ) : (
            <div className="flex flex-col items-center justify-center py-1">
              <CheckCircle2 size={24} className="text-primary mb-1 opacity-80" />
              <p className="text-[13px] font-semibold text-text">All caught up!</p>
              <p className="text-[11px] text-text-muted">No pending tasks for today.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredTasks.map((task) => (
            <TaskRow
              key={task.id || task.taskId || `${task.source}-${task.title}`}
              item={task}
              onToggle={onToggleTask}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}

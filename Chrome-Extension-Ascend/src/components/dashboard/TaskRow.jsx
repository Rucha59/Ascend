import React, { useState } from "react";
import { Check, MoreVertical, Trash2, Edit2, Calendar, FolderKanban } from "lucide-react";
import PriorityBadge from "../common/PriorityBadge";

export default function TaskRow({
  item,
  onToggle,
  onUpdate,
  onDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [showMenu, setShowMenu] = useState(false);

  const isChecklist = item.source === "CHECKLIST";
  const isMilestone = item.source === "MILESTONE";
  const isCompleted = !!item.completed;

  // Determine if overdue
  const todayStr = new Date().toISOString().split("T")[0];
  const isOverdue = !isCompleted && item.dueDate && item.dueDate < todayStr;

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    onUpdate(item.id || item.taskId, { title: editTitle.trim() });
    setIsEditing(false);
  };

  return (
    <div
      className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${
        isCompleted ? "bg-surface-raised/60" : "bg-surface hover:bg-surface-raised"
      } border border-border`}
    >
      {/* Checkbox */}
      {!isMilestone ? (
        <button
          onClick={() => onToggle(item)}
          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
            isCompleted
              ? "bg-primary border-primary text-on-primary"
              : "border-border-strong hover:border-primary bg-surface"
          }`}
          aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
        >
          {isCompleted && <Check size={11} strokeWidth={3} />}
        </button>
      ) : (
        <FolderKanban size={15} className="text-primary shrink-0" />
      )}

      {/* Title & metadata */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="flex items-center gap-1">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveEdit}
              autoFocus
              className="w-full bg-surface-raised border border-primary text-[13px] text-text rounded px-1.5 py-0.5 outline-none"
            />
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <span
              className={`text-[13px] font-medium truncate ${
                isCompleted
                  ? "line-through text-text-muted"
                  : "text-text"
              }`}
            >
              {item.title}
            </span>

            {/* Checklist / Project context indicator */}
            {item.projectName && (
              <span className="text-[10px] font-medium text-text-muted shrink-0 bg-surface-muted px-1 rounded">
                {item.projectName}
              </span>
            )}
          </div>
        )}

        {/* Due date / Overdue tag */}
        <div className="flex items-center gap-2 mt-0.5">
          {isOverdue && (
            <span className="text-[10px] font-bold text-danger bg-danger-surface px-1 rounded">
              Overdue
            </span>
          )}
          {item.dueDate && !isOverdue && (
            <span className="text-[10px] text-text-muted flex items-center gap-0.5">
              <Calendar size={10} />
              {item.dueDate === todayStr ? "Today" : item.dueDate}
            </span>
          )}
        </div>
      </div>

      {/* Priority Badge */}
      {item.priority && <PriorityBadge priority={item.priority} />}

      {/* Context Menu for Task (Edit/Delete) */}
      {!isMilestone && !isChecklist && (
        <div className="relative shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-text hover:bg-surface-muted"
            aria-label="Task options"
          >
            <MoreVertical size={14} />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-7 w-28 ascend-card p-1 z-30 shadow-popover">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setIsEditing(true);
                  }}
                  className="w-full flex items-center gap-1.5 px-2 py-1 text-left text-[11px] font-medium text-text hover:bg-surface-muted rounded"
                >
                  <Edit2 size={12} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(item.id || item.taskId);
                  }}
                  className="w-full flex items-center gap-1.5 px-2 py-1 text-left text-[11px] font-medium text-danger hover:bg-danger-surface rounded"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

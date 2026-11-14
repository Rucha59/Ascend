import React, { useState, useRef } from "react";
import { Plus, Calendar, Flag, X, Check } from "lucide-react";

const PRIORITIES = [
  { id: "HIGH", label: "High", color: "var(--color-danger)" },
  { id: "MEDIUM", label: "Med", color: "var(--color-warning)" },
  { id: "LOW", label: "Low", color: "var(--color-text-muted)" },
];

export default function InlineTaskInput({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddTask({
        title: title.trim(),
        priority,
        dueDate: dueDate || null,
      });
      setTitle("");
      setDueDate("");
      setPriority("MEDIUM");
      setIsExpanded(false);
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === "Escape") {
      setIsExpanded(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`ascend-card transition-all duration-150 ${
        isExpanded ? "p-3 border-border-strong bg-surface" : "p-2 bg-surface hover:border-border-strong"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center shrink-0 text-text-muted">
          <Plus size={13} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task for today... (Press Enter)"
          className="flex-1 bg-transparent text-[13px] text-text placeholder-text-muted outline-none font-medium"
        />

        {title.trim() && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center shrink-0 hover:bg-primary-hover active:scale-95 transition-all"
            title="Create task"
          >
            <Check size={13} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Expanded options: Priority & Custom Due Date */}
      {isExpanded && (
        <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between gap-2 flex-wrap text-xs">
          {/* Priority pills */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-text-muted mr-1">Priority:</span>
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id)}
                className={`px-2 py-0.5 rounded-sm text-[10px] font-bold transition-colors ${
                  priority === p.id
                    ? "bg-primary text-on-primary"
                    : "bg-surface-muted text-text-secondary hover:bg-primary-subtle"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] text-text-muted">
              <Calendar size={12} />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-surface-raised border border-border text-text rounded px-1.5 py-0.5 text-[11px] outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-text-muted hover:text-text p-1"
              title="Collapse"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

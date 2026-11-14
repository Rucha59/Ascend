import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { ICON_OPTIONS, COLOR_OPTIONS, getHabitIcon } from "../../lib/habitIcons";
import { createHabit, updateHabit, deleteHabit } from "../../api/habits";
import { Trash2 } from "lucide-react";

const DAYS_OF_WEEK = [
  { key: "MONDAY", label: "M" },
  { key: "TUESDAY", label: "T" },
  { key: "WEDNESDAY", label: "W" },
  { key: "THURSDAY", label: "T" },
  { key: "FRIDAY", label: "F" },
  { key: "SATURDAY", label: "S" },
  { key: "SUNDAY", label: "S" },
];

export default function HabitModal({ isOpen, onClose, habit = null, onSaved, onDeleted }) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("Droplet");
  const [color, setColor] = useState("#187D62");
  const [reminderTime, setReminderTime] = useState("");
  const [scheduleType, setScheduleType] = useState("EVERY_DAY");
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (habit) {
      setTitle(habit.title || "");
      setIcon(habit.icon || "Droplet");
      setColor(habit.color || "#187D62");
      setReminderTime(habit.reminderTime || "");
      setScheduleType(habit.scheduleType || "EVERY_DAY");
      setDaysOfWeek(habit.daysOfWeek || []);
    } else {
      setTitle("");
      setIcon("Droplet");
      setColor("#187D62");
      setReminderTime("");
      setScheduleType("EVERY_DAY");
      setDaysOfWeek([]);
    }
    setError("");
  }, [habit, isOpen]);

  const toggleDay = (dayKey) => {
    setDaysOfWeek((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a habit title.");
      return;
    }

    if (scheduleType === "SPECIFIC_DAYS" && daysOfWeek.length === 0) {
      setError("Please select at least one day of the week.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const payload = {
      title: title.trim(),
      icon,
      color,
      reminderTime: reminderTime || null,
      scheduleType,
      daysOfWeek: scheduleType === "SPECIFIC_DAYS" ? daysOfWeek : [],
    };

    try {
      if (habit?.id || habit?.habitId) {
        await updateHabit(habit.id || habit.habitId, payload);
      } else {
        await createHabit(payload);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save habit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!habit?.id && !habit?.habitId) return;
    if (!confirm("Are you sure you want to delete this habit?")) return;

    setIsSubmitting(true);
    try {
      await deleteHabit(habit.id || habit.habitId);
      onDeleted?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete habit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentIcon = getHabitIcon(icon);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habit ? "Edit Habit" : "New Daily Habit"}
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2 rounded bg-danger-surface text-danger text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Title & Preview */}
        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
            Habit Name
          </label>
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 border border-border"
              style={{ backgroundColor: `${color}22`, color }}
            >
              <CurrentIcon size={20} />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read 20 pages"
              autoFocus
              className="w-full bg-surface-raised border border-border rounded-md px-3 py-2 text-[13px] text-text outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Icon picker */}
        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">
            Icon
          </label>
          <div className="grid grid-cols-8 gap-1.5">
            {ICON_OPTIONS.map(({ name, Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => setIcon(name)}
                className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                  icon === name
                    ? "bg-primary text-on-primary ring-2 ring-primary ring-offset-1"
                    : "bg-surface-raised text-text-secondary hover:bg-primary-subtle"
                }`}
                title={name}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">
            Color
          </label>
          <div className="flex items-center gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={`w-6 h-6 rounded-full transition-transform ${
                  color === c.value ? "scale-110 ring-2 ring-primary ring-offset-1" : "hover:scale-105"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">
            Schedule
          </label>
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setScheduleType("EVERY_DAY")}
              className={`flex-1 py-1 px-2 rounded-md text-xs font-semibold transition-colors ${
                scheduleType === "EVERY_DAY"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-raised text-text-secondary hover:bg-primary-subtle"
              }`}
            >
              Every Day
            </button>
            <button
              type="button"
              onClick={() => setScheduleType("SPECIFIC_DAYS")}
              className={`flex-1 py-1 px-2 rounded-md text-xs font-semibold transition-colors ${
                scheduleType === "SPECIFIC_DAYS"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-raised text-text-secondary hover:bg-primary-subtle"
              }`}
            >
              Specific Days
            </button>
          </div>

          {scheduleType === "SPECIFIC_DAYS" && (
            <div className="flex items-center justify-between gap-1 pt-1">
              {DAYS_OF_WEEK.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => toggleDay(d.key)}
                  className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    daysOfWeek.includes(d.key)
                      ? "bg-primary text-on-primary"
                      : "bg-surface-raised text-text-muted hover:bg-primary-subtle"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          {habit ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="text-danger hover:text-danger/80 p-1.5 rounded transition-colors"
              title="Delete habit"
            >
              <Trash2 size={16} />
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="btn-primary"
            >
              {isSubmitting ? "Saving..." : habit ? "Save Changes" : "Create Habit"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

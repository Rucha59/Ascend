import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Check, ChevronLeft, ChevronRight, CheckCircle2, Circle, MinusCircle, XCircle } from "lucide-react";
import { listHabits, createHabit, updateHabit, deleteHabit, markHabitLog } from "../api/habits";
import { getForDate } from "../api/days";
import { ICON_OPTIONS, COLOR_OPTIONS, getHabitIcon } from "../lib/habitIcons";

const DAYS_OF_WEEK = [
  { key: "MONDAY", label: "Mon" },
  { key: "TUESDAY", label: "Tue" },
  { key: "WEDNESDAY", label: "Wed" },
  { key: "THURSDAY", label: "Thu" },
  { key: "FRIDAY", label: "Fri" },
  { key: "SATURDAY", label: "Sat" },
  { key: "SUNDAY", label: "Sun" },
];

const EMPTY_FORM = {
  title: "",
  icon: ICON_OPTIONS[0].name,
  color: COLOR_OPTIONS[0].value,
  reminderTime: "",
  scheduleType: "EVERY_DAY",
  daysOfWeek: [],
};

/* status cycle mirrors the Dashboard's behaviour: PENDING -> COMPLETED -> MISSED -> SKIPPED -> COMPLETED... */
const CYCLE = ["COMPLETED", "MISSED", "SKIPPED"];
function nextStatus(current) {
  if (current === "PENDING" || !current) return "COMPLETED";
  return CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
}

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, delta) {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

function formatDateLabel(date) {
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function scheduleLabel(h) {
  if (!h.daysOfWeek || h.scheduleType === "EVERY_DAY" || h.daysOfWeek.length === 0) return "Every day";
  const order = DAYS_OF_WEEK.map((d) => d.key);
  return h.daysOfWeek
      .slice()
      .sort((a, b) => order.indexOf(a) - order.indexOf(b))
      .map((k) => DAYS_OF_WEEK.find((d) => d.key === k)?.label || k)
      .join(", ");
}

function StatusIcon({ status }) {
  if (status === "COMPLETED") return <CheckCircle2 size={22} color="#4b7a36" />;
  if (status === "MISSED") return <XCircle size={22} color="#c24a6a" />;
  if (status === "SKIPPED") return <MinusCircle size={22} color="var(--text-muted)" />;
  return <Circle size={22} color="var(--border)" />;
}

function DaySchedulePicker({ value, onChange }) {
  return (
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <button
              type="button"
              onClick={() => onChange({ ...value, scheduleType: "EVERY_DAY", daysOfWeek: [] })}
              className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: value.scheduleType === "EVERY_DAY" ? "#FF8B6B" : "var(--surface-2)",
                color: value.scheduleType === "EVERY_DAY" ? "#3A1F16" : "var(--text-muted)",
              }}
          >
            Every day
          </button>
          <button
              type="button"
              onClick={() => onChange({ ...value, scheduleType: "SPECIFIC_DAYS" })}
              className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: value.scheduleType === "SPECIFIC_DAYS" ? "#FF8B6B" : "var(--surface-2)",
                color: value.scheduleType === "SPECIFIC_DAYS" ? "#3A1F16" : "var(--text-muted)",
              }}
          >
            Specific days
          </button>
        </div>
        {value.scheduleType === "SPECIFIC_DAYS" && (
            <div className="flex flex-wrap items-center gap-1.5">
              {DAYS_OF_WEEK.map(({ key, label }) => {
                const active = value.daysOfWeek.includes(key);
                return (
                    <button
                        type="button"
                        key={key}
                        onClick={() =>
                            onChange({
                              ...value,
                              daysOfWeek: active ? value.daysOfWeek.filter((d) => d !== key) : [...value.daysOfWeek, key],
                            })
                        }
                        className="w-9 h-9 rounded-full text-xs font-bold"
                        style={{
                          background: active ? "#FF8B6B" : "var(--surface-2)",
                          color: active ? "#3A1F16" : "var(--text-muted)",
                          border: "1px solid var(--border)",
                        }}
                    >
                      {label[0]}
                    </button>
                );
              })}
            </div>
        )}
      </div>
  );
}

export default function Habits() {
  /* ── habit definitions (management) ── */
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [showCreateForm, setShowCreateForm] = useState(false);

  /* ── date-based tracker ── */
  const [selectedDate, setSelectedDate] = useState(startOfToday);
  const [dayData, setDayData] = useState(null);
  const [dayLoading, setDayLoading] = useState(true);
  const [dayError, setDayError] = useState("");

  const isDuplicateTitle = (title, excludeId = null) =>
      habits.some((h) => h.id !== excludeId && h.title.trim().toLowerCase() === title.trim().toLowerCase());


  const load = () => {
    setLoading(true);
    listHabits()
        .then(setHabits)
        .catch(() => setError("Couldn't load your habits."))
        .finally(() => setLoading(false));
  };


  const loadDay = (date) => {
    setDayLoading(true);
    setDayError("");
    getForDate(toISODate(date))
        .then(setDayData)
        .catch(() => setDayError("Couldn't load habits for that day."))
        .finally(() => setDayLoading(false));
  };

  useEffect(load, []);
  useEffect(() => { loadDay(selectedDate); }, [selectedDate]);

  const isToday = toISODate(selectedDate) === toISODate(startOfToday());
  const nextDisabled = toISODate(selectedDate) >= toISODate(startOfToday());

  const goPrevDay = () => setSelectedDate((d) => addDays(d, -1));
  const goNextDay = () => { if (!nextDisabled) setSelectedDate((d) => addDays(d, 1)); };
  const goToday = () => setSelectedDate(startOfToday());

  const handleMark = async (habit) => {
    const dateStr = toISODate(selectedDate);
    const newStatus = nextStatus(habit.status);
    setDayData((prev) => {
      if (!prev) return prev;
      const updated = prev.habits.map((h) => (h.habitId === habit.habitId ? { ...h, status: newStatus } : h));
      const cc = updated.filter((h) => h.status === "COMPLETED").length;
      const tc = updated.length;
      return {
        ...prev,
        habits: updated,
        completedCount: cc,
        totalCount: tc,
        completionPercentage: tc ? Math.round((cc * 100) / tc) : 0,
      };
    });
    try {
      await markHabitLog(habit.habitId, { status: newStatus, note: habit.note || "", date: dateStr });
    } catch {
      setDayError("Couldn't update that habit.");
      loadDay(selectedDate);
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await createHabit({
        title: form.title,
        icon: form.icon,
        color: form.color,
        reminderTime: form.reminderTime || null,
        scheduleType: form.scheduleType,
        daysOfWeek: form.scheduleType === "SPECIFIC_DAYS" ? form.daysOfWeek : [],
      });
      setForm(EMPTY_FORM);
      setShowCreateForm(false);
      load();
      loadDay(selectedDate);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create that habit.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (h) => {
    setEditingId(h.id);
    setEditForm({
      title: h.title,
      icon: h.icon,
      color: h.color,
      reminderTime: h.reminderTime ? h.reminderTime.slice(0, 5) : "",
      scheduleType: h.scheduleType || "EVERY_DAY",
      daysOfWeek: h.daysOfWeek || [],
    });
  };

  const submitEdit = async (id) => {
    try {
      await updateHabit(id, {
        title: editForm.title,
        icon: editForm.icon,
        color: editForm.color,
        reminderTime: editForm.reminderTime || null,
        scheduleType: editForm.scheduleType,
        daysOfWeek: editForm.scheduleType === "SPECIFIC_DAYS" ? editForm.daysOfWeek : [],
      });
      setEditingId(null);
      load();
      loadDay(selectedDate);
    } catch {
      setError("Couldn't save those changes.");
    }
  };

  const remove = async (id) => {
    try {
      await deleteHabit(id);
      load();
      loadDay(selectedDate);
    } catch {
      setError("Couldn't remove that habit.");
    }
  };

  return (
      <div className="pt-6 grid gap-6 pb-10 max-w-2xl">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>Your habits</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Track any day — go back and fill in what you missed, or plan ahead with a schedule.
          </p>
        </div>

        {/* ── Date navigation + tracker ── */}
        <div className="rounded-3xl p-5 grid gap-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between gap-2">
            <button onClick={goPrevDay} className="p-2 rounded-full" style={{ background: "var(--surface-2)" }} aria-label="Previous day">
              <ChevronLeft size={16} style={{ color: "var(--text)" }} />
            </button>
            <div className="text-center">
              <p className="font-display text-base font-bold" style={{ color: "var(--text)" }}>{formatDateLabel(selectedDate)}</p>
              {dayData && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Day {dayData.dayNumber} of {dayData.totalDays} · {dayData.completedCount}/{dayData.totalCount} done ({dayData.completionPercentage}%)
                  </p>
              )}
            </div>
            <button
                onClick={goNextDay}
                disabled={nextDisabled}
                className="p-2 rounded-full disabled:opacity-30"
                style={{ background: "var(--surface-2)" }}
                aria-label="Next day"
            >
              <ChevronRight size={16} style={{ color: "var(--text)" }} />
            </button>
          </div>

          {!isToday && (
              <button
                  onClick={goToday}
                  className="justify-self-center text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: "var(--surface-2)", color: "var(--text)" }}
              >
                Jump to today
              </button>
          )}

          {dayError && (
              <p className="text-sm px-3 py-2 rounded-xl" style={{ background: "#FF88AA22", color: "#D1467A" }}>{dayError}</p>
          )}

          {dayLoading ? (
              <p style={{ color: "var(--text-muted)" }}>Loading…</p>
          ) : !dayData || dayData.habits.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No habits scheduled for this day.</p>
          ) : (
              <div className="grid gap-2">
                {dayData.habits.map((h) => {
                  const Icon = getHabitIcon(h.icon);
                  return (
                      <button
                          key={h.habitId}
                          onClick={() => handleMark(h)}
                          className="rounded-2xl p-3 flex items-center gap-3 text-left w-full"
                          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: h.color + "22" }}>
                          <Icon size={17} color={h.color} />
                        </div>
                        <span className="flex-1 min-w-0 text-sm font-medium" style={{ color: "var(--text)" }}>{h.title}</span>
                        <StatusIcon status={h.status} />
                      </button>
                  );
                })}
              </div>
          )}
        </div>

        {/* ── Manage habits ── */}
        {error && (
            <p className="text-sm px-3 py-2 rounded-xl" style={{ background: "#FF88AA22", color: "#D1467A" }}>{error}</p>
        )}

        {!showCreateForm ? (
            <button
                onClick={() => setShowCreateForm(true)}
                className="font-display font-bold text-sm px-4 py-2.5 rounded-full flex items-center gap-1.5 justify-self-start"
                style={{ background: "#FF8B6B", color: "#3A1F16" }}
            >
              <Plus size={15} /> New Habit
            </button>
        ) : (
            <form
                onSubmit={submitCreate}
                className="rounded-3xl p-5 grid gap-3"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm" style={{ color: "var(--text-muted)" }}>New habit</h2>
                <button type="button" onClick={() => { setShowCreateForm(false); setForm(EMPTY_FORM); }} className="p-1">
                  <X size={16} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>

              <input
                  required
                  placeholder="Title, e.g. Drink 3L water"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
              {form.title.trim() && isDuplicateTitle(form.title) && (
                  <p className="text-xs" style={{ color: "#D1467A" }}>You already have a habit named "{form.title.trim()}".</p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <select
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                >
                  {ICON_OPTIONS.map(({ name }) => (
                      <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1.5">
                  {COLOR_OPTIONS.map(({ name, value }) => (
                      <button
                          type="button"
                          key={value}
                          title={name}
                          onClick={() => setForm({ ...form, color: value })}
                          className="w-7 h-7 rounded-full"
                          style={{ background: value, border: form.color === value ? "2px solid var(--text)" : "2px solid transparent" }}
                      />
                  ))}
                </div>
                <input
                    type="time"
                    value={form.reminderTime}
                    onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
                    className="px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              </div>

              <DaySchedulePicker value={form} onChange={setForm} />

              <div className="flex items-center gap-2">
                <button
                    type="submit"
                    disabled={creating || (form.scheduleType === "SPECIFIC_DAYS" && form.daysOfWeek.length === 0) || isDuplicateTitle(form.title)}                    className="font-display font-bold text-sm px-4 py-2.5 rounded-full disabled:opacity-60"
                    style={{ background: "#FF8B6B", color: "#3A1F16" }}
                >
                  <Plus size={15} className="inline mr-1" />
                  {creating ? "Adding…" : "Add habit"}
                </button>
                <button
                    type="button"
                    onClick={() => { setShowCreateForm(false); setForm(EMPTY_FORM); }}
                    className="text-sm px-3 py-2.5 rounded-xl"
                    style={{ color: "var(--text-muted)" }}
                >
                  Cancel
                </button>
              </div>
            </form>
        )}

        {loading ? (
            <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        ) : habits.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No habits yet — add your first one above.</p>
        ) : (
            <div className="grid gap-2">
              {habits.map((h) => {
                const Icon = getHabitIcon(h.icon);
                const isEditing = editingId === h.id;
                return (
                    <div key={h.id} className="rounded-2xl p-3.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                      {isEditing ? (
                          <div className="grid gap-2">
                            <input
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="px-3 py-2 rounded-lg text-sm outline-none"
                                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                            />
                            <div className="flex flex-wrap items-center gap-3">
                              <select
                                  value={editForm.icon}
                                  onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                                  className="px-3 py-2 rounded-lg text-sm outline-none"
                                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                              >
                                {ICON_OPTIONS.map(({ name }) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                              </select>
                              <div className="flex items-center gap-1.5">
                                {COLOR_OPTIONS.map(({ name, value }) => (
                                    <button
                                        type="button"
                                        key={value}
                                        title={name}
                                        onClick={() => setEditForm({ ...editForm, color: value })}
                                        className="w-6 h-6 rounded-full"
                                        style={{ background: value, border: editForm.color === value ? "2px solid var(--text)" : "2px solid transparent" }}
                                    />
                                ))}
                              </div>
                              <input
                                  type="time"
                                  value={editForm.reminderTime}
                                  onChange={(e) => setEditForm({ ...editForm, reminderTime: e.target.value })}
                                  className="px-3 py-2 rounded-lg text-sm outline-none"
                                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                              />
                              <div className="flex items-center gap-1.5 ml-auto">
                                <button onClick={() => submitEdit(h.id)} className="p-1.5 rounded-lg" style={{ background: "#8FBE7A22" }} aria-label="Save">
                                  <Check size={15} color="#8FBE7A" />
                                </button>
                                <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg" style={{ background: "var(--surface-2)" }} aria-label="Cancel">
                                  <X size={15} style={{ color: "var(--text-muted)" }} />
                                </button>
                              </div>
                            </div>
                            <DaySchedulePicker value={editForm} onChange={setEditForm} />
                          </div>
                      ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: h.color + "22" }}>
                              <Icon size={17} color={h.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{h.title}</p>
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {scheduleLabel(h)}
                                {h.reminderTime ? ` · Reminder ${h.reminderTime.slice(0, 5)}` : ""}
                              </p>
                            </div>
                            <button onClick={() => startEdit(h)} className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }} aria-label="Edit">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => remove(h.id)} className="p-1.5 rounded-lg" style={{ color: "#FF88AA" }} aria-label="Delete">
                              <Trash2 size={15} />
                            </button>
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
        )}
      </div>
  );
}
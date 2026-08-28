import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { listHabits, createHabit, updateHabit, deleteHabit } from "../api/habits";
import { ICON_OPTIONS, COLOR_OPTIONS, getHabitIcon } from "../lib/habitIcons";

const EMPTY_FORM = { title: "", icon: ICON_OPTIONS[0].name, color: COLOR_OPTIONS[0].value, reminderTime: "" };

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const load = () => {
    setLoading(true);
    listHabits()
      .then(setHabits)
      .catch(() => setError("Couldn't load your habits."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

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
      });
      setForm(EMPTY_FORM);
      setShowCreateForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create that habit.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (h) => {
    setEditingId(h.id);
    setEditForm({ title: h.title, icon: h.icon, color: h.color, reminderTime: h.reminderTime ? h.reminderTime.slice(0, 5) : "" });
  };

  const submitEdit = async (id) => {
    try {
      await updateHabit(id, {
        title: editForm.title,
        icon: editForm.icon,
        color: editForm.color,
        reminderTime: editForm.reminderTime || null,
      });
      setEditingId(null);
      load();
    } catch {
      setError("Couldn't save those changes.");
    }
  };

  const remove = async (id) => {
    try {
      await deleteHabit(id);
      load();
    } catch {
      setError("Couldn't remove that habit.");
    }
  };

  return (
    <div className="pt-6 grid gap-6 pb-10 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>Your habits</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          These repeat every day of your challenge. Mark them off from the Dashboard.
        </p>
      </div>

      {error && (
        <p className="text-sm px-3 py-2 rounded-xl" style={{ background: "#FF88AA22", color: "#D1467A" }}>{error}</p>
      )}

      {!showCreateForm ? (
          <button
              onClick={() => setShowCreateForm(true)}
              className="font-display font-bold text-sm px-4 py-2.5 rounded-full flex items-center gap-1.5"
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
              <h2 className="font-display text-sm" style={{ color: "var(--text-muted)" }}>
                New habit
              </h2>

              <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setForm(EMPTY_FORM);
                  }}
                  className="p-1"
              >
                <X size={16} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            <input
                required
                placeholder="Title, e.g. Drink 3L water"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)"
                }}
            />

            <div className="flex flex-wrap items-center gap-3">
              <select
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text)"
                  }}
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
                        style={{
                          background: value,
                          border: form.color === value
                              ? "2px solid var(--text)"
                              : "2px solid transparent"
                        }}
                    />
                ))}
              </div>

              <input
                  type="time"
                  value={form.reminderTime}
                  onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
                  className="px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text)"
                  }}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                  type="submit"
                  disabled={creating}
                  className="font-display font-bold text-sm px-4 py-2.5 rounded-full"
                  style={{ background: "#FF8B6B", color: "#3A1F16" }}
              >
                <Plus size={15} className="inline mr-1" />
                {creating ? "Adding…" : "Add habit"}
              </button>

              <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setForm(EMPTY_FORM);
                  }}
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
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: h.color + "22" }}>
                      <Icon size={17} color={h.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{h.title}</p>
                      {h.reminderTime && (
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Reminder {h.reminderTime.slice(0, 5)}</p>
                      )}
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

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { listTodos, createTodo, updateTodo, toggleTodo, deleteTodo } from "../api/todos";

const PRIORITIES = [
    { id: "LOW", label: "Low", color: "#8FBE7A" },
    { id: "MEDIUM", label: "Medium", color: "#8FA6FF" },
    { id: "HIGH", label: "High", color: "#FF88AA" },
];
const priorityColor = (p) => PRIORITIES.find((x) => x.id === p)?.color || "var(--text-muted)";

const EMPTY_FORM = { title: "", notes: "", dueDate: "", priority: "MEDIUM", tagsText: "" };
const toTags = (text) => text.split(",").map((t) => t.trim()).filter(Boolean);

export default function Todos() {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("open"); // "open" | "done" | "all"
    const [form, setForm] = useState(EMPTY_FORM);
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(EMPTY_FORM);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const load = () => {
        setLoading(true);
        const params = filter === "all" ? {} : { completed: filter === "done" };
        listTodos(params)
            .then(setTodos)
            .catch((err) => {
                console.error("Todos load failed", err.response?.status, err.response?.data || err.message);
                setError(err.response?.data?.message || "Couldn't load your to-dos.");
            })
            .finally(() => setLoading(false));
    };

    useEffect(load, [filter]);

    const submitCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError("");
        try {
            const created = await createTodo({
                title: form.title,
                notes: form.notes || null,
                dueDate: form.dueDate || null,
                priority: form.priority,
                tags: toTags(form.tagsText),
            });
            console.log("Todo created", created);
            setForm(EMPTY_FORM);
            setShowCreateForm(false);
            load();
        } catch (err) {
            console.error("Todo create failed", err.response?.status, err.response?.data || err.message);
            setError(err.response?.status === 401
                ? "Your session looks invalid or expired. Please log in again."
                : (err.response?.data?.message || "Couldn't create that task."));
        } finally {
            setCreating(false);
        }
    };

    const startEdit = (t) => {
        setEditingId(t.id);
        setEditForm({
            title: t.title,
            notes: t.notes || "",
            dueDate: t.dueDate || "",
            priority: t.priority,
            tagsText: (t.tags || []).join(", "),
        });
    };

    const submitEdit = async (id) => {
        try {
            const updated = await updateTodo(id, {
                title: editForm.title,
                notes: editForm.notes,
                dueDate: editForm.dueDate || null,
                priority: editForm.priority,
                tags: toTags(editForm.tagsText),
            });
            console.log("Todo updated", updated);
            setEditingId(null);
            load();
        } catch {
            setError("Couldn't save those changes.");
        }
    };

    const handleToggle = async (id) => {
        try {
            const updated = await toggleTodo(id);
            console.log("Todo toggled", updated);
            load();
        } catch {
            setError("Couldn't update that task.");
        }
    };

    const remove = async (id) => {
        try {
            await deleteTodo(id);
            console.log("Todo deleted", id);
            load();
        } catch {
            setError("Couldn't remove that task.");
        }
    };

    return (
        <div className="pt-6 grid gap-6 pb-10 max-w-2xl">
            <div>
                <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>To-Do</h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    One-time tasks — separate from your daily habits. Anything due today also shows up on the Dashboard.
                </p>
            </div>

            {error && (
                <p className="text-sm px-3 py-2 rounded-xl" style={{ background: "#FF88AA22", color: "#D1467A" }}>{error}</p>
            )}

            {!showCreateForm ? (
                <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition"
                    style={{
                        background: "#FF8B6B",
                        color: "#3A1F16",
                        width: "fit-content"
                    }}
                >
                    <Plus size={18} />
                    Create Task
                </button>
            ) : (
                <form
                    onSubmit={submitCreate}
                    className="rounded-3xl p-5 grid gap-3"
                    style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)"
                    }}
                >
                    <h2 className="font-display text-lg font-bold" style={{ color: "var(--text)" }}>
                        Create task
                    </h2>

                    <input
                        required
                        placeholder="Task title"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                    />
                    <textarea
                        rows={3}
                        placeholder="Notes"
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        className="px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                    />
                    <div className="flex flex-wrap gap-2">
                        <input
                            type="date"
                            value={form.dueDate}
                            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                            className="px-3 py-2.5 rounded-xl text-sm outline-none"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                        />
                        <select
                            value={form.priority}
                            onChange={(e) => setForm({ ...form, priority: e.target.value })}
                            className="px-3 py-2.5 rounded-xl text-sm outline-none"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                        >
                            {PRIORITIES.map((p) => (
                                <option key={p.id} value={p.id}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                    <input
                        placeholder="Tags, comma separated"
                        value={form.tagsText}
                        onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
                        className="px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                    />

                    <div className="flex gap-3 mt-2">
                        <button
                            type="submit"
                            disabled={creating}
                            className="px-5 py-2.5 rounded-full font-semibold"
                            style={{
                                background: "#FF8B6B",
                                color: "#3A1F16"
                            }}
                        >
                            {creating ? "Creating..." : "Create task"}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateForm(false);
                                setForm(EMPTY_FORM);
                            }}
                            className="px-5 py-2.5 rounded-full"
                            style={{
                                background: "var(--surface-2)",
                                color: "var(--text)"
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="flex gap-2">
                {[["open", "Open"], ["done", "Done"], ["all", "All"]].map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => setFilter(id)}
                        className="text-sm px-3.5 py-1.5 rounded-full"
                        style={{
                            background: filter === id ? "#FF8B6B" : "var(--surface-2)",
                            color: filter === id ? "#3A1F16" : "var(--text-muted)",
                            border: "1px solid " + (filter === id ? "#FF8B6B" : "var(--border)"),
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {loading ? (
                <p style={{ color: "var(--text-muted)" }}>Loading…</p>
            ) : todos.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>Nothing here yet.</p>
            ) : (
                <div className="grid gap-2">
                    {todos.map((t) => {
                        const isEditing = editingId === t.id;
                        return (
                            <div key={t.id} className="rounded-2xl p-3.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                                {isEditing ? (
                                    <div className="grid gap-2">
                                        <input
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            className="px-3 py-2 rounded-lg text-sm outline-none"
                                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                                        />
                                        <textarea
                                            rows={2}
                                            value={editForm.notes}
                                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                            className="px-3 py-2 rounded-lg text-sm outline-none resize-none"
                                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                                        />
                                        <div className="flex flex-wrap items-center gap-2">
                                            <input
                                                type="date"
                                                value={editForm.dueDate}
                                                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                                                className="px-3 py-2 rounded-lg text-sm outline-none"
                                                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                                            />
                                            <select
                                                value={editForm.priority}
                                                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                                                className="px-3 py-2 rounded-lg text-sm outline-none"
                                                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                                            >
                                                {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                                            </select>
                                            <input
                                                placeholder="Tags, comma separated"
                                                value={editForm.tagsText}
                                                onChange={(e) => setEditForm({ ...editForm, tagsText: e.target.value })}
                                                className="flex-1 min-w-[140px] px-3 py-2 rounded-lg text-sm outline-none"
                                                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                                            />
                                            <div className="flex items-center gap-1.5 ml-auto">
                                                <button type="button" onClick={() => submitEdit(t.id)} className="p-1.5 rounded-lg" style={{ background: "#8FBE7A22" }} aria-label="Save">
                                                    <Check size={15} color="#8FBE7A" />
                                                </button>
                                                <button type="button" onClick={() => setEditingId(null)} className="p-1.5 rounded-lg" style={{ background: "var(--surface-2)" }} aria-label="Cancel">
                                                    <X size={15} style={{ color: "var(--text-muted)" }} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3">
                                        <button type="button" onClick={() => handleToggle(t.id)} className="mt-0.5 shrink-0" aria-label="Toggle complete">
                                            <div
                                                className="w-5 h-5 rounded-md flex items-center justify-center"
                                                style={{ border: `2px solid ${t.completed ? "#8FBE7A" : "var(--border)"}`, background: t.completed ? "#8FBE7A" : "transparent" }}
                                            >
                                                {t.completed && <Check size={13} color="#fff" />}
                                            </div>
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className="text-sm font-medium"
                                                style={{ color: t.completed ? "var(--text-muted)" : "var(--text)", textDecoration: t.completed ? "line-through" : "none" }}
                                            >
                                                {t.title}
                                            </p>
                                            {t.notes && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t.notes}</p>}
                                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[11px] px-2 py-0.5 rounded-md font-medium" style={{ color: priorityColor(t.priority), background: priorityColor(t.priority) + "1a" }}>
                          {t.priority}
                        </span>
                                                {t.dueDate && (
                                                    <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ color: "var(--text-muted)", background: "var(--surface-2)" }}>
                            Due {t.dueDate}
                          </span>
                                                )}
                                                {(t.tags || []).map((tag) => (
                                                    <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md" style={{ color: "var(--text-muted)", background: "var(--surface-2)" }}>
                            #{tag}
                          </span>
                                                ))}
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => startEdit(t)} className="p-1.5 rounded-lg shrink-0" style={{ color: "var(--text-muted)" }} aria-label="Edit">
                                            <Pencil size={15} />
                                        </button>
                                        <button type="button" onClick={() => remove(t.id)} className="p-1.5 rounded-lg shrink-0" style={{ color: "#FF88AA" }} aria-label="Delete">
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

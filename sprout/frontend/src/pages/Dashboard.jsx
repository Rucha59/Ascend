import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    CheckCircle2, XCircle, MinusCircle, Circle, Plus, BookOpen, ChevronRight,
    ChevronDown, X, Image as ImageIcon, Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getToday } from "../api/days";
import { markHabitLog, addHabitStat, deleteHabitStat, addHabitPhoto, deleteHabitPhoto } from "../api/habits";
import { getCalendarStatus, getCalendarAuthUrl, disconnectCalendar } from "../api/calendar";
import { getTodayTodos, toggleTodo } from "../api/todos";
import { getHabitIcon } from "../lib/habitIcons";
import AuthImage from "../components/AuthImage";

const CYCLE = ["COMPLETED", "MISSED", "SKIPPED"];
function nextStatus(current) {
    if (current === "PENDING") return "COMPLETED";
    return CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
}

function ProgressRing({ pct, size = 72, stroke = 7 }) {
    const r = size / 2 - stroke / 2 - 2;
    const c = 2 * Math.PI * r;
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
                <circle
                    cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#FF8B6B" strokeWidth={stroke}
                    strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset .5s ease" }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-bold text-sm" style={{ color: "var(--text)" }}>{pct}%</span>
            </div>
        </div>
    );
}

function StatusIcon({ status }) {
    if (status === "COMPLETED") return <CheckCircle2 size={22} color="#8FBE7A" fill="#8FBE7A22" />;
    if (status === "MISSED") return <XCircle size={22} color="#FF88AA" />;
    if (status === "SKIPPED") return <MinusCircle size={22} color="var(--text-muted)" />;
    return <Circle size={22} color="var(--border)" />;
}

function formatEventTime(item) {
    if (item.allDay) return "All day";
    return new Date(item.time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function Dashboard() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [today, setToday] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [banner, setBanner] = useState(null);

    const [noteDrafts, setNoteDrafts] = useState({});
    const [savingId, setSavingId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [statForms, setStatForms] = useState({});
    const [uploadingPhotoId, setUploadingPhotoId] = useState(null);

    const [calendarStatus, setCalendarStatus] = useState(null);
    const [todoItems, setTodoItems] = useState([]);
    const [todoItemsLoading, setTodoItemsLoading] = useState(false);
    const [connecting, setConnecting] = useState(false);

    // Read the ?calendar=connected|error redirect from the OAuth callback once, then clean the URL.
    useEffect(() => {
        const calendarParam = searchParams.get("calendar");
        if (!calendarParam) return;
        setBanner(
            calendarParam === "connected"
                ? { type: "success", text: "Google Calendar connected." }
                : { type: "error", text: "Couldn't connect Google Calendar. Please try again." }
        );
        const next = new URLSearchParams(searchParams);
        next.delete("calendar");
        setSearchParams(next, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const load = () => {
        setLoading(true);
        getToday()
            .then((data) => {
                setToday(data);
                const drafts = {};
                data.habits.forEach((h) => { drafts[h.habitId] = h.note || ""; });
                setNoteDrafts(drafts);
                setError("");
            })
            .catch(() => setError("Couldn't load today's habits. Try refreshing."))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    useEffect(() => {
        getCalendarStatus()
            .then(setCalendarStatus)
            .catch(() => setCalendarStatus({ connected: false }));
    }, []);

    const loadTodayTodos = () => {
        setTodoItemsLoading(true);
        getTodayTodos()
            .then(setTodoItems)
            .catch(() => setError("Couldn't load today's to-do list."))
            .finally(() => setTodoItemsLoading(false));
    };

    useEffect(() => {
        // Refetch once calendar status resolves too, since connecting/disconnecting changes what's merged in.
        loadTodayTodos();
    }, [calendarStatus]);

    const connectCalendar = async () => {
        setConnecting(true);
        try {
            const url = await getCalendarAuthUrl();
            window.location.href = url;
        } catch (err) {
            setError(err.response?.data?.message || "Couldn't start the Google Calendar connection.");
            setConnecting(false);
        }
    };

    const handleDisconnectCalendar = async () => {
        try {
            await disconnectCalendar();
            setCalendarStatus({ connected: false });
        } catch {
            setError("Couldn't disconnect Google Calendar.");
        }
    };

    const cycle = async (habit) => {
        setSavingId(habit.habitId);
        try {
            await markHabitLog(habit.habitId, { status: nextStatus(habit.status), note: noteDrafts[habit.habitId] || "" });
            load();
        } catch {
            setError("Couldn't save that. Try again.");
        } finally {
            setSavingId(null);
        }
    };

    const saveNote = async (habit) => {
        if (habit.status === "PENDING") return;
        setSavingId(habit.habitId);
        try {
            await markHabitLog(habit.habitId, { status: habit.status, note: noteDrafts[habit.habitId] || "" });
            load();
        } catch {
            setError("Couldn't save that note. Try again.");
        } finally {
            setSavingId(null);
        }
    };

    const statForm = (habitId) => statForms[habitId] || { label: "", value: "", unit: "" };
    const updateStatForm = (habitId, patch) =>
        setStatForms((prev) => ({ ...prev, [habitId]: { ...statForm(habitId), ...patch } }));

    const handleAddStat = async (habitId) => {
        const form = statForm(habitId);
        if (!form.label.trim() || form.value === "") return;
        try {
            await addHabitStat(habitId, { label: form.label.trim(), value: parseFloat(form.value), unit: form.unit.trim() || null }, today.date);
            setStatForms((prev) => ({ ...prev, [habitId]: { label: "", value: "", unit: "" } }));
            load();
        } catch (err) {
            setError(err.response?.data?.message || "Couldn't add that stat.");
        }
    };

    const handleDeleteStat = async (habitId, statId) => {
        try {
            await deleteHabitStat(habitId, statId, today.date);
            load();
        } catch {
            setError("Couldn't remove that stat.");
        }
    };

    const handleAddPhoto = async (habitId, e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setUploadingPhotoId(habitId);
        try {
            await addHabitPhoto(habitId, file, today.date);
            load();
        } catch (err) {
            setError(err.response?.data?.message || "Couldn't upload that photo.");
        } finally {
            setUploadingPhotoId(null);
        }
    };

    const handleDeletePhoto = async (habitId, photoId) => {
        try {
            await deleteHabitPhoto(habitId, photoId, today.date);
            load();
        } catch {
            setError("Couldn't remove that photo.");
        }
    };

    if (loading) {
        return <p className="pt-6" style={{ color: "var(--text-muted)" }}>Loading today…</p>;
    }
    if (!today) {
        return <p className="pt-6" style={{ color: "var(--text-muted)" }}>{error || "Something went wrong."}</p>;
    }

    return (
        <div className="pt-6 grid gap-6 pb-10">
            <div
                className="rounded-3xl p-6 flex items-center gap-6 flex-wrap"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
                <div
                    className="w-16 h-16 rounded-full flex flex-col items-center justify-center shrink-0"
                    style={{ background: "var(--surface-2)", border: "2px dashed #FF8B6B" }}
                >
                    <span className="text-[10px] font-display" style={{ color: "var(--text-muted)" }}>DAY</span>
                    <span className="font-display font-extrabold text-lg leading-none" style={{ color: "var(--text)" }}>
            {today.dayNumber}
          </span>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <p className="text-xs font-display mb-1" style={{ color: "var(--text-muted)" }}>
                        Welcome back, {user?.name?.split(" ")[0]}
                    </p>
                    <p className="italic" style={{ color: "var(--text)" }}>&ldquo;{today.quote}&rdquo;</p>
                    <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
                        {today.completedCount}/{today.totalCount} logged · Day {today.dayNumber} of {today.totalDays}
                    </p>
                </div>
                <ProgressRing pct={today.completionPercentage} />
            </div>

            {banner && (
                <p
                    className="text-sm px-3 py-2 rounded-xl"
                    style={
                        banner.type === "success"
                            ? { background: "#8FBE7A22", color: "#4C7A3B" }
                            : { background: "#FF88AA22", color: "#D1467A" }
                    }
                >
                    {banner.text}
                </p>
            )}

            {error && (
                <p className="text-sm px-3 py-2 rounded-xl" style={{ background: "#FF88AA22", color: "#D1467A" }}>
                    {error}
                </p>
            )}

            <Link
                to={`/journal?date=${today.date}`}
                className="rounded-3xl p-5 flex items-center gap-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#8FA6FF22" }}>
                    <BookOpen size={18} color="#8FA6FF" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                        {today.hasJournalEntry ? "Continue today's journal" : "Write today's journal"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {today.hasJournalEntry ? "You've already started writing" : "Mood, gratitude, reflection, photos"}
                    </p>
                </div>
                <ChevronRight size={18} style={{ color: "var(--text-muted)" }} />
            </Link>
            <Link
                to="/projects"
                className="rounded-3xl p-5 flex items-center gap-4"
                style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)"
                }}
            >
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "#FF8B6B22" }}
                >
                    <span style={{ color: "#FF8B6B" }}>📋</span>
                </div>

                <div className="flex-1 min-w-0">
                    <p
                        className="text-sm font-medium"
                        style={{ color: "var(--text)" }}
                    >
                        Projects
                    </p>

                    <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Track your bigger goals and deadlines
                    </p>
                </div>

                <ChevronRight
                    size={18}
                    style={{ color: "var(--text-muted)" }}
                />
            </Link>
            {/* Tasks due today, plus calendar events folded in — still a separate list from Habits below. */}
            <div className="rounded-3xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-display text-sm" style={{ color: "var(--text-muted)" }}>Today's To-Do</h2>
                    <div className="flex items-center gap-3">
                        <Link to="/todos" className="text-xs flex items-center gap-1 font-medium" style={{ color: "#FF8B6B" }}>
                            <Plus size={14} /> Manage tasks
                        </Link>
                        {calendarStatus?.connected && (
                            <button onClick={handleDisconnectCalendar} className="text-xs" style={{ color: "var(--text-muted)" }}>
                                Disconnect calendar
                            </button>
                        )}
                    </div>
                </div>

                {calendarStatus && !calendarStatus.connected && (
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-3 px-3 py-2.5 rounded-xl" style={{ background: "var(--surface-2)" }}>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            Connect Google Calendar to pull today's events in here too.
                        </p>
                        <button
                            onClick={connectCalendar}
                            disabled={connecting}
                            className="font-display font-bold text-xs px-3.5 py-2 rounded-full disabled:opacity-60 shrink-0"
                            style={{ background: "#8FA6FF", color: "#131B33" }}
                        >
                            {connecting ? "Redirecting…" : "Connect Google Calendar"}
                        </button>
                    </div>
                )}

                {todoItemsLoading ? (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>
                ) : todoItems.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Nothing due today.</p>
                ) : (
                    <div className="grid gap-1.5">
                        {todoItems.map((item) => (
                            <div
                                key={item.source === "TASK" ? `task-${item.taskId}` : `event-${item.eventId}`}
                                className="flex items-center gap-3 text-sm px-3 py-2 rounded-lg"
                                style={{ background: "var(--surface-2)" }}
                            >
                                {item.source === "TASK" ? (
                                    <button
                                        onClick={() => toggleTodo(item.taskId).then(loadTodayTodos).catch(() => setError("Couldn't update that task."))}
                                        className="shrink-0"
                                        aria-label="Toggle complete"
                                    >
                                        <div
                                            className="w-4.5 h-4.5 rounded-md flex items-center justify-center"
                                            style={{
                                                width: 18, height: 18,
                                                border: `2px solid ${item.completed ? "#8FBE7A" : "var(--border)"}`,
                                                background: item.completed ? "#8FBE7A" : "transparent",
                                            }}
                                        >
                                            {item.completed && <Check size={11} color="#fff" />}
                                        </div>
                                    </button>
                                ) : (
                                    <span className="font-medium shrink-0" style={{ color: "#8FA6FF", minWidth: 68 }}>
                    {formatEventTime(item)}
                  </span>
                                )}
                                <span
                                    style={{
                                        color: item.completed ? "var(--text-muted)" : "var(--text)",
                                        textDecoration: item.completed ? "line-through" : "none",
                                    }}
                                >
                  {item.title}
                </span>
                                {item.source === "TASK" && item.priority && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md shrink-0" style={{ color: "var(--text-muted)", background: "var(--surface)" }}>
                    {item.priority}
                  </span>
                                )}
                                {item.notes && (
                                    <span className="text-xs ml-auto truncate" style={{ color: "var(--text-muted)" }}>{item.notes}</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="rounded-3xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-sm" style={{ color: "var(--text-muted)" }}>Today's Habits</h2>
                    <Link to="/habits" className="text-xs flex items-center gap-1 font-medium" style={{ color: "#FF8B6B" }}>
                        <Plus size={14} /> Manage habits
                    </Link>
                </div>

                {today.habits.length === 0 ? (
                    <div className="text-center py-10">
                        <p style={{ color: "var(--text-muted)" }}>No habits yet — add your first one to start tracking.</p>
                        <Link
                            to="/habits"
                            className="inline-block mt-3 font-display font-bold text-sm px-4 py-2 rounded-full"
                            style={{ background: "#FF8B6B", color: "#3A1F16" }}
                        >
                            Add a habit
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {today.habits.map((h) => {
                            const Icon = getHabitIcon(h.icon);
                            const isExpanded = expandedId === h.habitId;
                            const canAddEvidence = h.status !== "PENDING";
                            const form = statForm(h.habitId);
                            return (
                                <div
                                    key={h.habitId}
                                    className="rounded-2xl p-3"
                                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                                >
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => cycle(h)} disabled={savingId === h.habitId} className="shrink-0" aria-label="Cycle status">
                                            <StatusIcon status={h.status} />
                                        </button>
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: h.color + "22" }}>
                                            <Icon size={17} color={h.color} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{h.title}</p>
                                            {h.reminderTime && (
                                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Reminder {h.reminderTime.slice(0, 5)}</p>
                                            )}
                                        </div>
                                        <span
                                            className="text-[11px] px-2 py-1 rounded-md capitalize shrink-0"
                                            style={{ color: h.color, background: h.color + "1a" }}
                                        >
                      {h.status.toLowerCase()}
                    </span>
                                        {canAddEvidence && (
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : h.habitId)}
                                                className="shrink-0 p-1"
                                                aria-label="Toggle evidence"
                                            >
                                                <ChevronDown
                                                    size={16}
                                                    style={{ color: "var(--text-muted)", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform .15s" }}
                                                />
                                            </button>
                                        )}
                                    </div>

                                    <input
                                        value={noteDrafts[h.habitId] ?? ""}
                                        onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [h.habitId]: e.target.value }))}
                                        onBlur={() => saveNote(h)}
                                        placeholder={h.status === "PENDING" ? "Mark it first, then add a note…" : "Add a note…"}
                                        disabled={h.status === "PENDING"}
                                        className="w-full mt-2 text-sm px-3 py-1.5 rounded-lg outline-none disabled:opacity-60"
                                        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
                                    />

                                    {isExpanded && canAddEvidence && (
                                        <div className="mt-3 pt-3 grid gap-3" style={{ borderTop: "1px dashed var(--border)" }}>
                                            <div>
                                                <p className="text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Stats</p>
                                                {h.stats.length > 0 && (
                                                    <div className="grid gap-1 mb-2">
                                                        {h.stats.map((s) => (
                                                            <div
                                                                key={s.id}
                                                                className="flex items-center justify-between text-sm px-2.5 py-1.5 rounded-lg"
                                                                style={{ background: "var(--surface)" }}
                                                            >
                                <span style={{ color: "var(--text)" }}>
                                  {s.label}: <strong>{s.value}{s.unit ? ` ${s.unit}` : ""}</strong>
                                </span>
                                                                <button onClick={() => handleDeleteStat(h.habitId, s.id)} aria-label="Remove stat">
                                                                    <X size={13} style={{ color: "var(--text-muted)" }} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex gap-1.5">
                                                    <input
                                                        placeholder="Label"
                                                        value={form.label}
                                                        onChange={(e) => updateStatForm(h.habitId, { label: e.target.value })}
                                                        className="flex-1 min-w-0 text-xs px-2 py-1.5 rounded-lg outline-none"
                                                        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Value"
                                                        value={form.value}
                                                        onChange={(e) => updateStatForm(h.habitId, { value: e.target.value })}
                                                        className="w-20 text-xs px-2 py-1.5 rounded-lg outline-none"
                                                        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
                                                    />
                                                    <input
                                                        placeholder="Unit"
                                                        value={form.unit}
                                                        onChange={(e) => updateStatForm(h.habitId, { unit: e.target.value })}
                                                        className="w-16 text-xs px-2 py-1.5 rounded-lg outline-none"
                                                        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
                                                    />
                                                    <button
                                                        onClick={() => handleAddStat(h.habitId)}
                                                        className="px-2.5 rounded-lg shrink-0"
                                                        style={{ background: "#FF8B6B", color: "#3A1F16" }}
                                                        aria-label="Add stat"
                                                    >
                                                        <Plus size={13} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Photos</p>
                                                    <label
                                                        className="text-xs flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer"
                                                        style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                                                    >
                                                        <ImageIcon size={12} /> {uploadingPhotoId === h.habitId ? "Uploading…" : "Add"}
                                                        <input
                                                            type="file"
                                                            accept="image/png,image/jpeg,image/webp,image/gif"
                                                            className="hidden"
                                                            disabled={uploadingPhotoId === h.habitId}
                                                            onChange={(e) => handleAddPhoto(h.habitId, e)}
                                                        />
                                                    </label>
                                                </div>
                                                {h.photos.length > 0 ? (
                                                    <div className="grid grid-cols-4 gap-1.5">
                                                        {h.photos.map((p) => (
                                                            <AuthImage
                                                                key={p.id}
                                                                url={p.url}
                                                                alt={p.originalFileName}
                                                                onDelete={() => handleDeletePhoto(h.habitId, p.id)}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>No photos yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

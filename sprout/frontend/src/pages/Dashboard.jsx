import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight,
    Circle, Clock3, FolderKanban, MinusCircle, Plus, Target,
    TrendingUp, X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getToday } from "../api/days";
import { getAnalytics } from "../api/analytics";
import { getTodayTodos, quickCreateTodo, toggleTodo, toggleChecklistItem } from "../api/todos";
import { markHabitLog } from "../api/habits";
import { getHabitIcon } from "../lib/habitIcons";

/* ─── constants ─── */
const CYCLE = ["COMPLETED", "MISSED", "SKIPPED"];
function nextStatus(current) {
    if (current === "PENDING") return "COMPLETED";
    return CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
}

const GREETINGS = [
    "Welcome back", "Ready for today", "Let's build momentum",
    "Keep growing", "Good to see you", "One step closer", "Let's make today count",
];

/* ─── ProgressRing ─── */
function ProgressRing({ pct }) {
    const size = 212, stroke = 14;
    const r = size / 2 - stroke / 2;
    const c = 2 * Math.PI * r;
    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5ded2" strokeWidth={stroke} />
                <circle
                    cx={size/2} cy={size/2} r={r} fill="none"
                    stroke="#C85C22" strokeWidth={stroke}
                    strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size/2} ${size/2})`}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black tracking-[-0.05em]" style={{ color: "#C85C22", fontSize: 54, lineHeight: 1 }}>
          {Math.round(pct)}%
        </span>
                <span className="mt-1 text-[12px] font-semibold tracking-[0.28em]" style={{ color: "#9b8f81" }}>
          DONE
        </span>
            </div>
        </div>
    );
}

/* ─── StatCard ─── */
function StatCard({ icon: Icon, value, label }) {
    return (
        <div className="rounded-3xl p-4 md:p-5" style={{ background: "#fcf8f1", border: "1px solid #dbcfbf" }}>
            <Icon size={18} color="#C85C22" />
            <div className="mt-6 font-black text-[28px] tracking-[-0.05em]" style={{ color: "#1a1714" }}>{value}</div>
            <div className="mt-1 text-[12px] font-bold tracking-[0.22em]" style={{ color: "#9b8f81" }}>{label}</div>
        </div>
    );
}

/* ─── Habit status + pill ─── */
function HabitStatusIcon({ status }) {
    if (status === "COMPLETED") return <CheckCircle2 size={26} color="#4b7a36" />;
    if (status === "SKIPPED")   return <MinusCircle  size={26} color="#9b8f81" />;
    return <Circle size={26} color="#d0c6b7" />;
}

function StatusPill({ status }) {
    const map = {
        COMPLETED: { bg: "#fde3d4", fg: "#C85C22", label: "DONE" },
        PENDING:   { bg: "#e8e1fb", fg: "#5f49d6", label: "GO"   },
        SKIPPED:   { bg: "#e8e3da", fg: "#8b8174", label: "SKIP" },
        MISSED:    { bg: "#e8e3da", fg: "#8b8174", label: "MISS" },
    };
    const pill = map[status] || map.PENDING;
    return (
        <span className="px-3 py-1 rounded-full text-[12px] font-bold" style={{ background: pill.bg, color: pill.fg }}>
      {pill.label}
    </span>
    );
}

/* ─── Task priority label ─── */
function TaskPriority({ priority }) {
    if (priority === "HIGH")
        return <span className="text-[13px] font-bold" style={{ color: "#C85C22" }}>HIGH</span>;
    if (priority === "MEDIUM" || priority === "MED")
        return <span className="text-[13px] font-bold" style={{ color: "#7a6f64" }}>MED</span>;
    if (priority === "LOW")
        return <span className="text-[13px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#e7dfd2", color: "#9b8f81" }}>LOW</span>;
    return null;
}

/* ─── QuickAddTodo ─── */
function QuickAddTodo({ onAdded }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [saving, setSaving] = useState(false);
    const inputRef = useRef(null);

    const PRI_OPTS = [
        { id: "HIGH",   label: "High",   bg: "#fde3d4", fg: "#C85C22" },
        { id: "MEDIUM", label: "Medium", bg: "#e8e1fb", fg: "#5f49d6" },
        { id: "LOW",    label: "Low",    bg: "#e8e3da", fg: "#8b8174" },
    ];

    const openForm = () => {
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };
    const close = () => { setOpen(false); setTitle(""); setPriority("MEDIUM"); };

    const submit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setSaving(true);
        try {
            await quickCreateTodo(title.trim(), priority);
            close();
            onAdded();
        } catch { /* silent */ }
        finally { setSaving(false); }
    };

    if (!open) {
        return (
            <button
                onClick={openForm}
                className="w-full rounded-[18px] px-4 py-3 flex items-center gap-3 text-[15px] font-semibold transition-colors"
                style={{
                    border: "1.5px dashed #d8cbb9",
                    background: "transparent",
                    color: "#9b8f81",
                    cursor: "pointer",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#C85C22"; e.currentTarget.style.color = "#C85C22"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#d8cbb9"; e.currentTarget.style.color = "#9b8f81"; }}
            >
                <Plus size={16} />
                Add today's to-do
            </button>
        );
    }

    return (
        <form
            onSubmit={submit}
            className="rounded-[18px] px-4 py-4 grid gap-3"
            style={{ background: "#fcf8f1", border: "1.5px solid #C85C22" }}
        >
            <input
                ref={inputRef}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What needs doing today?"
                style={{
                    width: "100%", border: "none", outline: "none", background: "transparent",
                    fontSize: "17px", fontWeight: 600, color: "#1a1714",
                }}
            />
            <div className="flex items-center gap-2 flex-wrap">
                {/* Priority pills */}
                {PRI_OPTS.map(p => (
                    <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriority(p.id)}
                        className="px-3 py-1 rounded-full text-[12px] font-bold transition-opacity"
                        style={{
                            background: priority === p.id ? p.bg : "#e7dfd2",
                            color: priority === p.id ? p.fg : "#9b8f81",
                            border: `1.5px solid ${priority === p.id ? p.fg + "44" : "transparent"}`,
                            cursor: "pointer",
                            opacity: 1,
                        }}
                    >
                        {p.label}
                    </button>
                ))}

                <span style={{ flex: 1 }} />

                {/* Cancel */}
                <button
                    type="button"
                    onClick={close}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9b8f81" }}
                >
                    <X size={16} />
                </button>

                {/* Add button */}
                <button
                    type="submit"
                    disabled={!title.trim() || saving}
                    className="px-5 py-1.5 rounded-full text-[13px] font-bold"
                    style={{
                        background: title.trim() && !saving ? "#C85C22" : "#e7dfd2",
                        color: title.trim() && !saving ? "#fff" : "#9b8f81",
                        border: "none",
                        cursor: title.trim() && !saving ? "pointer" : "not-allowed",
                    }}
                >
                    {saving ? "Adding…" : "Add"}
                </button>
            </div>
        </form>
    );
}

/* ─── TodoRow — TASK / MILESTONE / CHECKLIST / CALENDAR ─── */
function TodoRow({ item, onToggleTask, onToggleChecklist }) {

    /* MILESTONE — accent header, not toggleable */
    if (item.source === "MILESTONE") {
        return (
            <div
                className="rounded-[18px] px-4 py-3 flex items-center gap-3"
                style={{ background: "#fef3ec", border: "1.5px solid #e8a87c" }}
            >
                <FolderKanban size={17} color="#C85C22" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="font-bold text-[16px]" style={{ color: "#1a1714" }}>{item.title}</span>
                    {item.projectName && (
                        <span className="text-[13px] ml-2" style={{ color: "#9b8f81" }}>{item.projectName}</span>
                    )}
                </div>
                <span
                    className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider shrink-0"
                    style={{ background: "#C85C22", color: "#fff" }}
                >
          MILESTONE
        </span>
            </div>
        );
    }

    /* CHECKLIST — indented under milestone, toggleable */
    if (item.source === "CHECKLIST") {
        return (
            <div
                className="rounded-[18px] flex items-center gap-4"
                style={{
                    background: "#fcf8f1",
                    border: "1px solid #d8cbb9",
                    padding: "10px 16px 10px 40px",  /* 40px left = visual indent */
                }}
            >
                <button
                    onClick={() => onToggleChecklist(item)}
                    className="shrink-0"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    aria-label="Toggle checklist item"
                >
                    <div
                        className="flex items-center justify-center rounded-md"
                        style={{
                            width: 20, height: 20,
                            border: `1.8px solid ${item.completed ? "#4b7a36" : "#d0c6b7"}`,
                            background: item.completed ? "#4b7a36" : "transparent",
                        }}
                    >
                        {item.completed && <Check size={11} color="#fff" strokeWidth={3} />}
                    </div>
                </button>
                <span
                    className="text-[15px]"
                    style={{
                        flex: 1,
                        color: item.completed ? "#9b8f81" : "#1a1714",
                        textDecoration: item.completed ? "line-through" : "none",
                    }}
                >
          {item.title}
        </span>
            </div>
        );
    }

    /* CALENDAR — read-only */
    if (item.source === "CALENDAR") {
        const time = item.time
            ? item.allDay
                ? "All day"
                : new Date(item.time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
            : "";
        return (
            <div
                className="rounded-[18px] px-4 py-3 flex items-center gap-4"
                style={{ background: "#fcf8f1", border: "1px solid #d8cbb9" }}
            >
        <span className="text-[13px] font-bold shrink-0" style={{ color: "#C85C22", minWidth: 56 }}>
          {time}
        </span>
                <span className="flex-1 text-[17px]" style={{ color: "#1a1714" }}>{item.title}</span>
                {item.notes && (
                    <span className="text-[13px]" style={{ color: "#9b8f81" }}>{item.notes}</span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0" style={{ background: "#e8e3da", color: "#8b8174" }}>
          CAL
        </span>
            </div>
        );
    }

    /* TASK — default, toggleable */
    return (
        <div
            className="rounded-[18px] px-4 py-3 flex items-center gap-4"
            style={{ background: "#fcf8f1", border: "1px solid #d8cbb9" }}
        >
            <button
                onClick={() => onToggleTask(item)}
                className="shrink-0"
                aria-label="Toggle task"
                disabled={!item.taskId}
                style={{ background: "none", border: "none", cursor: item.taskId ? "pointer" : "default", padding: 0 }}
            >
                <div
                    className="flex items-center justify-center rounded-md"
                    style={{
                        width: 22, height: 22,
                        border: `1.8px solid ${item.completed ? "#4b7a36" : "#d0c6b7"}`,
                        background: item.completed ? "#4b7a36" : "transparent",
                    }}
                >
                    {item.completed && <Check size={12} color="#fff" />}
                </div>
            </button>

            <span
                className={`flex-1 text-[17px] ${item.completed ? "line-through" : ""}`}
                style={{ color: item.completed ? "#9b8f81" : "#1a1714" }}
            >
        {item.title}
      </span>

            <TaskPriority priority={item.priority} />
        </div>
    );
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [today, setToday] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [todoItems, setTodoItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const reload = async () => {
        setLoading(true);
        setError("");
        try {
            const [day, analyticsData, todos] = await Promise.all([
                getToday(), getAnalytics(), getTodayTodos(),
            ]);
            setToday(day);
            setAnalytics(analyticsData);
            setTodoItems(todos);
        } catch {
            setError("Couldn't load the dashboard right now.");
        } finally {
            setLoading(false);
        }
    };

    const loadTodos = () =>
        getTodayTodos().then(setTodoItems).catch(() => {});

    useEffect(() => {
        const cp = searchParams.get("calendar");
        if (!cp) return;
        const next = new URLSearchParams(searchParams);
        next.delete("calendar");
        setSearchParams(next, { replace: true });
    }, [searchParams, setSearchParams]);

    useEffect(() => { reload(); }, []);

    /* Derived values */
    const displayName = useMemo(
        () => (user?.name || "YOU").split(" ")[0].toUpperCase(),
        [user]
    );
    const streak    = analytics?.streaks?.currentStreak ?? 0;
    const dayNumber = analytics?.streaks?.challengeDay ?? today?.dayNumber ?? 1;
    const totalDays = analytics?.streaks?.totalChallengeDays ?? today?.totalDays ?? 75;
    const completedCount = today?.completedCount ?? 0;
    const totalCount     = today?.totalCount ?? today?.habits?.length ?? 0;
    const pct   = today?.completionPercentage ?? (totalCount ? Math.round((completedCount * 100) / totalCount) : 0);
    const quote = today?.quote || "Lock in. Make it count.";
    const habits = today?.habits || [];
    const greeting = useMemo(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)], []);

    /* Habit click — optimistic update */
    const handleHabitClick = async (habit) => {
        const newStatus = nextStatus(habit.status);
        setToday(prev => {
            const updatedHabits = prev.habits.map(h =>
                h.habitId === habit.habitId ? { ...h, status: newStatus } : h
            );
            const cc = updatedHabits.filter(h => h.status === "COMPLETED").length;
            const tc = updatedHabits.length;
            return { ...prev, habits: updatedHabits, completedCount: cc, totalCount: tc, completionPercentage: tc ? Math.round((cc * 100) / tc) : 0 };
        });
        try {
            await markHabitLog(habit.habitId, { status: newStatus, note: habit.note || "" });
        } catch {
            setError("Couldn't update that habit.");
            reload();
        }
    };

    /* Task toggle */
    const handleToggleTask = async (item) => {
        if (!item.taskId) return;
        try { await toggleTodo(item.taskId); loadTodos(); }
        catch { setError("Couldn't update that task."); }
    };

    /* Checklist toggle */
    const handleToggleChecklist = async (item) => {
        if (!item.projectId || !item.milestoneId || !item.itemId) return;
        try {
            await toggleChecklistItem(item.projectId, item.milestoneId, item.itemId);
            loadTodos();
        } catch { setError("Couldn't update that checklist item."); }
    };

    if (loading || !today) {
        return <div className="pt-6" style={{ color: "#8f8577" }}>Loading dashboard…</div>;
    }

    /* Partition todo items by type */
    const taskRows       = todoItems.filter(i => i.source === "TASK");
    const milestoneBlock = todoItems.filter(i => i.source === "MILESTONE" || i.source === "CHECKLIST");
    const calRows        = todoItems.filter(i => i.source === "CALENDAR");
    const hasTodos       = taskRows.length > 0 || milestoneBlock.length > 0 || calRows.length > 0;

    return (
        <div className="pt-8 pb-12 px-8 grid gap-8" style={{ color: "#1a1714" }}>

            {error && (
                <p className="text-sm px-3 py-2 rounded-xl" style={{ background: "#FF88AA22", color: "#D1467A" }}>
                    {error}
                </p>
            )}

            {/* ── Hero: Day circle + greeting + quote ── */}
            <section className="max-w-[1100px] mx-auto w-full px-8">
                <div className="flex items-center gap-20">
                    <div className="flex-shrink-0">
                        <div style={{
                            width: 150, height: 150, minWidth: 150, borderRadius: "50%",
                            background: "#FCF8F1", border: "3px solid #C85C22",
                            boxShadow: "0 10px 25px rgba(200,92,34,0.10)",
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        }}>
                            <span style={{ fontSize: 23, letterSpacing: "0.25em", color: "#8e8375", fontWeight: 600 }}>DAY</span>
                            <span style={{ fontSize: 72, fontWeight: 900, color: "#C85C22", lineHeight: 1 }}>{dayNumber}</span>
                        </div>
                    </div>
                    <div style={{ marginLeft: "2rem" }}>
                        <h1 style={{ fontSize: "clamp(1.8rem,2.5vw,2.5rem)", lineHeight: 1.2, margin: 0 }}>
                            <span style={{ color: "#8f8577", fontWeight: 500 }}>{greeting},</span>{" "}
                            <span style={{ color: "#1a1714", fontWeight: 800 }}>{displayName}</span>
                        </h1>
                        <p className="italic mt-5" style={{ fontSize: 19, color: "#8f8577", lineHeight: 1.6, maxWidth: 650 }}>
                            "{quote}"
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Stat cards ── */}
            <section className="grid gap-3 md:grid-cols-3 max-w-[1100px] mx-auto w-full">
                <StatCard icon={TrendingUp} value={`${streak}d`}            label="STREAK" />
                <StatCard icon={Target}     value={`${dayNumber}/${totalDays}`} label="DAY" />
                <StatCard icon={Clock3}     value={`${completedCount}/${totalCount}`} label="HABITS" />
            </section>

            {/* ── Progress ring card ── */}
            <section className="rounded-[28px] p-6 md:p-8 max-w-[1100px] mx-auto w-full" style={{ background: "#fcf8f1", border: "1px solid #d8cbb9" }}>
                <div className="grid gap-6 md:grid-cols-[230px_1fr] items-center">
                    <div className="flex justify-center"><ProgressRing pct={pct} /></div>
                    <div>
                        <h2 className="font-black tracking-[-0.05em]" style={{ fontSize: "clamp(1.5rem,2.5vw,2rem)" }}>
                            {completedCount} of {totalCount} done
                        </h2>
                        <p className="mt-2 text-[18px]" style={{ color: "#766d63" }}>
                            {totalCount - completedCount > 0 ? `${totalCount - completedCount} habits left today.` : "All done for today! 🎉"}
                        </p>
                        <div className="mt-5 h-2 rounded-full overflow-hidden" style={{ background: "#e7dfd2" }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#C85C22" }} />
                        </div>
                        <blockquote className="mt-6 pl-4 border-l-2 italic text-[17px]" style={{ borderColor: "#C85C22", color: "#8a8073" }}>
                            "Every day is a chance to outperform yesterday."
                        </blockquote>
                    </div>
                </div>
            </section>

            {/* ── Today's Habits ── */}
            <section className="max-w-[1100px] mx-auto w-full grid gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-black tracking-[-0.05em]" style={{ fontSize: "clamp(1.5rem,2.5vw,2rem)" }}>
                        TODAY'S HABITS
                    </h2>
                    <Link to="/habits" className="px-4 py-2 rounded-full text-[14px] font-semibold"
                          style={{ border: "1px solid #dbcfbf", color: "#C85C22", background: "#fcf8f1" }}>
                        + Manage
                    </Link>
                </div>

                <div className="grid gap-3">
                    {habits.length === 0 && (
                        <div className="rounded-[20px] px-4 py-8 text-center" style={{ background: "#fcf8f1", border: "1px solid #d8cbb9" }}>
                            <p style={{ color: "#9b8f81" }}>No habits yet.</p>
                            <Link to="/habits" className="inline-block mt-3 px-5 py-2 rounded-full text-[14px] font-bold"
                                  style={{ background: "#C85C22", color: "#fff" }}>
                                Add a habit
                            </Link>
                        </div>
                    )}
                    {habits.map(habit => {
                        const Icon = getHabitIcon(habit.icon);
                        const done = habit.status === "COMPLETED";
                        return (
                            <div key={habit.habitId} className="rounded-[20px] px-4 py-3 flex items-center gap-4"
                                 style={{ background: "#fcf8f1", border: "1px solid #d8cbb9" }}>
                                <button onClick={() => handleHabitClick(habit)} className="shrink-0" aria-label="Toggle habit"
                                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                                    <HabitStatusIcon status={habit.status} />
                                </button>
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: habit.color }} />
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#fff8ef" }}>
                                    <Icon size={16} color={habit.color} />
                                </div>
                                <p className={`flex-1 text-[17px] ${done ? "line-through" : ""}`} style={{ color: done ? "#8f8577" : "#1a1714" }}>
                                    {habit.title}
                                </p>
                                <StatusPill status={habit.status} />
                                <div className="flex items-center gap-1 text-[14px]" style={{ color: "#c85c22" }}>
                                    <span>🔥</span>
                                    <span className="font-semibold">{habit.streak ?? 0}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── Journal + Analytics quick links ── */}
            <section className="max-w-[1100px] mx-auto w-full grid gap-4 md:grid-cols-2">
                <Link to="/journal" className="rounded-[20px] px-5 py-4 flex items-center justify-between"
                      style={{ background: "#fcf8f1", border: "1px solid #d8cbb9", textDecoration: "none" }}>
                    <div className="flex items-center gap-3">
                        <BookOpen size={18} color="#C85C22" />
                        <div>
                            <p className="font-bold" style={{ color: "#1a1714" }}>Journal</p>
                            <p className="text-[14px]" style={{ color: "#766d63" }}>Write today's entry</p>
                        </div>
                    </div>
                    <ChevronRight size={18} color="#8f8577" />
                </Link>
                <Link to="/analytics" className="rounded-[20px] px-5 py-4 flex items-center justify-between"
                      style={{ background: "#fcf8f1", border: "1px solid #d8cbb9", textDecoration: "none" }}>
                    <div className="flex items-center gap-3">
                        <TrendingUp size={18} color="#C85C22" />
                        <div>
                            <p className="font-bold" style={{ color: "#1a1714" }}>Analytics</p>
                            <p className="text-[14px]" style={{ color: "#766d63" }}>See your progress</p>
                        </div>
                    </div>
                    <ChevronRight size={18} color="#8f8577" />
                </Link>
            </section>

            {/* ── Today's Tasks ── */}
            <section className="max-w-[1100px] mx-auto w-full grid gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-black tracking-[-0.05em]" style={{ fontSize: "clamp(1.5rem,2.5vw,2rem)" }}>
                        TODAY'S TASKS
                    </h2>
                    <Link to="/todos" className="px-4 py-2 rounded-full text-[14px] font-semibold"
                          style={{ border: "1px solid #dbcfbf", color: "#C85C22", background: "#fcf8f1" }}>
                        + Manage
                    </Link>
                </div>

                <div className="grid gap-3">

                    {/* 1 — User tasks */}
                    {taskRows.map(item => (
                        <TodoRow
                            key={`task-${item.taskId}`}
                            item={item}
                            onToggleTask={handleToggleTask}
                            onToggleChecklist={handleToggleChecklist}
                        />
                    ))}

                    {/* 2 — Milestones + checklist items due today */}
                    {milestoneBlock.length > 0 && (
                        <div className="grid gap-2" style={{ marginTop: taskRows.length > 0 ? 4 : 0 }}>
                            {milestoneBlock.map((item, i) => (
                                <TodoRow
                                    key={item.source === "MILESTONE" ? `ms-${item.milestoneId}` : `ci-${item.itemId ?? i}`}
                                    item={item}
                                    onToggleTask={handleToggleTask}
                                    onToggleChecklist={handleToggleChecklist}
                                />
                            ))}
                        </div>
                    )}

                    {/* 3 — Calendar events */}
                    {calRows.length > 0 && (
                        <div className="grid gap-2" style={{ marginTop: (taskRows.length > 0 || milestoneBlock.length > 0) ? 4 : 0 }}>
                            {calRows.map(item => (
                                <TodoRow
                                    key={`cal-${item.eventId}`}
                                    item={item}
                                    onToggleTask={handleToggleTask}
                                    onToggleChecklist={handleToggleChecklist}
                                />
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!hasTodos && (
                        <div className="rounded-[18px] px-4 py-6 text-center" style={{ background: "#fcf8f1", border: "1px solid #d8cbb9" }}>
                            <p style={{ color: "#9b8f81", fontSize: 16 }}>Nothing due today.</p>
                        </div>
                    )}

                    {/* ── Quick-add — always at the bottom ── */}
                    <QuickAddTodo onAdded={loadTodos} />

                </div>
            </section>

        </div>
    );
}

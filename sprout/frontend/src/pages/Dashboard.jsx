import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  MinusCircle,
  ChevronRight,
  Target,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getToday } from "../api/days";
import { getAnalytics } from "../api/analytics";
import { getTodayTodos, toggleTodo } from "../api/todos";
import { markHabitLog } from "../api/habits";
import { getHabitIcon } from "../lib/habitIcons";

const CYCLE = ["COMPLETED", "MISSED", "SKIPPED"];

function nextStatus(current) {
  if (current === "PENDING") return "COMPLETED";
  return CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
}

function ProgressRing({ pct }) {
  const size = 212;
  const stroke = 14;
  const r = size / 2 - stroke / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5ded2" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#C85C22"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
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

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="rounded-3xl p-4 md:p-5" style={{ background: "#fcf8f1", border: "1px solid #dbcfbf" }}>
      <Icon size={18} color="#C85C22" />
      <div className="mt-6 font-black text-[28px] tracking-[-0.05em]" style={{ color: "#1a1714" }}>{value}</div>
      <div className="mt-1 text-[12px] font-bold tracking-[0.22em]" style={{ color: "#9b8f81" }}>{label}</div>
    </div>
  );
}

function HabitStatusIcon({ status }) {
  if (status === "COMPLETED") return <CheckCircle2 size={26} color="#4b7a36" />;
  if (status === "SKIPPED") return <MinusCircle size={26} color="#9b8f81" />;
  return <Circle size={26} color="#d0c6b7" />;
}

function StatusPill({ status }) {
  const map = {
    COMPLETED: { bg: "#fde3d4", fg: "#C85C22", label: "DONE" },
    PENDING: { bg: "#e8e1fb", fg: "#5f49d6", label: "GO" },
    SKIPPED: { bg: "#e8e3da", fg: "#8b8174", label: "SKIP" },
    MISSED: { bg: "#e8e3da", fg: "#8b8174", label: "SKIP" },
  };
  const pill = map[status] || map.PENDING;
  return <span className="px-3 py-1 rounded-full text-[12px] font-bold" style={{ background: pill.bg, color: pill.fg }}>{pill.label}</span>;
}

function TaskPriority({ priority }) {
  if (priority === "HIGH") return <span className="text-[13px] font-bold" style={{ color: "#C85C22" }}>HIGH</span>;
  if (priority === "MED" || priority === "MEDIUM") return <span className="text-[13px] font-bold" style={{ color: "#7a6f64" }}>MED</span>;
  return <span className="text-[13px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#e7dfd2", color: "#9b8f81" }}>LOW</span>;
}

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
      const [day, analyticsData, todos] = await Promise.all([getToday(), getAnalytics(), getTodayTodos()]);
      setToday(day);
      setAnalytics(analyticsData);
      setTodoItems(todos);
    } catch {
      setError("Couldn't load the dashboard right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const calendarParam = searchParams.get("calendar");
    if (!calendarParam) return;
    const next = new URLSearchParams(searchParams);
    next.delete("calendar");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    reload();
  }, []);

  const displayName = useMemo(() => (user?.name || "ALEX").split(" ")[0].toUpperCase(), [user]);
  const streak = analytics?.streaks?.currentStreak ?? 0;
  const dayNumber = analytics?.streaks?.challengeDay ?? today?.dayNumber ?? 47;
  const totalDays = analytics?.streaks?.totalChallengeDays ?? today?.totalDays ?? 75;
  const completedCount = today?.completedCount ?? analytics?.streaks?.totalCompletedDays ?? 0;
  const totalCount = today?.totalCount ?? today?.habits?.length ?? 0;
  const pct = today?.completionPercentage ?? (totalCount ? Math.round((completedCount * 100) / totalCount) : 0);
  const quote = today?.quote || "Lock in. Make it count.";
  const habits = today?.habits || [];
  const greetings = [
    "Welcome back",
    "Ready for today",
    "Let's build momentum",
    "Keep growing",
    "Good to see you",
    "One step closer",
    "Let's make today count"
  ];

  const greeting =
      greetings[Math.floor(Math.random() * greetings.length)];

    const handleHabitClick = async (habit) => {
        const newStatus = nextStatus(habit.status);

        setToday((prev) => {
            const updatedHabits = prev.habits.map((h) =>
                h.habitId === habit.habitId ? { ...h, status: newStatus } : h
            );
            const completedCount = updatedHabits.filter((h) => h.status === "COMPLETED").length;
            const totalCount = updatedHabits.length;
            const completionPercentage = totalCount ? Math.round((completedCount * 100) / totalCount) : 0;

            return {
                ...prev,
                habits: updatedHabits,
                completedCount,
                totalCount,
                completionPercentage,
            };
        });

        try {
            await markHabitLog(habit.habitId, {
                status: newStatus,
                note: habit.note || "",
            });
        } catch {
            setError("Couldn't update that habit.");
            await reload(true);
        }
    };

    const handleTaskClick = async (task) => {
        if (!task.taskId) return;
        setTodoItems((prev) =>
            prev.map((t) =>
                t.taskId === task.taskId ? { ...t, completed: !t.completed } : t
            )
        );
        try {
            await toggleTodo(task.taskId);
        } catch {
            setError("Couldn't update that task.");
            await reload(true);
        }
    };

  if (loading || !today) {
    return <div className="pt-6" style={{ color: "#8f8577" }}>Loading dashboard…</div>;
  }

  const visibleTodos = todoItems.length > 0 ? todoItems : [
    { taskId: 1, title: "Review Q3 goals", completed: true, priority: "HIGH" },
    { taskId: 2, title: "Deep work block - 2h", completed: false, priority: "HIGH" },
    { taskId: 3, title: "Send project update", completed: false, priority: "MED" },
    { taskId: 4, title: "1-mile run at 7pm", completed: false, priority: "LOW" },
  ];

  return (
    <div className="pt-8 pb-12 px-8 grid gap-8" style={{ color: "#1a1714" }}>
      {error && (
        <p className="text-sm px-3 py-2 rounded-xl" style={{ background: "#FF88AA22", color: "#D1467A" }}>{error}</p>
      )}

        <section className="max-w-[1100px] mx-auto w-full px-8">
            <div className="flex items-center gap-20">

                {/* Day Circle */}
                <div className="flex-shrink-0">
                    <div
                        style={{
                            width: "150px",
                            height: "150px",
                            minWidth: "150px",   // ← prevents squishing
                            borderRadius: "50%",
                            background: "#FCF8F1",
                            border: "3px solid #C85C22",
                            boxShadow: "0 10px 25px rgba(200,92,34,0.10)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
        <span
            style={{
                fontSize: "23px",
                letterSpacing: "0.25em",
                color: "#8e8375",
                fontWeight: 600,
            }}
        >
          DAY
        </span>
                        <span
                            style={{
                                fontSize: "72px",        // ← bumped up from 54px
                                fontWeight: 900,
                                color: "#C85C22",
                                lineHeight: 1,
                            }}
                        >
          {dayNumber}
        </span>
                    </div>
                </div>

                {/* Greeting — gap is handled by gap-12 on the flex parent */}
                <div style={{ marginLeft: "2rem" }}>
                    <h1
                        style={{
                            fontSize: "clamp(1.8rem,2.5vw,2.5rem)",
                            lineHeight: 1.2,
                            margin: 0,
                        }}
                    >
                        <span style={{ color: "#8f8577", fontWeight: 500 }}>{greeting},</span>{" "}
                        <span style={{ color: "#1a1714", fontWeight: 800 }}>{displayName}</span>
                    </h1>
                    <p
                        className="italic mt-5"
                        style={{
                            fontSize: "19px",
                            color: "#8f8577",
                            lineHeight: 1.6,
                            maxWidth: "650px",
                        }}
                    >
                        "{quote}"
                    </p>
                </div>

            </div>
        </section>

      <section className="grid gap-3 md:grid-cols-3 max-w-[1100px] mx-auto w-full">
        <StatCard icon={TrendingUp} value={`${streak}d`} label="STREAK" />
        <StatCard icon={Target} value={`${dayNumber}/${totalDays}`} label="DAY" />
        <StatCard icon={Clock3} value={`${completedCount}/${totalCount}`} label="HABITS" />
      </section>

      <section className="rounded-[28px] p-6 md:p-8 max-w-[1100px] mx-auto w-full" style={{ background: "#fcf8f1", border: "1px solid #d8cbb9" }}>
        <div className="grid gap-6 md:grid-cols-[230px_1fr] items-center">
          <div className="flex justify-center">
            <ProgressRing pct={pct} />
          </div>
          <div>
            <h2 className="font-black tracking-[-0.05em]" style={{ fontSize: "clamp(1.5rem,2.5vw,2rem)" }}>
              {completedCount} of {totalCount} done
            </h2>
            <p className="mt-2 text-[18px]" style={{ color: "#766d63" }}>
              {totalCount - completedCount} habits left today.
            </p>
            <div className="mt-5 h-2 rounded-full overflow-hidden" style={{ background: "#e7dfd2" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#C85C22" }} />
            </div>
            <blockquote className="mt-6 pl-4 border-l-2 italic text-[17px]" style={{ borderColor: "#C85C22", color: "#8a8073" }}>
              “Every day is a chance to outperform yesterday.”
            </blockquote>
          </div>
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto w-full grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black tracking-[-0.05em]" style={{ fontSize: "clamp(1.5rem,2.5vw,2rem)" }}>
            TODAY'S HABITS
          </h2>
            <Link
                to="/habits"
                className="px-4 py-2 rounded-full text-[14px] font-semibold"
                style={{ border: "1px solid #dbcfbf", color: "#C85C22", background: "#fcf8f1" }}
            >
                + Manage
            </Link>
        </div>

        <div className="grid gap-3">
          {habits.map((habit) => {
            const Icon = getHabitIcon(habit.icon);
            const done = habit.status === "COMPLETED";
            return (
              <div key={habit.habitId} className="rounded-[20px] px-4 py-3 flex items-center gap-4" style={{ background: "#fcf8f1", border: "1px solid #d8cbb9" }}>
                <button onClick={() => handleHabitClick(habit)} className="shrink-0" aria-label="Toggle habit">
                  <HabitStatusIcon status={habit.status} />
                </button>
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: habit.color }} />
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#fff8ef" }}>
                  <Icon size={16} color={habit.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[17px] ${done ? "line-through" : ""}`} style={{ color: done ? "#8f8577" : "#1a1714" }}>{habit.title}</p>
                </div>
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

      <section className="max-w-[1100px] mx-auto w-full grid gap-4 md:grid-cols-2">
        <Link to="/journal" className="rounded-[20px] px-5 py-4 flex items-center justify-between" style={{ background: "#fcf8f1", border: "1px solid #d8cbb9" }}>
          <div className="flex items-center gap-3">
            <BookOpen size={18} color="#C85C22" />
            <div>
              <p className="font-bold" style={{ color: "#1a1714" }}>Journal</p>
              <p className="text-[14px]" style={{ color: "#766d63" }}>Write today&apos;s entry</p>
            </div>
          </div>
          <ChevronRight size={18} color="#8f8577" />
        </Link>
        <Link to="/analytics" className="rounded-[20px] px-5 py-4 flex items-center justify-between" style={{ background: "#fcf8f1", border: "1px solid #d8cbb9" }}>
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

      <section className="max-w-[1100px] mx-auto w-full grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black tracking-[-0.05em]" style={{ fontSize: "clamp(1.5rem,2.5vw,2rem)" }}>
            TODAY'S TASKS
          </h2>
            <Link
                to="/todos"
                className="px-4 py-2 rounded-full text-[14px] font-semibold"
                style={{ border: "1px solid #dbcfbf", color: "#C85C22", background: "#fcf8f1" }}
            >
                + Manage
            </Link>
        </div>

        <div className="grid gap-3">
          {visibleTodos.map((item) => (
            <div key={item.taskId ?? item.eventId ?? item.id} className="rounded-[18px] px-4 py-3 flex items-center gap-4" style={{ background: "#fcf8f1", border: "1px solid #d8cbb9" }}>
              <button onClick={() => handleTaskClick(item)} className="shrink-0" aria-label="Toggle task" disabled={!item.taskId}>
                <div className="w-[22px] h-[22px] rounded-md flex items-center justify-center" style={{ border: `1.8px solid ${item.completed ? "#4b7a36" : "#d0c6b7"}`, background: item.completed ? "#4b7a36" : "transparent" }}>
                  {item.completed && <Check size={12} color="#fff" />}
                </div>
              </button>
              <span className={`flex-1 text-[17px] ${item.completed ? "line-through" : ""}`} style={{ color: item.completed ? "#8f8577" : "#1a1714" }}>
                {item.title}
              </span>
              <TaskPriority priority={item.priority} />
              <ArrowRight size={16} color="#8f8577" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Flame, Award, BookOpen, Target, TrendingUp, CheckCircle2, Calendar } from "lucide-react";
import { getAnalytics } from "../api/analytics";

// ─────────────────── palette / constants ───────────────────

const C = {
    peach:  "#FF8B6B",
    teal:   "#4FC9A8",
    moss:   "#8FBE7A",
    sky:    "#8FA6FF",
    rose:   "#FF88AA",
    muted:  "var(--text-muted)",
    text:   "var(--text)",
    border: "var(--border)",
    surface:"var(--surface-2)",
};

// Heatmap colour scale: -1 = no habits, 0 = nothing done, 1-100 = intensity
function heatColor(pct) {
    if (pct < 0) return "var(--surface-2)";   // no habits logged
    if (pct === 0) return "var(--border)";
    if (pct < 34)  return "#FF8B6B33";
    if (pct < 67)  return "#FF8B6B88";
    if (pct < 100) return "#FF8B6Bbb";
    return "#FF8B6B";
}

// ─────────────────── small components ───────────────────

function StatCard({ icon: Icon, label, value, sub, color = C.peach }) {
    return (
        <div className="rounded-2xl p-4 flex items-center gap-3"
             style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                 style={{ background: color + "22" }}>
                <Icon size={20} color={color} />
            </div>
            <div>
                <p className="font-display font-bold text-xl leading-none" style={{ color: C.text }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>{label}</p>
                {sub && <p className="text-xs mt-0.5" style={{ color: C.muted }}>{sub}</p>}
            </div>
        </div>
    );
}

function SectionTitle({ children }) {
    return (
        <h2 className="font-display text-sm font-semibold mb-3 uppercase tracking-wider"
            style={{ color: C.muted }}>{children}</h2>
    );
}

const TOOLTIP_STYLE = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    fontSize: 12,
    color: "var(--text)",
};

function PctBar({ pct, color = C.peach, label, sublabel }) {
    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm" style={{ color: C.text }}>{label}</span>
                <span className="font-display font-bold text-sm" style={{ color }}>{pct}%</span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: 8, background: "var(--border)" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: "width .5s ease" }} />
            </div>
            {sublabel && <p className="text-xs mt-1" style={{ color: C.muted }}>{sublabel}</p>}
        </div>
    );
}

// ─────────────────── heatmap ───────────────────

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function Heatmap({ data }) {
    const [hovered, setHovered] = useState(null);

    // Build week columns: each column is 7 cells (Sun→Sat)
    // data is 365 days oldest-first
    const weeks = [];
    if (data?.length) {
        // Pad start so first cell aligns to correct day-of-week
        const firstDow = new Date(data[0].date + "T12:00").getDay();
        const padded = [
            ...Array(firstDow).fill(null),
            ...data,
        ];
        for (let i = 0; i < padded.length; i += 7) {
            weeks.push(padded.slice(i, i + 7));
        }
    }

    // Month labels: find the first cell of each month
    const monthLabels = [];
    if (data?.length) {
        let lastMonth = -1;
        weeks.forEach((week, wi) => {
            week.forEach(cell => {
                if (!cell) return;
                const m = new Date(cell.date + "T12:00").getMonth();
                if (m !== lastMonth) {
                    monthLabels.push({ wi, label: MONTH_SHORT[m] });
                    lastMonth = m;
                }
            });
        });
    }

    const CELL = 12, GAP = 3;

    return (
        <div>
            <div className="overflow-x-auto pb-2">
                <div style={{ display: "inline-block", position: "relative", minWidth: weeks.length * (CELL + GAP) }}>
                    {/* Month labels */}
                    <div style={{ display: "flex", paddingLeft: 0, marginBottom: 4, height: 14 }}>
                        {weeks.map((_, wi) => {
                            const entry = monthLabels.find(m => m.wi === wi);
                            return (
                                <div key={wi} style={{ width: CELL + GAP, flexShrink: 0 }}>
                                    {entry && (
                                        <span style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap" }}>
                      {entry.label}
                    </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Day labels on left */}
                    <div style={{ display: "flex", gap: GAP }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: GAP, marginRight: 2 }}>
                            {WEEKDAY_LABELS.map((d, i) => (
                                <div key={d} style={{ height: CELL, fontSize: 9, color: C.muted, display: "flex", alignItems: "center" }}>
                                    {i % 2 === 1 ? d : ""}
                                </div>
                            ))}
                        </div>

                        {/* Grid */}
                        <div style={{ display: "flex", gap: GAP }}>
                            {weeks.map((week, wi) => (
                                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                                    {Array(7).fill(null).map((_, di) => {
                                        const cell = week[di];
                                        if (!cell) return <div key={di} style={{ width: CELL, height: CELL }} />;
                                        const isHovered = hovered?.date === cell.date;
                                        return (
                                            <div
                                                key={di}
                                                onMouseEnter={() => setHovered(cell)}
                                                onMouseLeave={() => setHovered(null)}
                                                style={{
                                                    width: CELL,
                                                    height: CELL,
                                                    borderRadius: 3,
                                                    background: heatColor(cell.completionPct),
                                                    outline: isHovered ? `2px solid ${C.peach}` : cell.hasJournalEntry ? `1.5px solid ${C.sky}44` : "none",
                                                    cursor: "pointer",
                                                    transition: "transform .1s",
                                                    transform: isHovered ? "scale(1.3)" : "scale(1)",
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tooltip */}
                    {hovered && (
                        <div
                            className="pointer-events-none rounded-xl px-3 py-2 text-xs"
                            style={{
                                position: "absolute",
                                bottom: "calc(100% + 8px)",
                                left: "50%",
                                transform: "translateX(-50%)",
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                                color: C.text,
                                whiteSpace: "nowrap",
                                zIndex: 10,
                                boxShadow: "0 4px 16px rgba(0,0,0,.15)",
                            }}
                        >
                            <p className="font-medium">{hovered.date}</p>
                            <p style={{ color: C.muted }}>
                                {hovered.completionPct < 0
                                    ? "No habits logged"
                                    : `${hovered.completedHabits}/${hovered.totalHabits} habits · ${hovered.completionPct}%`}
                            </p>
                            {hovered.hasJournalEntry && <p style={{ color: C.sky }}>📖 Journal written</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className="text-xs" style={{ color: C.muted }}>Less</span>
                {[0, 33, 66, 100].map(v => (
                    <div key={v} style={{ width: 12, height: 12, borderRadius: 3, background: heatColor(v) }} />
                ))}
                <span className="text-xs" style={{ color: C.muted }}>More</span>
                <div className="flex items-center gap-1.5 ml-2 text-xs" style={{ color: C.muted }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: "var(--border)", border: `1.5px solid ${C.sky}44` }} />
                    Journal entry
                </div>
            </div>
        </div>
    );
}

// ─────────────────── project progress ───────────────────

function ProjectProgressCard({ project }) {
    const color = project.progressPercent === 100 ? C.moss : C.peach;
    return (
        <div className="rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: C.text }}>{project.name}</p>
                    {project.deadline && (
                        <p className="text-xs mt-0.5" style={{ color: C.muted }}>Due {project.deadline}</p>
                    )}
                </div>
                <span className="font-display font-bold text-lg shrink-0" style={{ color }}>{project.progressPercent}%</span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: 6, background: "var(--border)" }}>
                <div className="h-full rounded-full" style={{ width: `${project.progressPercent}%`, background: color, transition: "width .5s ease" }} />
            </div>
            <p className="text-xs mt-1.5" style={{ color: C.muted }}>
                {project.completedMilestones}/{project.totalMilestones} milestones complete
            </p>
        </div>
    );
}

// ─────────────────── main page ───────────────────

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getAnalytics()
            .then(setData)
            .catch(() => setError("Couldn't load analytics. Make sure the API is running."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="pt-6">
                <h1 className="font-display text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Analytics</h1>
                <p style={{ color: C.muted }}>Crunching the numbers…</p>
            </div>
        );
    }
    if (error || !data) {
        return (
            <div className="pt-6">
                <h1 className="font-display text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Analytics</h1>
                <p style={{ color: "#D1467A" }}>{error || "No data."}</p>
            </div>
        );
    }

    const { streaks, allTimeCompletionPct, last7DaysCompletionPct, last30DaysCompletionPct,
        journalEntriesLast30Days, journalEntriesAllTime, heatmap,
        last7Days, last30Days, habitBreakdown, projectProgress } = data;

    const PIE_DATA = [
        { name: "Completed", value: allTimeCompletionPct, color: C.moss },
        { name: "Missed",    value: 100 - allTimeCompletionPct, color: "var(--border)" },
    ];

    return (
        <div className="pt-6 pb-14 grid gap-8 max-w-5xl">
            <div>
                <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>Analytics</h1>
                <p className="text-sm mt-1" style={{ color: C.muted }}>Your consistency, visualised.</p>
            </div>

            {/* ── Streak + key stats ─────────────────── */}
            <section>
                <SectionTitle>Streaks &amp; Overview</SectionTitle>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard icon={Flame}        label="Current streak"    value={`${streaks.currentStreak}d`}  color={C.peach} />
                    <StatCard icon={Award}        label="Longest streak"    value={`${streaks.longestStreak}d`}  color={C.teal}  />
                    <StatCard icon={CheckCircle2} label="Days completed"    value={streaks.totalCompletedDays}   color={C.moss}  />
                    <StatCard icon={Target}       label="Challenge day"     value={`${streaks.challengeDay}/${streaks.totalChallengeDays}`} color={C.sky} />
                </div>
            </section>

            {/* ── Completion rates ─────────────────────── */}
            <section>
                <SectionTitle>Completion Rate</SectionTitle>
                <div className="rounded-3xl p-5 grid md:grid-cols-2 gap-6"
                     style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="grid gap-4">
                        <PctBar pct={allTimeCompletionPct}   label="All time (last year)"  color={C.peach}  />
                        <PctBar pct={last30DaysCompletionPct} label="Last 30 days"         color={C.teal}   />
                        <PctBar pct={last7DaysCompletionPct}  label="Last 7 days"          color={C.moss}   />
                    </div>
                    <div className="flex items-center justify-center">
                        <div style={{ position: "relative", width: 160, height: 160 }}>
                            <PieChart width={160} height={160}>
                                <Pie data={PIE_DATA} cx={75} cy={75} innerRadius={52} outerRadius={72}
                                     dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}>
                                    {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} stroke="var(--surface)" strokeWidth={2} />)}
                                </Pie>
                            </PieChart>
                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                <span className="font-display font-bold text-2xl" style={{ color: C.text }}>{allTimeCompletionPct}%</span>
                                <span className="text-xs" style={{ color: C.muted }}>all time</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Heatmap ─────────────────────────────── */}
            <section>
                <SectionTitle>Activity Heatmap — last 365 days</SectionTitle>
                <div className="rounded-3xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <Heatmap data={heatmap} />
                </div>
            </section>

            {/* ── Bar charts ──────────────────────────── */}
            <section className="grid md:grid-cols-2 gap-5">
                <div>
                    <SectionTitle>Last 7 days</SectionTitle>
                    <div className="rounded-3xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={last7Days} barSize={24}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, "Completion"]} />
                                <Bar dataKey="completionPct" fill={C.peach} radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div>
                    <SectionTitle>Last 30 days</SectionTitle>
                    <div className="rounded-3xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={last30Days}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false}
                                       interval={Math.floor(last30Days.length / 6)} />
                                <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, "Completion"]} />
                                <Line type="monotone" dataKey="completionPct" stroke={C.teal} strokeWidth={2.5}
                                      dot={false} activeDot={{ r: 5, fill: C.teal }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* ── Habit breakdown ──────────────────────── */}
            {habitBreakdown.length > 0 && (
                <section>
                    <SectionTitle>Habit Breakdown — days completed (last year)</SectionTitle>
                    <div className="rounded-3xl p-5 grid gap-3"
                         style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                        {habitBreakdown.map(h => (
                            <PctBar
                                key={h.habitId}
                                pct={h.completionPct}
                                label={h.title}
                                color={h.color || C.peach}
                                sublabel={`${h.completedDays} days completed out of ${h.totalDays}`}
                            />
                        ))}

                        <div className="mt-2">
                            <ResponsiveContainer width="100%" height={Math.max(120, habitBreakdown.length * 32)}>
                                <BarChart data={habitBreakdown} layout="vertical" barSize={14}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                    <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="title" width={110} tick={{ fill: C.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, "Completion"]} />
                                    <Bar dataKey="completionPct" radius={[0, 6, 6, 0]}>
                                        {habitBreakdown.map((h, i) => (
                                            <Cell key={i} fill={h.color || C.peach} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Journal frequency ────────────────────── */}
            <section>
                <SectionTitle>Journal Frequency</SectionTitle>
                <div className="rounded-3xl p-5 grid sm:grid-cols-2 gap-5"
                     style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                             style={{ background: C.sky + "22" }}>
                            <BookOpen size={24} color={C.sky} />
                        </div>
                        <div>
                            <p className="font-display font-bold text-3xl" style={{ color: C.text }}>
                                {journalEntriesLast30Days}
                            </p>
                            <p className="text-sm" style={{ color: C.muted }}>entries in the last 30 days</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                             style={{ background: C.teal + "22" }}>
                            <Calendar size={24} color={C.teal} />
                        </div>
                        <div>
                            <p className="font-display font-bold text-3xl" style={{ color: C.text }}>
                                {journalEntriesAllTime}
                            </p>
                            <p className="text-sm" style={{ color: C.muted }}>total journal entries</p>
                        </div>
                    </div>

                    {/* Journal dots overlaid on 30-day chart */}
                    <div className="sm:col-span-2">
                        <p className="text-xs mb-2 font-medium" style={{ color: C.muted }}>Days journaled vs habit completion (30d)</p>
                        <ResponsiveContainer width="100%" height={140}>
                            <BarChart data={last30Days.map(d => ({ ...d, journal: d.hasJournalEntry ? 100 : 0 }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false}
                                       interval={Math.floor(last30Days.length / 6)} />
                                <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Bar dataKey="completionPct" fill={C.peach} radius={[4, 4, 0, 0]} name="Habits" opacity={0.75} />
                                <Bar dataKey="journal" fill={C.sky} radius={[4, 4, 0, 0]} name="Journal" opacity={0.5} />
                                <Legend wrapperStyle={{ fontSize: 12, color: C.muted }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* ── Project / challenge progress ─────────── */}
            {projectProgress.length > 0 && (
                <section>
                    <SectionTitle>Project Progress</SectionTitle>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {projectProgress.map(p => <ProjectProgressCard key={p.id} project={p} />)}
                    </div>
                </section>
            )}
        </div>
    );
}

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

// ── Mock UI screens ───────────────────────────────────────────────

function DashboardMock() {
    const [progress, setProgress] = useState(0);
    const [ring, setRing] = useState(314);
    useEffect(() => {
        const t = setTimeout(() => {
            setProgress(67);
            setRing(314 - 314 * 0.67);
        }, 400);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="bg-[#f2ede6] rounded-2xl overflow-hidden shadow-2xl border border-[#ddd5c8] w-full">
            {/* top bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#ddd5c8] bg-[#faf7f2]">
                <div className="w-3 h-3 rounded-full bg-[#f87171]" />
                <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
                <div className="flex items-center gap-1.5 ml-3">
                    <div className="w-6 h-6 rounded-lg bg-[#d95a2b] flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 9L9 2M9 2H4M9 2V7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <span className="font-display font-bold text-xs text-[#1c1714] tracking-widest">ASCEND</span>
                </div>
            </div>
            <div className="flex">
                {/* sidebar */}
                <div className="w-28 bg-[#faf7f2] border-r border-[#ddd5c8] py-4 flex flex-col gap-1 shrink-0">
                    {["Dashboard","Habits","Tasks","Projects","Journal","Analytics"].map((item, i) => (
                        <div key={item} className={`px-3 py-1.5 text-[10px] font-medium rounded-r-lg mx-1 ${i === 0 ? "text-[#d95a2b] bg-[#fce8df]" : "text-[#8a7d72]"}`}>{item}</div>
                    ))}
                </div>
                {/* main */}
                <div className="flex-1 p-4 space-y-3 min-w-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-2 border-[#d95a2b] flex flex-col items-center justify-center shrink-0">
                            <div className="text-[8px] text-[#8a7d72] leading-none">DAY</div>
                            <div className="font-display font-bold text-lg text-[#d95a2b] leading-none">6</div>
                        </div>
                        <div>
                            <div className="font-display font-bold text-sm text-[#1c1714]">Let's build momentum</div>
                            <div className="text-[10px] text-[#8a7d72] italic">"You just have to show up."</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[["3d","STREAK"],["6/75","DAY"],["2/3","HABITS"]].map(([v,l]) => (
                            <div key={l} className="bg-[#faf7f2] rounded-xl p-2 border border-[#ddd5c8]">
                                <div className="font-display font-bold text-sm text-[#1c1714]">{v}</div>
                                <div className="text-[9px] text-[#8a7d72] tracking-wider">{l}</div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-[#faf7f2] rounded-xl p-3 border border-[#ddd5c8] flex items-center gap-3">
                        <div className="relative w-14 h-14 shrink-0">
                            <svg width="56" height="56" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#ddd5c8" strokeWidth="10"/>
                                <circle
                                    cx="50" cy="50" r="40" fill="none"
                                    stroke="#d95a2b" strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray="251"
                                    strokeDashoffset={ring}
                                    strokeLinecap="round"
                                    transform="rotate(-90 50 50)"
                                    style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="font-display font-bold text-[11px] text-[#d95a2b]">{progress}%</span>
                            </div>
                        </div>
                        <div>
                            <div className="font-display font-bold text-xs text-[#1c1714]">2 of 3 done</div>
                            <div className="text-[9px] text-[#8a7d72] mb-1.5">1 habit left today</div>
                            <div className="h-1.5 bg-[#ddd5c8] rounded-full overflow-hidden w-24">
                                <div
                                    className="h-full bg-[#d95a2b] rounded-full"
                                    style={{ width: `${progress}%`, transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HabitsMock() {
    const habits = [
        { icon: "🏃", name: "Morning Run", time: "07:00", done: true },
        { icon: "📖", name: "Read 30 min", time: "21:00", done: true },
        { icon: "🧘", name: "Meditate", time: "08:00", done: false },
        { icon: "💧", name: "Drink 2L Water", time: "", done: true },
    ];
    return (
        <div className="bg-[#f2ede6] rounded-2xl overflow-hidden shadow-2xl border border-[#ddd5c8]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#ddd5c8] bg-[#faf7f2]">
                <div className="w-3 h-3 rounded-full bg-[#f87171]" />
                <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
            </div>
            <div className="p-4 space-y-2">
                <div className="font-display font-bold text-sm text-[#1c1714] mb-3">Your Habits — Day 6</div>
                {habits.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#faf7f2] rounded-xl p-2.5 border border-[#ddd5c8]">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${h.done ? "bg-[#d95a2b]" : "border-2 border-[#ddd5c8]"}`}>
                            {h.done && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span className="text-sm">{h.icon}</span>
                        <div className="flex-1 min-w-0">
                            <div className={`text-xs font-medium ${h.done ? "line-through text-[#8a7d72]" : "text-[#1c1714]"}`}>{h.name}</div>
                            {h.time && <div className="text-[9px] text-[#8a7d72]">Reminder {h.time}</div>}
                        </div>
                        <div className="flex gap-1">
                            <div className="text-[9px] text-[#8a7d72] bg-[#f2ede6] rounded px-1 py-0.5">📷</div>
                            <div className="text-[9px] text-[#8a7d72] bg-[#f2ede6] rounded px-1 py-0.5">📝</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProjectsMock() {
    const [prog, setProg] = useState(0);
    useEffect(() => { const t = setTimeout(() => setProg(68), 500); return () => clearTimeout(t); }, []);
    const items = ["Design system setup", "API integration", "User auth flow", "Dashboard UI", "Testing suite"];
    const done = [true, true, true, false, false];
    return (
        <div className="bg-[#f2ede6] rounded-2xl overflow-hidden shadow-2xl border border-[#ddd5c8]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#ddd5c8] bg-[#faf7f2]">
                <div className="w-3 h-3 rounded-full bg-[#f87171]" />
                <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
            </div>
            <div className="p-4 space-y-3">
                <div className="font-display font-bold text-sm text-[#1c1714]">Launch Ascend</div>
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#ddd5c8] rounded-full overflow-hidden">
                        <div className="h-full bg-[#d95a2b] rounded-full" style={{ width: `${prog}%`, transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)" }} />
                    </div>
                    <span className="text-[10px] font-medium text-[#d95a2b]">{prog}%</span>
                </div>
                <div className="bg-[#faf7f2] rounded-xl border border-[#ddd5c8] overflow-hidden">
                    <div className="px-3 py-2 border-b border-[#ddd5c8] flex items-center justify-between">
                        <div className="text-xs font-medium text-[#1c1714]">Milestone 1 — Core Build</div>
                        <div className="text-[9px] text-[#8a7d72]">3/5 done</div>
                    </div>
                    <div className="p-2 space-y-1.5">
                        {items.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${done[i] ? "bg-[#d95a2b]" : "border border-[#ddd5c8]"}`}>
                                    {done[i] && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                                <span className={`text-[10px] ${done[i] ? "line-through text-[#8a7d72]" : "text-[#1c1714]"}`}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AnalyticsMock() {
    const [animate, setAnimate] = useState(false);
    useEffect(() => { const t = setTimeout(() => setAnimate(true), 300); return () => clearTimeout(t); }, []);
    const bars = [72, 90, 65, 88, 95, 70, 83];
    const days = ["M","T","W","T","F","S","S"];
    return (
        <div className="bg-[#f2ede6] rounded-2xl overflow-hidden shadow-2xl border border-[#ddd5c8]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#ddd5c8] bg-[#faf7f2]">
                <div className="w-3 h-3 rounded-full bg-[#f87171]" />
                <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
            </div>
            <div className="p-4">
                <div className="font-display font-bold text-sm text-[#1c1714] mb-1">Analytics</div>
                <div className="text-[10px] text-[#8a7d72] mb-3">Your consistency, visualised.</div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {[["🔥","3d","streak"],["✅","91%","all-time"],["📅","6/75","challenge"]].map(([icon,val,label]) => (
                        <div key={label} className="bg-[#faf7f2] rounded-xl p-2 border border-[#ddd5c8] text-center">
                            <div className="text-sm mb-0.5">{icon}</div>
                            <div className="font-display font-bold text-xs text-[#d95a2b]">{val}</div>
                            <div className="text-[8px] text-[#8a7d72]">{label}</div>
                        </div>
                    ))}
                </div>
                <div className="bg-[#faf7f2] rounded-xl p-3 border border-[#ddd5c8]">
                    <div className="text-[9px] text-[#8a7d72] tracking-wider mb-2">WEEKLY COMPLETION</div>
                    <div className="flex items-end gap-1.5 h-16">
                        {bars.map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full rounded-sm bg-[#ddd5c8] overflow-hidden" style={{ height: "52px" }}>
                                    <div
                                        className="w-full bg-[#d95a2b] rounded-sm"
                                        style={{
                                            height: animate ? `${h}%` : "0%",
                                            marginTop: animate ? `${100-h}%` : "100%",
                                            transition: `height 0.8s cubic-bezier(0.16,1,0.3,1) ${i*0.08}s, margin-top 0.8s cubic-bezier(0.16,1,0.3,1) ${i*0.08}s`
                                        }}
                                    />
                                </div>
                                <div className="text-[8px] text-[#8a7d72]">{days[i]}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function JournalMock() {
    return (
        <div className="bg-[#f2ede6] rounded-2xl overflow-hidden shadow-2xl border border-[#ddd5c8]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#ddd5c8] bg-[#faf7f2]">
                <div className="w-3 h-3 rounded-full bg-[#f87171]" />
                <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
            </div>
            <div className="p-4 space-y-3">
                <div>
                    <div className="font-display font-bold text-sm text-[#1c1714]">Day 6 — Journal</div>
                    <div className="text-[10px] text-[#8a7d72]">2026-08-30</div>
                </div>
                <div className="bg-[#faf7f2] rounded-xl p-3 border border-[#ddd5c8]">
                    <div className="text-[9px] text-[#8a7d72] mb-2">How did today feel?</div>
                    <div className="flex gap-1.5 flex-wrap">
                        {["☀️ Great","😊 Good","😐 Okay","😤 Rough","😫 Hard"].map((m, i) => (
                            <span key={i} className={`text-[9px] px-2 py-1 rounded-full border ${i === 1 ? "bg-[#d95a2b] text-white border-[#d95a2b]" : "border-[#ddd5c8] text-[#8a7d72]"}`}>{m}</span>
                        ))}
                    </div>
                </div>
                {["What went well today?","What could have gone better?","What are you grateful for?"].map((q, i) => (
                    <div key={i} className="bg-[#faf7f2] rounded-xl p-3 border border-[#ddd5c8]">
                        <div className="text-[9px] text-[#8a7d72] mb-1.5">{q}</div>
                        <div className={`text-[10px] text-[#1c1714] italic ${i === 0 ? "" : "text-[#8a7d72]"}`}>
                            {i === 0 ? "Completed my morning run and finished the design sprint early." : "Write a line or two..."}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Feature Section ───────────────────────────────────────────────

function FeatureSection({ tag, title, description, details, mock, flip = false, index }) {
    const { ref, inView } = useInView();
    return (
        <div ref={ref} className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <div className={`space-y-5 ${inView ? (flip ? "animate-slide-right" : "animate-slide-left") : ""}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fce8df] border border-[#f5c9b6]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d95a2b]" />
                    <span className="text-xs font-medium text-[#d95a2b] tracking-wide">{tag}</span>
                </div>
                <h3 className="font-display font-bold text-3xl lg:text-4xl text-[#1c1714] leading-tight">{title}</h3>
                <p className="text-[#4a3f35] leading-relaxed text-base">{description}</p>
                <ul className="space-y-2.5">
                    {details.map((d, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-[#d95a2b] flex items-center justify-center shrink-0 mt-0.5">
                                <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                            <span className="text-sm text-[#4a3f35]">{d}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className={`${inView ? (flip ? "animate-slide-left" : "animate-slide-right") : ""} delay-200`}>
                {mock}
            </div>
        </div>
    );
}

// ── Stat counter ──────────────────────────────────────────────────

function StatCard({ value, label, delay }) {
    const { ref, inView } = useInView();
    return (
        <div ref={ref} className={`text-center ${inView ? `animate-float-up ${delay}` : ""}`}>
            <div className="font-display font-black text-5xl lg:text-6xl text-[#d95a2b] mb-1">{value}</div>
            <div className="text-sm text-[#8a7d72] font-medium">{label}</div>
        </div>
    );
}

// ── Testimonial ───────────────────────────────────────────────────

function Testimonial({ quote, name, detail, delay }) {
    const { ref, inView } = useInView();
    return (
        <div ref={ref} className={`bg-[#faf7f2] rounded-2xl p-6 border border-[#ddd5c8] ${inView ? `animate-float-up ${delay}` : ""}`}>
            <div className="text-[#d95a2b] text-2xl mb-3 font-display">"</div>
            <p className="text-[#4a3f35] text-sm leading-relaxed mb-4 italic font-display">{quote}</p>
            <div>
                <div className="font-semibold text-sm text-[#1c1714]">{name}</div>
                <div className="text-xs text-[#8a7d72]">{detail}</div>
            </div>
        </div>
    );
}

// ── Main App ──────────────────────────────────────────────────────

export default function Home() {
    const [scrolled, setScrolled] = useState(false);
    const [dayCount, setDayCount] = useState(0);
    const heroRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        let frame;
        let start = null;
        const duration = 1800;
        const target = 75;
        const step = (ts) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setDayCount(Math.round(ease * target));
            if (p < 1) frame = requestAnimationFrame(step);
        };
        const t = setTimeout(() => { frame = requestAnimationFrame(step); }, 600);
        return () => { clearTimeout(t); cancelAnimationFrame(frame); };
    }, []);

    const features = [
        {
            tag: "Habit Tracker",
            title: "Track every day of your challenge",
            description: "Set a challenge duration — 30, 75, 100 days — and Ascend tracks every single day. Mark habits complete, add photos and notes, and watch your streak grow.",
            details: [
                "Custom day targets — 30, 66, 75, 100 days or any number",
                "Daily check-ins with photo and note attachments",
                "Streak tracking and one-tap reset when you restart",
                "Reminder notifications for each habit",
            ],
            mock: <HabitsMock />,
            flip: false,
        },
        {
            tag: "Tasks",
            title: "Your to-do list, separate from habits",
            description: "One-off tasks live here — errands, deadlines, anything that isn't part of the daily grind. Set due dates, priorities, and filter by status.",
            details: [
                "Due dates and priority levels (low, medium, high)",
                "Filter by open, done, or all tasks",
                "Tasks due today surface automatically on the dashboard",
                "Quick creation with a single tap",
            ],
            mock: (
                <div className="bg-[#f2ede6] rounded-2xl overflow-hidden shadow-2xl border border-[#ddd5c8]">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-[#ddd5c8] bg-[#faf7f2]">
                        <div className="w-3 h-3 rounded-full bg-[#f87171]" />
                        <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                        <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
                    </div>
                    <div className="p-4 space-y-2">
                        <div className="font-display font-bold text-sm text-[#1c1714] mb-3">To-Do</div>
                        <div className="flex gap-2 mb-3">
                            {["Open","Done","All"].map((f,i) => (
                                <span key={f} className={`text-[10px] px-3 py-1 rounded-full border ${i===0?"bg-[#d95a2b] text-white border-[#d95a2b]":"border-[#ddd5c8] text-[#8a7d72]"}`}>{f}</span>
                            ))}
                        </div>
                        {[
                            { task: "Book dentist appointment", priority: "HIGH", due: "Sep 2" },
                            { task: "Finish project proposal", priority: "HIGH", due: "Sep 5" },
                            { task: "Call olive / go on a walk", priority: "MEDIUM", due: null },
                            { task: "Start hosting the website", priority: "MEDIUM", due: "Sep 10" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-2.5 bg-[#faf7f2] rounded-xl p-2.5 border border-[#ddd5c8]">
                                <div className="w-4 h-4 rounded border border-[#ddd5c8] shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-medium text-[#1c1714]">{item.task}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-medium ${item.priority==="HIGH"?"bg-[#fce8df] text-[#d95a2b]":"bg-[#e8e1d8] text-[#8a7d72]"}`}>{item.priority}</span>
                                        {item.due && <span className="text-[8px] text-[#8a7d72]">Due {item.due}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ),
            flip: true,
        },
        {
            tag: "Projects",
            title: "Big goals with milestones and checklists",
            description: "Break long-horizon projects into milestones, each with a checklist. Progress computes automatically from what you tick off.",
            details: [
                "Milestones with individual due dates",
                "Per-milestone checklists — check an item, watch the bar move",
                "Overall project progress bar, computed in real time",
                "Edit and reorder milestones at any time",
            ],
            mock: <ProjectsMock />,
            flip: false,
        },
        {
            tag: "Analytics",
            title: "See your consistency, visualised",
            description: "Streaks, completion rates, activity heatmaps, and per-habit breakdowns — everything you need to understand where you're winning and where to push harder.",
            details: [
                "Current and longest streak counters",
                "All-time, 30-day, and 7-day completion rates",
                "Activity heatmap across the last 365 days",
                "Per-habit analytics to spot patterns",
            ],
            mock: <AnalyticsMock />,
            flip: true,
        },
        {
            tag: "Journal",
            title: "Reflect on every challenge day",
            description: "Write a daily journal entry tied to your challenge day number. Log your mood, what went well, what to improve, and what you're grateful for.",
            details: [
                "Mood tracker with five options",
                "Structured prompts — wins, improvements, gratitude",
                "Calendar view to browse every past entry",
                "Entries linked to your challenge day number",
            ],
            mock: <JournalMock />,
            flip: false,
        },
    ];

    return (
        <div className="min-h-full bg-[#f2ede6] overflow-x-hidden">

            {/* ── Nav ── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#faf7f2]/95 backdrop-blur-md border-b border-[#ddd5c8] shadow-sm" : "bg-transparent"}`}>
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#d95a2b] flex items-center justify-center animate-pulse-glow">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 12L12 3M12 3H6M12 3V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span className="font-display font-black text-lg tracking-widest text-[#1c1714]">ASCEND</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        {["Features","Analytics","Journal"].map(item => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-[#8a7d72] hover:text-[#d95a2b] transition-colors">{item}</a>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login">
                            Sign in
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm bg-[#d95a2b] text-white px-4 py-2 rounded-full font-medium hover:bg-[#c24e22] transition-colors"
                        >
                            Get started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section ref={heroRef} className="relative pt-28 pb-20 px-6 overflow-hidden">
                {/* background texture circles */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#d95a2b]/5 blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#d95a2b]/5 blur-3xl translate-y-1/4 -translate-x-1/4 pointer-events-none" />

                <div className="max-w-6xl mx-auto">
                    <div className="max-w-3xl">
                        {/* eyebrow */}
                        <div className="animate-float-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fce8df] border border-[#f5c9b6] mb-6">
                            <div className="w-2 h-2 rounded-full bg-[#d95a2b]" />
                            <span className="text-xs font-semibold text-[#d95a2b] tracking-wide">75-day challenge tracker</span>
                        </div>

                        {/* headline */}
                        <h1 className="animate-float-up delay-100 font-display font-black text-6xl md:text-7xl lg:text-8xl text-[#1c1714] leading-[0.95] mb-6">
                            Every day<br />
                            <span className="text-[#d95a2b] italic">counts.</span>
                        </h1>

                        <p className="animate-float-up delay-200 text-lg text-[#4a3f35] leading-relaxed mb-8 max-w-xl">
                            Ascend is the challenge tracker that goes beyond streaks — habits, tasks, projects, journals, and analytics all in one place, built for people who want to show up every single day.
                        </p>

                        <div className="animate-float-up delay-300 flex flex-wrap items-center gap-4">
                            <Link
                                to="/register"
                                className="text-sm bg-[#d95a2b] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#c24e22] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#d95a2b]/25 inline-flex items-center"
                            >
                                Create your account →
                            </Link>
                            <a
                                href="#features"
                                className="flex items-center gap-2 text-[#4a3f35] font-medium hover:text-[#d95a2b] transition-colors"
                            >
                                See how it works
                            </a>
                        </div>
                    </div>

                    {/* hero mock + floating cards */}
                    <div className="mt-14 grid grid-cols-1 lg:grid-cols-5 gap-6 items-start animate-float-up delay-400">
                        <div className="lg:col-span-3">
                            <DashboardMock />
                        </div>
                        <div className="lg:col-span-2 grid grid-cols-1 gap-4">
                            {/* day counter card */}
                            <div className="bg-[#faf7f2] rounded-2xl p-5 border border-[#ddd5c8] flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full border-2 border-[#d95a2b] flex flex-col items-center justify-center shrink-0">
                                    <div className="text-[9px] text-[#8a7d72] leading-none tracking-wider">DAY</div>
                                    <div className="font-display font-black text-2xl text-[#d95a2b] leading-none">{dayCount}</div>
                                </div>
                                <div>
                                    <div className="font-display font-bold text-sm text-[#1c1714] mb-0.5">Your challenge, day by day</div>
                                    <div className="text-xs text-[#8a7d72]">Set any target. Track every step.</div>
                                </div>
                            </div>
                            {/* quote card */}
                            <div className="bg-[#d95a2b] rounded-2xl p-5 text-white">
                                <div className="font-display text-3xl mb-2 opacity-60">"</div>
                                <p className="font-display italic text-sm leading-relaxed mb-3">You don't have to feel ready. You just have to show up softly.</p>
                                <div className="text-xs opacity-70">Daily motivation, built in</div>
                            </div>
                            {/* streak badge */}
                            <div className="bg-[#faf7f2] rounded-2xl p-4 border border-[#ddd5c8] flex items-center gap-3">
                                <span className="text-2xl">🔥</span>
                                <div>
                                    <div className="font-display font-bold text-lg text-[#1c1714]">3-day streak</div>
                                    <div className="text-xs text-[#8a7d72]">Keep showing up every day</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="py-16 px-6 border-t border-b border-[#ddd5c8] bg-[#faf7f2]">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
                    <StatCard value="5" label="Powerful features" delay="delay-100" />
                    <StatCard value="75+" label="Day challenges tracked" delay="delay-200" />
                    <StatCard value="100%" label="Yours to customise" delay="delay-300" />
                    <StatCard value="∞" label="Days worth of entries" delay="delay-400" />
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-6xl mx-auto space-y-28">
                    {features.map((f, i) => (
                        <FeatureSection key={i} {...f} index={i} />
                    ))}
                </div>
            </section>



            {/* ── CTA ── */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fce8df] border border-[#f5c9b6] mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#d95a2b]" />
                        <span className="text-xs font-semibold text-[#d95a2b]">Start free · No credit card</span>
                    </div>
                    <h2 className="font-display font-black text-5xl md:text-6xl text-[#1c1714] leading-tight mb-5">
                        Day 1 starts<br /><span className="text-[#d95a2b] italic">today.</span>
                    </h2>
                    <p className="text-[#4a3f35] text-lg mb-10 leading-relaxed max-w-xl mx-auto">
                        Create your account, set your challenge length, and check off your first habit. Everything else — tasks, projects, journals, analytics — unlocks as you go.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to ="/register" className="w-full sm:w-auto bg-[#d95a2b] text-white px-10 py-4 rounded-full font-semibold text-base hover:bg-[#c24e22] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#d95a2b]/30">
                            Create your free account →
                        </Link>
                        <Link to= "/login" className="w-full sm:w-auto text-[#4a3f35] font-medium hover:text-[#d95a2b] transition-colors border border-[#ddd5c8] px-8 py-4 rounded-full hover:border-[#d95a2b]">
                            Sign in to existing account
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-[#ddd5c8] bg-[#faf7f2] py-10 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#d95a2b] flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2.5 10.5L10.5 2.5M10.5 2.5H5M10.5 2.5V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span className="font-display font-black tracking-widest text-[#1c1714]">ASCEND</span>
                    </div>
                    <p className="text-xs text-[#8a7d72]">© 2026 Ascend. Built for people who show up.</p>
                    <div className="flex gap-5">
                        {["Privacy","Terms","Contact"].map(l => (
                            <a key={l} href="#" className="text-xs text-[#8a7d72] hover:text-[#d95a2b] transition-colors">{l}</a>
                        ))}
                    </div>
                </div>
            </footer>

        </div>
    );
}



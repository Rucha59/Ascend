import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  ChevronLeft, ChevronRight, Bold, Italic, List as ListIcon,
  Image as ImageIcon, BookOpen, Pencil, X,
} from "lucide-react";
import { getJournal, saveJournal, uploadJournalImage, deleteJournalImage, getFilledDates } from "../api/journal";
import { getToday } from "../api/days";
import AuthImage from "../components/AuthImage";

// ─────────────────────── constants ───────────────────────

const MOODS = [
  { id: "GREAT",  label: "Great", emoji: "🌟", color: "#8FBE7A" },
  { id: "GOOD",   label: "Good",  emoji: "😊", color: "#4FC9A8" },
  { id: "OKAY",   label: "Okay",  emoji: "😐", color: "#8FA6FF" },
  { id: "ROUGH",  label: "Rough", emoji: "😔", color: "#FF8B6B" },
  { id: "HARD",   label: "Hard",  emoji: "😞", color: "#FF88AA" },
];
const MOOD_MAP = Object.fromEntries(MOODS.map(m => [m.id, m]));
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─────────────────────── helpers ───────────────────────

function toYMD(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildCalendarGrid(year, month) {
  // month is 1-based; returns weeks × 7 of { date (Date), iso (str), outOfMonth (bool) }
  const first = new Date(year, month - 1, 1);
  const startOffset = first.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [];
  // Previous month fill
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, -i);
    cells.push({ date: d, iso: toYMD(d), outOfMonth: true });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month - 1, d);
    cells.push({ date: dt, iso: toYMD(dt), outOfMonth: false });
  }
  // Next month fill to complete grid
  let next = 1;
  while (cells.length % 7 !== 0) {
    const d = new Date(year, month, next++);
    cells.push({ date: d, iso: toYMD(d), outOfMonth: true });
  }
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// ─────────────────────── sub-components ───────────────────────

function CalendarPanel({ selectedDate, todayIso, onSelectDate }) {
  const getInitialMonth = () => {
    const d = selectedDate ? new Date(selectedDate + "T12:00:00") : new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  };
  const [{ year, month }, setYM] = useState(getInitialMonth);
  const [filledSet, setFilledSet] = useState(new Set());
  const [loadingMonth, setLoadingMonth] = useState(false);

  useEffect(() => {
    setLoadingMonth(true);
    getFilledDates(year, month)
        .then(dates => setFilledSet(new Set(dates)))
        .catch(() => {})
        .finally(() => setLoadingMonth(false));
  }, [year, month]);

  const prev = () => setYM(({ year: y, month: m }) =>
      m === 1 ? { year: y - 1, month: 12 } : { year: y, month: m - 1 });
  const next = () => setYM(({ year: y, month: m }) =>
      m === 12 ? { year: y + 1, month: 1 } : { year: y, month: m + 1 });
  const goToday = () => {
    const now = new Date();
    setYM({ year: now.getFullYear(), month: now.getMonth() + 1 });
    onSelectDate(todayIso);
  };

  const weeks = buildCalendarGrid(year, month);

  return (
      <div
          className="rounded-3xl p-5 flex flex-col gap-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", minWidth: 280 }}
      >
        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button onClick={prev} className="p-1.5 rounded-xl" style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <p className="font-display font-bold text-sm" style={{ color: "var(--text)" }}>
              {MONTH_NAMES[month - 1]} {year}
            </p>
          </div>
          <button onClick={next} className="p-1.5 rounded-xl" style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-0.5">
          {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-[11px] font-medium py-0.5" style={{ color: "var(--text-muted)" }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid gap-0.5" style={{ opacity: loadingMonth ? 0.5 : 1, transition: "opacity .15s" }}>
          {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-0.5">
                {week.map(cell => {
                  const isToday = cell.iso === todayIso;
                  const isSelected = cell.iso === selectedDate;
                  const isFilled = filledSet.has(cell.iso);
                  const isFuture = cell.iso > todayIso;

                  let bg = "transparent";
                  let textColor = cell.outOfMonth ? "var(--border)" : "var(--text)";
                  let border = "transparent";

                  if (isSelected) {
                    bg = "#FF8B6B";
                    textColor = "#3A1F16";
                  } else if (isToday) {
                    border = "#FF8B6B";
                    textColor = "#FF8B6B";
                  }

                  return (
                      <button
                          key={cell.iso}
                          onClick={() => !isFuture && onSelectDate(cell.iso)}
                          disabled={isFuture}
                          className="relative flex flex-col items-center justify-center rounded-xl aspect-square"
                          style={{ background: bg, border: `1.5px solid ${border}`, color: textColor, cursor: isFuture ? "default" : "pointer", opacity: isFuture ? 0.35 : 1 }}
                          title={cell.iso}
                      >
                        <span className="text-xs font-medium leading-none">{cell.date.getDate()}</span>
                        {/* Filled-day dot */}
                        {isFilled && !isSelected && (
                            <span
                                className="absolute rounded-full"
                                style={{ width: 4, height: 4, bottom: 3, background: cell.outOfMonth ? "var(--border)" : "#FF8B6B" }}
                            />
                        )}
                        {isFilled && isSelected && (
                            <span className="absolute rounded-full" style={{ width: 4, height: 4, bottom: 3, background: "rgba(255,255,255,0.7)" }} />
                        )}
                      </button>
                  );
                })}
              </div>
          ))}
        </div>

        {/* Today shortcut */}
        <button
            onClick={goToday}
            className="text-xs font-medium py-1.5 rounded-xl w-full"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          Jump to today
        </button>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "#FF8B6B" }} /> Written
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="w-3.5 h-3.5 rounded-md border-2 flex items-center justify-center text-[9px]" style={{ borderColor: "#FF8B6B", color: "#FF8B6B" }}>•</span> Today
          </div>
        </div>
      </div>
  );
}

// Read-only summary of an entry — shown before the user clicks "Edit"
function EntryReadView({ entry, date, dayNumber, onEdit }) {
  const mood = entry.mood ? MOOD_MAP[entry.mood] : null;
  const hasContent = entry.gratitude || entry.wentWell || entry.couldImprove || entry.content;

  return (
      <div className="grid gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>
              {dayNumber ? `Day ${dayNumber}` : date}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{date}</p>
          </div>
          <button
              onClick={onEdit}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium shrink-0"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <Pencil size={13} /> Edit
          </button>
        </div>

        {mood && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: mood.color + "15", border: `1px solid ${mood.color}33` }}>
              <span className="text-xl">{mood.emoji}</span>
              <div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Mood</p>
                <p className="font-medium text-sm" style={{ color: mood.color }}>{mood.label}</p>
              </div>
            </div>
        )}

        {!hasContent && !entry.images?.length && (
            <div className="py-8 text-center rounded-2xl" style={{ border: "1px dashed var(--border)" }}>
              <BookOpen size={28} style={{ color: "var(--border)", margin: "0 auto 8px" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No entry written yet.</p>
              <button onClick={onEdit} className="mt-3 text-sm font-medium" style={{ color: "#FF8B6B" }}>
                Write one
              </button>
            </div>
        )}

        {(entry.wentWell || entry.couldImprove || entry.gratitude) && (
            <div className="grid gap-3 rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              {entry.wentWell && (
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>What went well</p>
                    <p className="text-sm" style={{ color: "var(--text)" }}>{entry.wentWell}</p>
                  </div>
              )}
              {entry.couldImprove && (
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Could have gone better</p>
                    <p className="text-sm" style={{ color: "var(--text)" }}>{entry.couldImprove}</p>
                  </div>
              )}
              {entry.gratitude && (
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Grateful for</p>
                    <p className="text-sm" style={{ color: "var(--text)" }}>{entry.gratitude}</p>
                  </div>
              )}
            </div>
        )}

        {entry.content && (
            <div className="rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Free write</p>
              <div className="markdown-preview text-sm" style={{ color: "var(--text)" }}>
                <ReactMarkdown>{entry.content}</ReactMarkdown>
              </div>
            </div>
        )}

        {entry.images?.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Photos</p>
              <div className="grid grid-cols-3 gap-2">
                {entry.images.map(img => (
                    <AuthImage key={img.id} url={img.url} alt={img.originalFileName} />
                ))}
              </div>
            </div>
        )}
      </div>
  );
}

// Full edit form — same fields as before, kept intact
function EntryEditForm({ date, entry, onSaved, onCancel }) {
  const [form, setForm] = useState({
    mood: entry?.mood || null,
    gratitude: entry?.gratitude || "",
    wentWell: entry?.wentWell || "",
    couldImprove: entry?.couldImprove || "",
    content: entry?.content || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [localEntry, setLocalEntry] = useState(entry);

  const insert = token => setForm(f => ({ ...f, content: (f.content || "") + token }));

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const data = await saveJournal(date, form);
      setLocalEntry(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      onSaved(data);
    } catch {
      setError("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async e => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const data = await saveJournal(date, form); // ensure entry exists first
      await uploadJournalImage(date, file);
      const refreshed = await import("../api/journal").then(m => m.getJournal(date));
      setLocalEntry(refreshed);
      onSaved(refreshed);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't upload that image.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async id => {
    try {
      await deleteJournalImage(date, id);
      const refreshed = await import("../api/journal").then(m => m.getJournal(date));
      setLocalEntry(refreshed);
      onSaved(refreshed);
    } catch {
      setError("Couldn't remove that photo.");
    }
  };

  return (
      <div className="grid gap-4">
        {error && <p className="text-sm px-3 py-2 rounded-xl" style={{ background: "#FF88AA22", color: "#D1467A" }}>{error}</p>}

        {/* Mood */}
        <div className="rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>How did today feel?</p>
          <div className="flex flex-wrap gap-2">
            {MOODS.map(m => (
                <button
                    key={m.id}
                    onClick={() => setForm({ ...form, mood: form.mood === m.id ? null : m.id })}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full"
                    style={{
                      border: `1px solid ${form.mood === m.id ? m.color : "var(--border)"}`,
                      background: form.mood === m.id ? m.color + "1f" : "transparent",
                      color: form.mood === m.id ? m.color : "var(--text-muted)",
                    }}
                >
                  <span>{m.emoji}</span> {m.label}
                </button>
            ))}
          </div>
        </div>

        {/* Reflections */}
        <div className="rounded-2xl p-4 grid gap-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          {[
            ["wentWell", "What went well today?"],
            ["couldImprove", "What could have gone better?"],
            ["gratitude", "What are you grateful for?"],
          ].map(([k, label]) => (
              <div key={k}>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>{label}</label>
                <textarea
                    rows={2}
                    value={form[k]}
                    onChange={e => setForm({ ...form, [k]: e.target.value })}
                    placeholder="Write a line or two…"
                    className="w-full text-sm px-3 py-2 rounded-lg resize-none outline-none"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              </div>
          ))}
        </div>

        {/* Free write */}
        <div className="rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Free write</label>
            <div className="flex items-center gap-1">
              <button onClick={() => insert("**bold** ")} className="p-1.5 rounded-md" style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}><Bold size={12} /></button>
              <button onClick={() => insert("*italic* ")} className="p-1.5 rounded-md" style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}><Italic size={12} /></button>
              <button onClick={() => insert("\n- ")} className="p-1.5 rounded-md" style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}><ListIcon size={12} /></button>
              <button
                  onClick={() => setPreview(p => !p)}
                  className="text-xs px-2 py-1 rounded-md ml-1"
                  style={{ border: "1px solid var(--border)", color: preview ? "#FF8B6B" : "var(--text-muted)" }}
              >{preview ? "Edit" : "Preview"}</button>
            </div>
          </div>
          {preview ? (
              <div className="markdown-preview text-sm px-3 py-2 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", minHeight: 100 }}>
                {form.content ? <ReactMarkdown>{form.content}</ReactMarkdown> : <span style={{ color: "var(--text-muted)" }}>Nothing to preview yet.</span>}
              </div>
          ) : (
              <textarea
                  rows={5}
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Markdown supported…"
                  className="w-full text-sm px-3 py-2 rounded-lg resize-none outline-none"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
          )}
        </div>

        {/* Photos */}
        <div className="rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Photos</label>
            <label className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer" style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <ImageIcon size={12} /> {uploading ? "Uploading…" : "Add photo"}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleUpload} disabled={uploading} className="hidden" />
            </label>
          </div>
          {localEntry?.images?.length ? (
              <div className="grid grid-cols-3 gap-2">
                {localEntry.images.map(img => (
                    <AuthImage key={img.id} url={img.url} alt={img.originalFileName} onDelete={() => handleDeleteImage(img.id)} />
                ))}
              </div>
          ) : (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No photos yet.</p>
          )}
        </div>

        {/* Save / Cancel */}
        <div className="flex items-center gap-3">
          <button
              onClick={save}
              disabled={saving}
              className="font-display font-bold text-sm px-5 py-2.5 rounded-full disabled:opacity-60"
              style={{ background: "#FF8B6B", color: "#3A1F16" }}
          >{saving ? "Saving…" : "Save Entry"}</button>
          {saved && <span className="text-sm" style={{ color: "#8FBE7A" }}>Saved.</span>}
          <button onClick={onCancel} className="text-sm ml-auto" style={{ color: "var(--text-muted)" }}>
            <X size={14} style={{ display: "inline", marginRight: 4 }} />Cancel
          </button>
        </div>
      </div>
  );
}

// ─────────────────────── main page ───────────────────────

export default function Journal() {
  const [searchParams] = useSearchParams();

  const [todayIso, setTodayIso] = useState(null);
  const [selectedDate, setSelectedDate] = useState(searchParams.get("date") || null);
  const [entry, setEntry] = useState(null);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [editing, setEditing] = useState(false);
  const [initError, setInitError] = useState("");
  const [entryError, setEntryError] = useState("");

  const entryPanelRef = useRef(null);

  // Keep the selected date in sync with the URL so back/forward navigation and old-date links work.
  useEffect(() => {
    const urlDate = searchParams.get("date");
    if (urlDate) setSelectedDate(urlDate);
  }, [searchParams]);

  // Resolve today from the server on mount
  useEffect(() => {
    getToday()
        .then(t => {
          setTodayIso(t.date);
          if (!selectedDate) setSelectedDate(t.date);
        })
        .catch(() => setInitError("Couldn't load today's date."));
  }, []);

  // Fetch the entry whenever selected date changes
  const loadEntry = useCallback(() => {
    if (!selectedDate) return;
    setLoadingEntry(true);
    setEditing(false);
    setEntryError("");
    getJournal(selectedDate)
        .then(data => {
          setEntry(data);
          // Auto-open editor if there's no written content yet and it's today or past
          setEditing(!data.id && selectedDate <= (todayIso || selectedDate));
        })
        .catch((err) => {
          setEntry(null);
          setEntryError(err.response?.data?.message || "Couldn't load that journal entry.");
          console.error("Journal load failed", selectedDate, err.response?.status, err.response?.data || err.message);
        })
        .finally(() => setLoadingEntry(false));
  }, [selectedDate, todayIso]);

  useEffect(() => { loadEntry(); }, [loadEntry]);

  // Scroll the entry panel into view on mobile when a date is selected
  const handleSelectDate = date => {
    setSelectedDate(date);
    setTimeout(() => entryPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const handleSaved = updatedEntry => {
    setEntry(updatedEntry);
    setEditing(false);
  };

  if (initError) {
    return <p className="pt-6" style={{ color: "var(--text-muted)" }}>{initError}</p>;
  }
  if (!todayIso) {
    return <p className="pt-6" style={{ color: "var(--text-muted)" }}>Loading journal…</p>;
  }

  return (
      <div className="pt-6 pb-12">
        <div className="mb-5">
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>Journal</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Browse your days — tap any past date to read or write.
          </p>
        </div>

        {/* Two-column layout on wider screens, stacked on mobile */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* Calendar column */}
          <div className="w-full lg:w-auto lg:sticky lg:top-6">
            <CalendarPanel
                selectedDate={selectedDate}
                todayIso={todayIso}
                onSelectDate={handleSelectDate}
            />
          </div>

          {/* Entry column */}
          <div ref={entryPanelRef} className="flex-1 min-w-0">
            <div className="rounded-3xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)", minHeight: 340 }}>
              {loadingEntry ? (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading entry…</p>
              ) : entryError ? (
                  <p className="text-sm" style={{ color: "#D1467A" }}>{entryError}</p>
              ) : editing ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>
                          {entry?.dayNumber ? `Day ${entry.dayNumber}` : selectedDate}
                        </h2>
                        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{selectedDate}</p>
                      </div>
                      {entry?.id && (
                          <button onClick={() => setEditing(false)} className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                            <X size={13} /> Cancel edit
                          </button>
                      )}
                    </div>
                    <EntryEditForm
                        date={selectedDate}
                        entry={entry}
                        onSaved={handleSaved}
                        onCancel={() => setEditing(false)}
                    />
                  </div>
              ) : entry ? (
                  <EntryReadView
                      entry={entry}
                      date={selectedDate}
                      dayNumber={entry.dayNumber}
                      onEdit={() => setEditing(true)}
                  />
              ) : (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Select a day to read its entry.</p>
              )}
            </div>
          </div>

        </div>
      </div>
  );
}

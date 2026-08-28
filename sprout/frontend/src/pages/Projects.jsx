import { useEffect, useState } from "react";
import {
  Plus, ChevronDown, ChevronRight, Trash2, Pencil, Check, X, Flag
} from "lucide-react";
import {
  listProjects, createProject, updateProject, deleteProject,
  getProject,
  addMilestone, updateMilestone, deleteMilestone,
  addChecklistItem, toggleChecklistItem, deleteChecklistItem,
} from "../api/projects";

const PRIORITY_COLORS = { LOW: "#8FBE7A", MEDIUM: "#8FA6FF", HIGH: "#FF88AA" };

function ProgressBar({ pct, color = "#FF8B6B", height = 6 }) {
  return (
    <div className="rounded-full overflow-hidden w-full" style={{ height, background: "var(--border)" }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: color, transition: "width .4s ease" }}
      />
    </div>
  );
}

function ProgressLabel({ pct, completedItems, totalItems }) {
  return (
    <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
      {completedItems}/{totalItems} · {pct}%
    </span>
  );
}

function ChecklistRow({ projectId, milestoneId, item, onUpdated, onError }) {
  const toggle = async () => {
    try { onUpdated(await toggleChecklistItem(projectId, milestoneId, item.id)); }
    catch { onError("Couldn't toggle that item."); }
  };
  const remove = async () => {
    try { onUpdated(await deleteChecklistItem(projectId, milestoneId, item.id)); }
    catch { onError("Couldn't remove that item."); }
  };
  return (
    <div className="flex items-center gap-2 group">
      <button onClick={toggle} className="shrink-0" aria-label="Toggle">
        <div
          className="w-4 h-4 rounded flex items-center justify-center"
          style={{ border: `2px solid ${item.completed ? "#8FBE7A" : "var(--border)"}`, background: item.completed ? "#8FBE7A" : "transparent" }}
        >
          {item.completed && <Check size={11} color="#fff" />}
        </div>
      </button>
      <span
        className="flex-1 text-sm"
        style={{ color: item.completed ? "var(--text-muted)" : "var(--text)", textDecoration: item.completed ? "line-through" : "none" }}
      >
        {item.title}
      </span>
      <button onClick={remove} className="opacity-0 group-hover:opacity-100 shrink-0" aria-label="Delete">
        <X size={13} style={{ color: "var(--text-muted)" }} />
      </button>
    </div>
  );
}

function AddChecklistItemForm({ projectId, milestoneId, onAdded, onError }) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try { onAdded(await addChecklistItem(projectId, milestoneId, { title })); setTitle(""); }
    catch { onError("Couldn't add that item."); }
    finally { setSaving(false); }
  };
  return (
    <form onSubmit={submit} className="flex gap-1.5 mt-1">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Add a checklist item…"
        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg outline-none"
        style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
      />
      <button
        type="submit" disabled={saving || !title.trim()}
        className="text-xs px-2.5 py-1.5 rounded-lg font-display font-bold disabled:opacity-50"
        style={{ background: "#FF8B6B", color: "#3A1F16" }}
      >
        <Plus size={13} />
      </button>
    </form>
  );
}

function MilestoneCard({ projectId, milestone, onUpdated, onError }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: milestone.name, dueDate: milestone.dueDate || "" });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const saveEdit = async () => {
    try {
      onUpdated(await updateMilestone(projectId, milestone.id, { name: form.name, dueDate: form.dueDate || null }));
      setEditing(false);
    } catch { onError("Couldn't save milestone."); }
  };

  const remove = async () => {
    try {
      const updated = await deleteMilestone(projectId, milestone.id);
      console.log("Milestone deleted", { projectId, milestoneId: milestone.id, updated });
      onUpdated(updated);
    } catch (err) {
      console.error("Milestone delete failed", err.response?.status, err.response?.data || err.message);
      onError(err.response?.data?.message || "Couldn't remove milestone.");
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  const overdueColor = milestone.dueDate && new Date(milestone.dueDate) < new Date() && milestone.progressPercent < 100
    ? "#FF88AA" : "var(--text-muted)";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        style={{ background: "var(--surface-2)" }}
        onClick={() => setOpen(o => !o)}
      >
        {open ? <ChevronDown size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
               : <ChevronRight size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}

        {editing ? (
          <div className="flex items-center gap-2 flex-1" onClick={e => e.stopPropagation()}>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="flex-1 text-sm px-2 py-1 rounded-lg outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            <input
              type="date"
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
              className="text-xs px-2 py-1 rounded-lg outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            <button type="button" onClick={saveEdit} className="p-1 rounded-md" style={{ background: "#8FBE7A22" }}>
              <Check size={13} color="#8FBE7A" />
            </button>
            <button type="button" onClick={() => setEditing(false)} className="p-1 rounded-md" style={{ background: "var(--bg)" }}>
              <X size={13} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{milestone.name}</p>
              {milestone.dueDate && (
                <p className="text-xs mt-0.5" style={{ color: overdueColor }}>Due {milestone.dueDate}</p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <ProgressLabel pct={milestone.progressPercent} completedItems={milestone.completedItems} totalItems={milestone.totalItems} />
              <div className="w-20">
                <ProgressBar pct={milestone.progressPercent} color={milestone.progressPercent === 100 ? "#8FBE7A" : "#8FA6FF"} />
              </div>
              <button type="button" onClick={e => { e.stopPropagation(); setEditing(true); }} className="p-1 rounded" style={{ color: "var(--text-muted)" }}>
                <Pencil size={13} />
              </button>
              <button type="button" onClick={e => { e.stopPropagation(); setConfirmDeleteOpen(true); }} className="p-1 rounded" style={{ color: "#FF88AA" }} aria-label="Delete milestone">
                <Trash2 size={13} />
              </button>
            </div>
          </>
        )}
      </div>

      {open && (
        <div className="px-4 py-3 grid gap-1.5" style={{ background: "var(--surface)" }}>
          {milestone.checklistItems.length === 0 && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>No items yet — add one below.</p>
          )}
          {milestone.checklistItems.map(item => (
            <ChecklistRow
              key={item.id}
              projectId={projectId}
              milestoneId={milestone.id}
              item={item}
              onUpdated={onUpdated}
              onError={onError}
            />
          ))}
          <AddChecklistItemForm
            projectId={projectId}
            milestoneId={milestone.id}
            onAdded={onUpdated}
            onError={onError}
          />
        </div>
      )}

      {confirmDeleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(10, 14, 22, 0.45)" }}
          onClick={() => setConfirmDeleteOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-5 shadow-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-display text-lg font-bold" style={{ color: "var(--text)" }}>
              Delete milestone?
            </h4>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Are you sure you want to delete "{milestone.name}"? This will remove its checklist items too.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="px-4 py-2 rounded-xl text-sm"
                style={{ background: "var(--surface-2)", color: "var(--text)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log("Confirm delete milestone clicked", { projectId, milestoneId: milestone.id });
                  remove();
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: "#FF88AA", color: "#3A1F16" }}
              >
                Delete milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project: initial, onError, onDeleted }) {
  const [project, setProject] = useState(initial);
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: initial.name, description: initial.description || "", deadline: initial.deadline || "" });
  const [milestoneForm, setMilestoneForm] = useState({ name: "", dueDate: "" });
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    getProject(initial.id)
      .then((full) => {
        if (!alive) return;
        setProject(full);
        setProjectForm({ name: full.name, description: full.description || "", deadline: full.deadline || "" });
      })
      .catch(() => {
        // Fall back to the summary payload so the list still renders.
      })
      .finally(() => {
        if (alive) setLoadingDetails(false);
      });

    return () => {
      alive = false;
    };
  }, [initial.id]);

  const refreshProject = async () => {
    // ProjectService returns the full project in every mutating response.
    // This is the identity function — callers pass the already-refreshed project.
  };

  const saveProjectEdit = async () => {
    try {
      const updated = await updateProject(project.id, { name: projectForm.name, description: projectForm.description, deadline: projectForm.deadline || null });
      setProject(updated);
      setEditingProject(false);
    } catch { onError("Couldn't save project."); }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(project.id);
      onDeleted(project.id);
      setConfirmDeleteOpen(false);
    } catch { onError("Couldn't delete project."); }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneForm.name.trim()) return;
    try {
      const updated = await addMilestone(project.id, { name: milestoneForm.name, dueDate: milestoneForm.dueDate || null });
      setProject(updated);
      setMilestoneForm({ name: "", dueDate: "" });
      setAddingMilestone(false);
    } catch { onError("Couldn't add milestone."); }
  };

  const milestones = project.milestones || [];
  const daysLeft = project.deadline
    ? Math.ceil((new Date(project.deadline) - new Date()) / 86400000)
    : null;
  const deadlineColor = daysLeft !== null && daysLeft < 7 && project.progressPercent < 100 ? "#FF88AA" : "var(--text-muted)";

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      {/* Project header */}
      <div className="px-5 pt-5 pb-4">
        {editingProject ? (
          <div className="grid gap-2 mb-3">
            <input
              value={projectForm.name}
              onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
              className="font-display text-lg font-bold px-3 py-2 rounded-xl outline-none"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            <textarea
              rows={2}
              value={projectForm.description}
              onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
              placeholder="Description"
              className="text-sm px-3 py-2 rounded-xl outline-none resize-none"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={projectForm.deadline}
                onChange={e => setProjectForm({ ...projectForm, deadline: e.target.value })}
                className="text-sm px-3 py-2 rounded-xl outline-none"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
              <button onClick={saveProjectEdit} className="px-3 py-2 rounded-xl text-sm font-display font-bold" style={{ background: "#8FBE7A22", color: "#4C7A3B" }}>
                <Check size={15} />
              </button>
              <button type="button" onClick={() => setEditingProject(false)} className="p-2 rounded-xl" style={{ color: "var(--text-muted)" }}>
                <X size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg font-bold" style={{ color: "var(--text)" }}>{project.name}</h3>
              {project.description && (
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{project.description}</p>
              )}
              {project.deadline && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: deadlineColor }}>
                  <Flag size={11} />
                  {daysLeft === 0 ? "Due today" : daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left · ${project.deadline}`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button type="button" onClick={() => setEditingProject(true)} className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}>
                <Pencil size={15} />
              </button>
              <button type="button" onClick={() => setConfirmDeleteOpen(true)} className="p-1.5 rounded-lg" style={{ color: "#FF88AA" }}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Overall project progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar pct={project.progressPercent} color={project.progressPercent === 100 ? "#8FBE7A" : "#FF8B6B"} height={8} />
          </div>
          <span className="font-display text-sm font-bold shrink-0" style={{ color: project.progressPercent === 100 ? "#8FBE7A" : "#FF8B6B" }}>
            {project.progressPercent}%
          </span>
          <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
            {project.completedMilestones ?? milestones.filter(m => m.progressPercent === 100).length}/{project.totalMilestones ?? milestones.length} milestones
          </span>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="text-xs px-2.5 py-1 rounded-lg shrink-0"
            style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            {open ? "Collapse" : "View milestones"}
          </button>
        </div>
      </div>

      {/* Milestones */}
      {open && (
        <div className="px-4 pb-4 grid gap-2" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="pt-3" />
          {loadingDetails ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading milestones…</p>
          ) : milestones.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No milestones yet — add one below.</p>
          ) : null}
          {milestones.map(m => (
            <MilestoneCard
              key={m.id}
              projectId={project.id}
              milestone={m}
              onUpdated={setProject}
              onError={onError}
            />
          ))}

          {addingMilestone ? (
            <form onSubmit={handleAddMilestone} className="flex items-center gap-2 mt-1">
              <input
                value={milestoneForm.name}
                onChange={e => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
                placeholder="Milestone name"
                className="flex-1 text-sm px-3 py-2 rounded-xl outline-none"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
              <input
                type="date"
                value={milestoneForm.dueDate}
                onChange={e => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                className="text-sm px-3 py-2 rounded-xl outline-none"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
              <button type="submit" className="p-2 rounded-xl" style={{ background: "#8FBE7A22" }}>
                <Check size={15} color="#8FBE7A" />
              </button>
              <button type="button" onClick={() => setAddingMilestone(false)} className="p-2 rounded-xl" style={{ color: "var(--text-muted)" }}>
                <X size={15} />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAddingMilestone(true)}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl mt-1"
              style={{ border: "1px dashed var(--border)", color: "var(--text-muted)" }}
            >
              <Plus size={14} /> Add milestone
            </button>
          )}
        </div>
      )}

      {confirmDeleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(10, 14, 22, 0.55)" }}
          onClick={() => setConfirmDeleteOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl p-5 shadow-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold" style={{ color: "var(--text)" }}>
              Delete project?
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Are you sure you want to delete "{project.name}"? This will remove the project and all of its milestones and checklist items.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="px-4 py-2 rounded-xl text-sm"
                style={{ background: "var(--surface-2)", color: "var(--text)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: "#FF88AA", color: "#3A1F16" }}
              >
                Delete project
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const EMPTY_FORM = { name: "", description: "", deadline: "" };

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const load = () => {
    setLoading(true);
    listProjects()
      .then(setProjects)
      .catch(() => setError("Couldn't load your projects."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submitCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const created = await createProject({ name: form.name, description: form.description || null, deadline: form.deadline || null });
      setProjects(prev => [{ ...created, milestones: [] }, ...prev]);
      setForm(EMPTY_FORM);
      setShowCreateForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create that project.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleted = (id) => setProjects(prev => prev.filter(p => p.id !== id));

  return (
    <div className="pt-6 grid gap-6 pb-10 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>Projects</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Big goals with milestones and checklists. Progress is computed automatically from what you've ticked off.
        </p>
      </div>

      {error && (
        <p className="text-sm px-3 py-2 rounded-xl" style={{ background: "#FF88AA22", color: "#D1467A" }}>{error}</p>
      )}

      {!showCreateForm ? (
          <button
              onClick={() => setShowCreateForm(true)}
              className="font-display font-bold text-sm px-4 py-2.5 rounded-full flex items-center gap-1.5 w-fit"
              style={{ background: "#FF8B6B", color: "#3A1F16" }}
          >
            <Plus size={15} /> New Project
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
            <div className="flex items-center justify-between">
              <h2
                  className="font-display text-sm"
                  style={{ color: "var(--text-muted)" }}
              >
                New project
              </h2>

              <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setForm(EMPTY_FORM);
                  }}
                  className="p-1"
                  style={{ color: "var(--text-muted)" }}
              >
                <X size={16} />
              </button>
            </div>

            <input
                required
                placeholder="Name, e.g. Launch Sprout publicly"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)"
                }}
            />

            <textarea
                rows={2}
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)"
                }}
            />

            <div className="flex items-center gap-3">
              <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  className="px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text)"
                  }}
              />

              <button
                  type="submit"
                  disabled={creating}
                  className="font-display font-bold text-sm px-4 py-2.5 rounded-full flex items-center gap-1.5 disabled:opacity-60"
                  style={{ background: "#FF8B6B", color: "#3A1F16" }}
              >
                <Plus size={15} />
                {creating ? "Creating…" : "Create project"}
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
      ) : projects.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No projects yet — create one above.</p>
      ) : (
        <div className="grid gap-4">
          {projects.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              onError={setError}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

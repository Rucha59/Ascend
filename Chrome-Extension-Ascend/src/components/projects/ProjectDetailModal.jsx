import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import ProgressBar from "../common/ProgressBar";
import { getProject, toggleChecklistItem, addChecklistItem, addMilestone } from "../../api/projects";
import { Check, Plus, Flag, Calendar, Loader2 } from "lucide-react";

export default function ProjectDetailModal({ project, isOpen, onClose, onProjectUpdated }) {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState({});
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  useEffect(() => {
    if (project?.id && isOpen) {
      loadDetails();
    }
  }, [project?.id, isOpen]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const data = await getProject(project.id);
      setProjectData(data);
    } catch (err) {
      console.error("Failed to load project details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (milestoneId, itemId) => {
    try {
      const updated = await toggleChecklistItem(project.id, milestoneId, itemId);
      setProjectData(updated);
      onProjectUpdated?.();
    } catch (err) {
      console.error("Failed to toggle item:", err);
    }
  };

  const handleAddItem = async (milestoneId) => {
    const title = newItemTitle[milestoneId]?.trim();
    if (!title) return;

    try {
      const updated = await addChecklistItem(project.id, milestoneId, { title });
      setProjectData(updated);
      setNewItemTitle((prev) => ({ ...prev, [milestoneId]: "" }));
      onProjectUpdated?.();
    } catch (err) {
      console.error("Failed to add checklist item:", err);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestoneName.trim()) return;

    try {
      const updated = await addMilestone(project.id, {
        name: newMilestoneName.trim(),
      });
      setProjectData(updated);
      setNewMilestoneName("");
      setShowAddMilestone(false);
      onProjectUpdated?.();
    } catch (err) {
      console.error("Failed to add milestone:", err);
    }
  };

  const p = projectData || project;
  const milestones = p?.milestones || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={p?.name || "Project Details"}
      maxWidth="max-w-md"
    >
      {loading && !projectData ? (
        <div className="flex items-center justify-center py-8 text-primary">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Project Progress Header */}
          <div className="bg-surface-raised p-3 rounded-md border border-border space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-text-secondary">Overall Completion</span>
              <span className="text-primary font-bold">{p?.progressPercent || 0}%</span>
            </div>
            <ProgressBar pct={p?.progressPercent || 0} height={6} />
            {p?.description && (
              <p className="text-[12px] text-text-muted mt-1 leading-snug">
                {p.description}
              </p>
            )}
          </div>

          {/* Milestones List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[12px] font-bold text-text uppercase tracking-wider">
                Milestones & Checklist
              </h4>
              <button
                onClick={() => setShowAddMilestone(true)}
                className="text-[11px] font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
              >
                <Plus size={12} />
                <span>Add Milestone</span>
              </button>
            </div>

            {/* Inline Add Milestone Form */}
            {showAddMilestone && (
              <form
                onSubmit={handleAddMilestone}
                className="p-2.5 rounded-md border border-primary bg-surface space-y-2"
              >
                <input
                  type="text"
                  value={newMilestoneName}
                  onChange={(e) => setNewMilestoneName(e.target.value)}
                  placeholder="New milestone name..."
                  autoFocus
                  className="w-full bg-surface-raised border border-border text-[12px] rounded p-1.5 outline-none text-text"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMilestone(false)}
                    className="text-[11px] text-text-muted hover:text-text px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-[11px] py-1 px-3"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            {milestones.length === 0 ? (
              <p className="text-[12px] text-text-muted text-center py-4">
                No milestones defined for this project yet.
              </p>
            ) : (
              milestones.map((ms) => {
                const items = ms.checklistItems || [];
                return (
                  <div
                    key={ms.id}
                    className="ascend-card p-3 border border-border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Flag size={13} className="text-primary shrink-0" />
                        <span className="text-[13px] font-bold text-text truncate">
                          {ms.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-text-secondary bg-surface-muted px-1.5 py-0.5 rounded">
                        {ms.completedItems || 0}/{ms.totalItems || 0}
                      </span>
                    </div>

                    {/* Milestone items */}
                    <div className="space-y-1 pl-2 border-l border-border mt-1">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleItem(ms.id, item.id)}
                          className="flex items-center gap-2 py-1 px-1.5 rounded cursor-pointer hover:bg-surface-raised text-xs transition-colors"
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border transition-all ${
                              item.completed
                                ? "bg-primary border-primary text-on-primary"
                                : "border-border-strong bg-surface"
                            }`}
                          >
                            {item.completed && <Check size={10} strokeWidth={3} />}
                          </div>
                          <span
                            className={`flex-1 truncate ${
                              item.completed
                                ? "line-through text-text-muted"
                                : "text-text"
                            }`}
                          >
                            {item.title}
                          </span>
                        </div>
                      ))}

                      {/* Inline add item under milestone */}
                      <div className="flex items-center gap-1 mt-1.5 pt-1">
                        <input
                          type="text"
                          value={newItemTitle[ms.id] || ""}
                          onChange={(e) =>
                            setNewItemTitle((prev) => ({
                              ...prev,
                              [ms.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddItem(ms.id);
                            }
                          }}
                          placeholder="Add checklist item..."
                          className="flex-1 bg-surface-raised border border-border rounded px-2 py-1 text-[11px] text-text outline-none placeholder-text-muted"
                        />
                        <button
                          onClick={() => handleAddItem(ms.id)}
                          disabled={!newItemTitle[ms.id]?.trim()}
                          className="btn-primary text-[10px] py-1 px-2 shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

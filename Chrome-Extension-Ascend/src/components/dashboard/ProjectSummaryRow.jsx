import React from "react";
import { FolderKanban, ChevronRight, Calendar } from "lucide-react";
import ProgressBar from "../common/ProgressBar";

export default function ProjectSummaryRow({ projects = [], onSelectProject }) {
  if (projects.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[13px] font-bold text-text uppercase tracking-wider">
          Active Projects
        </h3>
        <span className="text-[11px] text-text-muted">
          {projects.length} project{projects.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-2">
        {projects.map((proj) => (
          <div
            key={proj.id}
            onClick={() => onSelectProject(proj)}
            className="ascend-card p-3 cursor-pointer hover:border-border-strong active:scale-[0.99] transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded bg-primary-subtle text-primary flex items-center justify-center shrink-0">
                  <FolderKanban size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-text truncate">
                    {proj.name}
                  </p>
                  {proj.deadline && (
                    <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                      <Calendar size={10} />
                      Due {proj.deadline}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-text-muted shrink-0">
                <span className="text-[11px] font-bold text-primary">
                  {proj.progressPercent || 0}%
                </span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2.5">
              <ProgressBar pct={proj.progressPercent || 0} height={5} />
            </div>

            {/* Milestone counter */}
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-text-muted">
              <span>
                {proj.completedMilestones || 0} / {proj.totalMilestones || 0} milestones done
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

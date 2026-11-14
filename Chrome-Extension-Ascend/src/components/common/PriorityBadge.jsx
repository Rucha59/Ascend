import React from "react";

export default function PriorityBadge({ priority = "MEDIUM" }) {
  const p = (priority || "").toUpperCase();

  if (p === "HIGH") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-bold tracking-wider bg-danger-surface text-danger">
        HIGH
      </span>
    );
  }

  if (p === "LOW") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-semibold tracking-wider bg-surface-muted text-text-muted">
        LOW
      </span>
    );
  }

  // MEDIUM / Default
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-bold tracking-wider bg-warning-surface text-warning">
      MED
    </span>
  );
}

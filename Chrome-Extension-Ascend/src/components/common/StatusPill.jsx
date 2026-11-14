import React from "react";

export default function StatusPill({ status = "PENDING" }) {
  const map = {
    COMPLETED: {
      bg: "var(--color-success-surface)",
      fg: "var(--color-success)",
      label: "DONE",
    },
    PENDING: {
      bg: "var(--color-primary-subtle)",
      fg: "var(--color-primary)",
      label: "GO",
    },
    SKIPPED: {
      bg: "var(--color-surface-muted)",
      fg: "var(--color-text-muted)",
      label: "SKIP",
    },
    MISSED: {
      bg: "var(--color-danger-surface)",
      fg: "var(--color-danger)",
      label: "MISS",
    },
  };

  const pill = map[status] || map.PENDING;

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-pill text-[10px] font-bold tracking-wider"
      style={{
        backgroundColor: pill.bg,
        color: pill.fg,
      }}
    >
      {pill.label}
    </span>
  );
}

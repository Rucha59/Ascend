import React from "react";

export default function ProgressBar({ pct = 0, height = 7, showLabel = false }) {
  const clamped = Math.min(100, Math.max(0, Math.round(pct)));

  return (
    <div className="w-full flex items-center gap-2">
      <div
        className="w-full overflow-hidden rounded-pill bg-surface-muted relative"
        style={{ height }}
      >
        <div
          className="h-full rounded-pill bg-primary"
          style={{
            width: `${clamped}%`,
            transition: "width 300ms ease-out",
          }}
        />
      </div>
      {showLabel && (
        <span className="text-[11px] font-semibold text-text-secondary shrink-0">
          {clamped}%
        </span>
      )}
    </div>
  );
}

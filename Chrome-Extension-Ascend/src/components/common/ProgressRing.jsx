import React from "react";

export default function ProgressRing({ pct = 0, size = 96, stroke = 9 }) {
  const clampedPct = Math.min(100, Math.max(0, Math.round(pct)));
  const radius = size / 2 - stroke / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * clampedPct) / 100;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-muted)"
          strokeWidth={stroke}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 350ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[20px] font-bold leading-none text-text">
          {clampedPct}%
        </span>
        <span className="text-[10px] font-semibold tracking-wider text-text-muted mt-0.5">
          DONE
        </span>
      </div>
    </div>
  );
}

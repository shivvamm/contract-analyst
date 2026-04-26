import React from "react";

interface SeverityBadgeProps {
  severity: "high" | "medium" | "low";
}

const styles: Record<string, string> = {
  high: "bg-coral-light text-coral-dark",
  medium: "bg-orange-light text-yellow-dark",
  low: "bg-teal-light text-teal-dark",
};

const labels: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-pill)] text-small font-medium ${styles[severity]}`}
    >
      {labels[severity]}
    </span>
  );
}

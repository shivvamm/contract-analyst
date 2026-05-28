import React from "react";

interface StatusBadgeProps {
  status: "compliant" | "warning" | "non-compliant";
}

const styles: Record<string, string> = {
  compliant: "bg-teal-light text-teal-dark",
  warning: "bg-orange-light text-yellow-dark",
  "non-compliant": "bg-coral-light text-coral-dark",
};

function CheckIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const icons: Record<string, React.ReactNode> = {
  compliant: <CheckIcon />,
  warning: <WarningIcon />,
  "non-compliant": <XIcon />,
};

const labels: Record<string, string> = {
  compliant: "Compliant",
  warning: "Warning",
  "non-compliant": "Non-Compliant",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-pill)] text-small font-medium ${styles[status]}`}
    >
      {icons[status]}
      {labels[status]}
    </span>
  );
}

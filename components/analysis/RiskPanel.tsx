"use client";

import React, { useState } from "react";
import type { Risk } from "@/types";
import { SeverityBadge } from "@/components/common/SeverityBadge";

interface RiskPanelProps {
  risks: Risk[];
}

const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

function RiskCard({ risk }: { risk: Risk }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-surface/70 rounded-[var(--radius-button)] p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-caption text-near-black font-medium">{risk.title}</p>
          <p className="text-small text-slate mt-0.5">{risk.category}</p>
        </div>
        <SeverityBadge severity={risk.severity} />
      </div>

      <p className="text-body text-slate">{risk.description}</p>

      {risk.clause && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-small text-coral-dark hover:underline"
          >
            {expanded ? "Hide clause ↑" : "Show clause ↓"}
          </button>
          {expanded && (
            <blockquote className="border-l-2 border-coral-dark pl-3 text-small text-slate italic">
              {risk.clause}
              {risk.pageNumber && (
                <span className="not-italic text-placeholder ml-1">(p. {risk.pageNumber})</span>
              )}
            </blockquote>
          )}
        </>
      )}
    </div>
  );
}

export function RiskPanel({ risks }: RiskPanelProps) {
  const sorted = [...risks].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  const high = sorted.filter((r) => r.severity === "high").length;
  const medium = sorted.filter((r) => r.severity === "medium").length;
  const low = sorted.filter((r) => r.severity === "low").length;

  return (
    <div className="bg-coral-light ring-miro rounded-[var(--radius-card)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-feature text-coral-dark">Risks</h3>
        <div className="flex items-center gap-2 text-small text-coral-dark">
          {high > 0 && <span>{high} high</span>}
          {medium > 0 && <span>{medium} medium</span>}
          {low > 0 && <span>{low} low</span>}
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-body text-slate">No risks identified.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((risk) => (
            <RiskCard key={risk.id} risk={risk} />
          ))}
        </div>
      )}
    </div>
  );
}

import React from "react";
import type { ComplianceFinding } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";

interface CompliancePanelProps {
  findings: ComplianceFinding[];
}

const severityOrder: Record<string, number> = {
  "non-compliant": 0,
  warning: 1,
  compliant: 2,
};

export function CompliancePanel({ findings }: CompliancePanelProps) {
  const sorted = [...findings].sort(
    (a, b) => severityOrder[a.status] - severityOrder[b.status]
  );

  return (
    <div className="bg-pink-light ring-miro rounded-[var(--radius-card)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-feature" style={{ color: "#9b1a6a" }}>Compliance</h3>
        <span className="text-small text-slate">{findings.length} finding{findings.length !== 1 ? "s" : ""}</span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-body text-slate">No compliance findings.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((finding, i) => (
            <div key={finding.id || `finding-${i}`} className="bg-surface/70 rounded-[var(--radius-button)] p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-caption text-near-black font-medium">{finding.title}</p>
                  <p className="text-small text-slate mt-0.5">{finding.standard}</p>
                </div>
                <StatusBadge status={finding.status} />
              </div>
              <p className="text-body text-slate">{finding.description}</p>
              {finding.clause && (
                <blockquote className="border-l-2 border-pink-300 pl-3 text-small text-slate italic">
                  {finding.clause}
                  {finding.pageNumber && (
                    <span className="not-italic text-placeholder ml-1">(p. {finding.pageNumber})</span>
                  )}
                </blockquote>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

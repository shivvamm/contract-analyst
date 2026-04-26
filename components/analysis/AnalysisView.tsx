import React from "react";
import type { Contract } from "@/types";
import { ProgressBar } from "@/components/analysis/ProgressBar";
import { SummaryPanel } from "@/components/analysis/SummaryPanel";
import { RiskPanel } from "@/components/analysis/RiskPanel";
import { KeyTermsPanel } from "@/components/analysis/KeyTermsPanel";
import { CompliancePanel } from "@/components/analysis/CompliancePanel";

interface AnalysisViewProps {
  contract: Contract;
}

export function AnalysisView({ contract }: AnalysisViewProps) {
  const { analysis } = contract;
  const isProcessing = analysis.status !== "complete" && analysis.status !== "error" && analysis.status !== "idle";

  if (analysis.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-14 h-14 rounded-full bg-coral-light flex items-center justify-center">
          <svg className="w-7 h-7 text-coral-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-feature text-coral-dark">Analysis Failed</p>
          <p className="text-body text-slate mt-1 max-w-md">{analysis.error ?? "An unknown error occurred."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar shown while processing */}
      {isProcessing && (
        <div className="bg-surface ring-miro rounded-[var(--radius-card)] p-5">
          <ProgressBar progress={analysis.progress} status={analysis.status} />
        </div>
      )}

      {/* Summary */}
      {analysis.summary && <SummaryPanel summary={analysis.summary} />}

      {/* Risks */}
      {analysis.risks.length > 0 && <RiskPanel risks={analysis.risks} />}

      {/* Key Terms */}
      {analysis.keyTerms && <KeyTermsPanel keyTerms={analysis.keyTerms} />}

      {/* Compliance */}
      {analysis.compliance.length > 0 && <CompliancePanel findings={analysis.compliance} />}

      {/* Placeholder while analyzing */}
      {isProcessing && !analysis.summary && analysis.risks.length === 0 && !analysis.keyTerms && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface ring-miro rounded-[var(--radius-card)] p-5 animate-pulse">
              <div className="h-4 bg-border rounded w-1/3 mb-3" />
              <div className="space-y-2">
                <div className="h-3 bg-border rounded w-full" />
                <div className="h-3 bg-border rounded w-5/6" />
                <div className="h-3 bg-border rounded w-4/6" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

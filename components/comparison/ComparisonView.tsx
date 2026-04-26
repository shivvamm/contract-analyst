"use client";

import React from "react";
import type { ComparisonResult } from "@/types";
import { useContractStore } from "@/stores/contract-store";
import { SideBySide } from "@/components/comparison/SideBySide";
import { ComparisonMatrix } from "@/components/comparison/ComparisonMatrix";

interface ComparisonViewProps {
  comparison: ComparisonResult;
  onBack: () => void;
}

export function ComparisonView({ comparison, onBack }: ComparisonViewProps) {
  const { contracts } = useContractStore();

  const contractNames = comparison.contractIds.map((id) => {
    const c = contracts.find((x) => x.id === id);
    return c?.fileName ?? id;
  });

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-surface border-b border-border px-6 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-caption text-slate hover:text-near-black transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div>
          <h2 className="text-feature text-near-black">Contract Comparison</h2>
          <p className="text-small text-placeholder mt-0.5">
            {comparison.mode === "side-by-side" ? "Side-by-side" : "Matrix"} &middot;{" "}
            {contractNames.join(" vs ")}
          </p>
        </div>
      </div>

      <div className="p-6">
        {comparison.mode === "side-by-side" && comparison.sideBySide ? (
          <SideBySide
            result={comparison.sideBySide}
            nameA={contractNames[0] ?? "Contract A"}
            nameB={contractNames[1] ?? "Contract B"}
            recommendation={comparison.recommendation}
          />
        ) : comparison.mode === "matrix" && comparison.matrix ? (
          <div className="space-y-6">
            {comparison.recommendation && (
              <div className="bg-teal-light ring-miro rounded-[var(--radius-card)] p-5">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-teal-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="text-feature text-teal-dark">Recommendation</h3>
                </div>
                <p className="text-body text-near-black">{comparison.recommendation}</p>
              </div>
            )}
            <ComparisonMatrix result={comparison.matrix} contractNames={contractNames} />
          </div>
        ) : (
          <p className="text-body text-slate">No comparison data available.</p>
        )}
      </div>
    </div>
  );
}

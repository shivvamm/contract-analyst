"use client";

import React, { useState } from "react";
import type { MatrixResult } from "@/types";

interface ComparisonMatrixProps {
  result: MatrixResult;
  contractNames: string[];
}

const favorabilityStyles: Record<string, string> = {
  good: "bg-teal-light text-teal-dark",
  neutral: "bg-gray-50 text-slate",
  bad: "bg-coral-light text-coral-dark",
};

function CellContent({ value, clauseText, favorability }: { value: string; clauseText: string; favorability: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <td className={`border border-border p-2 align-top min-w-[140px] ${favorabilityStyles[favorability] ?? "bg-gray-50"}`}>
      <p className="text-small">{value}</p>
      {clauseText && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-small underline mt-1 opacity-70 hover:opacity-100"
          >
            {expanded ? "less" : "more"}
          </button>
          {expanded && (
            <p className="text-small italic mt-1 opacity-80">{clauseText}</p>
          )}
        </>
      )}
    </td>
  );
}

export function ComparisonMatrix({ result, contractNames }: ComparisonMatrixProps) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] ring-miro">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr className="bg-gray-50 border-b border-border">
            <th className="px-4 py-3 text-caption text-near-black font-medium min-w-[160px]">
              Dimension
            </th>
            {contractNames.map((name, i) => (
              <th key={i} className="px-4 py-3 text-caption text-near-black font-medium min-w-[140px] truncate max-w-[200px]">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, rowIdx) => (
            <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-surface" : "bg-gray-50/50"}>
              <td className="border border-border px-4 py-2.5">
                <p className="text-small font-medium text-near-black">{row.dimension}</p>
              </td>
              {row.values.map((cell, cellIdx) => (
                <CellContent
                  key={cellIdx}
                  value={cell.value}
                  clauseText={cell.clauseText}
                  favorability={cell.favorability}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-4 p-3 border-t border-border bg-surface">
        <span className="text-small text-placeholder">Legend:</span>
        {(["good", "neutral", "bad"] as const).map((f) => (
          <div key={f} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${favorabilityStyles[f].split(" ")[0]}`} />
            <span className="text-small text-slate capitalize">{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import type { ContractSummary } from "@/types";

interface SummaryPanelProps {
  summary: ContractSummary;
}

export function SummaryPanel({ summary }: SummaryPanelProps) {
  const [layer, setLayer] = useState<1 | 2 | 3>(1);

  return (
    <div className="bg-teal-light ring-miro rounded-[var(--radius-card)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-feature text-teal-dark">Summary</h3>
        <div className="flex items-center gap-1">
          {([
            { l: 1 as const, label: "Brief", title: "One-sentence summary" },
            { l: 2 as const, label: "Key Points", title: "Key bullet points" },
            { l: 3 as const, label: "Detailed", title: "Section-by-section breakdown" },
          ]).map(({ l, label, title }) => (
            <button
              key={l}
              onClick={() => setLayer(l)}
              title={title}
              className={`px-2.5 py-1 rounded-[var(--radius-pill)] text-small transition-colors ${
                layer === l
                  ? "bg-teal-dark text-surface"
                  : "text-teal-dark hover:bg-teal-dark/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {layer === 1 && (
        <p className="text-body text-near-black leading-relaxed">{summary.layer1}</p>
      )}

      {layer === 2 && (
        <ul className="space-y-2">
          {summary.layer2.map((point, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-dark flex-shrink-0" />
              <p className="text-body text-near-black">{point}</p>
            </li>
          ))}
        </ul>
      )}

      {layer === 3 && (
        <div className="space-y-4">
          {summary.layer3.map((section, i) => (
            <div key={i} className="bg-surface/60 rounded-[var(--radius-button)] p-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-caption text-teal-dark font-medium">{section.title}</h4>
                {section.pageNumbers.length > 0 && (
                  <span className="text-small text-slate">
                    p. {section.pageNumbers.join(", ")}
                  </span>
                )}
              </div>
              <p className="text-body text-near-black">{section.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        {layer > 1 && (
          <button
            onClick={() => setLayer((l) => (l - 1) as 1 | 2 | 3)}
            className="text-small text-teal-dark hover:underline"
          >
            ← Less detail
          </button>
        )}
        {layer < 3 && (
          <button
            onClick={() => setLayer((l) => (l + 1) as 1 | 2 | 3)}
            className="text-small text-teal-dark hover:underline ml-auto"
          >
            More detail →
          </button>
        )}
      </div>
    </div>
  );
}

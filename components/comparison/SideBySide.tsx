import React from "react";
import type { SideBySideResult } from "@/types";
import { SeverityBadge } from "@/components/common/SeverityBadge";

interface SideBySideProps {
  result: SideBySideResult;
  nameA: string;
  nameB: string;
  recommendation: string;
}

function DiffSection({ title, items, name }: { title: string; items: { term: string; valueA: string; valueB: string; explanation: string }[]; name: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-caption text-near-black font-medium mb-2">Better in {name}</h4>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="bg-surface ring-miro rounded-[var(--radius-button)] p-3 space-y-1">
            <p className="text-small font-medium text-near-black">{item.term}</p>
            <div className="grid grid-cols-2 gap-2 text-small">
              <div>
                <span className="text-placeholder">A: </span>
                <span className="text-near-black">{item.valueA}</span>
              </div>
              <div>
                <span className="text-placeholder">B: </span>
                <span className="text-near-black">{item.valueB}</span>
              </div>
            </div>
            <p className="text-small text-slate">{item.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SideBySide({ result, nameA, nameB, recommendation }: SideBySideProps) {
  return (
    <div className="space-y-6">
      {/* Recommendation */}
      <div className="bg-teal-light ring-miro rounded-[var(--radius-card)] p-5">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-teal-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-feature text-teal-dark">Recommendation</h3>
        </div>
        <p className="text-body text-near-black">{recommendation}</p>
      </div>

      {/* Diff sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DiffSection title="Better in A" items={result.betterInA} name={nameA} />
        <DiffSection title="Better in B" items={result.betterInB} name={nameB} />
      </div>

      {/* Missing clauses */}
      {(result.missingInA.length > 0 || result.missingInB.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.missingInA.length > 0 && (
            <div className="bg-orange-light ring-miro rounded-[var(--radius-card)] p-4">
              <h4 className="text-caption text-yellow-dark font-medium mb-2">Missing in {nameA}</h4>
              <ul className="space-y-1">
                {result.missingInA.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-small text-near-black">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-yellow-dark flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.missingInB.length > 0 && (
            <div className="bg-orange-light ring-miro rounded-[var(--radius-card)] p-4">
              <h4 className="text-caption text-yellow-dark font-medium mb-2">Missing in {nameB}</h4>
              <ul className="space-y-1">
                {result.missingInB.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-small text-near-black">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-yellow-dark flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Risk differences */}
      {result.riskDifferences.length > 0 && (
        <div className="bg-coral-light ring-miro rounded-[var(--radius-card)] p-5 space-y-3">
          <h3 className="text-feature text-coral-dark">Risk Differences</h3>
          <div className="space-y-2">
            {result.riskDifferences.map((diff, i) => (
              <div key={i} className="bg-surface/70 rounded-[var(--radius-button)] p-3 space-y-2">
                <p className="text-caption font-medium text-near-black">{diff.title}</p>
                <div className="flex items-center gap-4 text-small">
                  <div className="flex items-center gap-1.5">
                    <span className="text-placeholder">{nameA}:</span>
                    {diff.severityA !== "none" ? (
                      <SeverityBadge severity={diff.severityA} />
                    ) : (
                      <span className="text-placeholder">—</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-placeholder">{nameB}:</span>
                    {diff.severityB !== "none" ? (
                      <SeverityBadge severity={diff.severityB} />
                    ) : (
                      <span className="text-placeholder">—</span>
                    )}
                  </div>
                </div>
                <p className="text-small text-slate">{diff.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

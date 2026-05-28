"use client";

import React from "react";
import type { ContractAnalysis } from "@/types";

interface OverviewStripProps {
  analysis: ContractAnalysis;
  pageCount: number;
}

function computeHealthScore(analysis: ContractAnalysis): {
  score: number;
  label: string;
  color: string;
  bgColor: string;
} {
  const high = analysis.risks.filter((r) => r.severity === "high").length;
  const medium = analysis.risks.filter((r) => r.severity === "medium").length;
  const nonCompliant = analysis.compliance.filter((f) => f.status === "non-compliant").length;

  let score = 100;
  score -= high * 20;
  score -= medium * 8;
  score -= nonCompliant * 15;
  score = Math.max(0, Math.min(100, score));

  if (score >= 80) return { score, label: "Low Risk", color: "text-success", bgColor: "bg-teal-light" };
  if (score >= 50) return { score, label: "Moderate Risk", color: "text-yellow-dark", bgColor: "bg-orange-light" };
  return { score, label: "High Risk", color: "text-coral-dark", bgColor: "bg-coral-light" };
}

function StatCard({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-small text-placeholder uppercase tracking-wide">{label}</span>
      <span className={`text-card-title tabular-nums ${accent ?? "text-near-black"}`}>{value}</span>
      {sublabel && <span className="text-small text-slate truncate">{sublabel}</span>}
    </div>
  );
}

export function OverviewStrip({ analysis, pageCount }: OverviewStripProps) {
  const health = computeHealthScore(analysis);

  const high = analysis.risks.filter((r) => r.severity === "high").length;
  const medium = analysis.risks.filter((r) => r.severity === "medium").length;
  const low = analysis.risks.filter((r) => r.severity === "low").length;

  const compliant = analysis.compliance.filter((f) => f.status === "compliant").length;
  const warnings = analysis.compliance.filter((f) => f.status === "warning").length;
  const nonCompliant = analysis.compliance.filter((f) => f.status === "non-compliant").length;

  const parties = analysis.keyTerms?.parties ?? [];

  return (
    <div className="bg-surface ring-miro rounded-[var(--radius-card)] p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        {/* Health score */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className={`w-14 h-14 rounded-[var(--radius-card)] ${health.bgColor} flex items-center justify-center flex-shrink-0`}>
            <span className={`text-card-title font-semibold tabular-nums ${health.color}`}>
              {health.score}
            </span>
          </div>
          <div>
            <p className={`text-feature ${health.color}`}>{health.label}</p>
            <p className="text-small text-placeholder">Contract Health</p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-12 bg-border flex-shrink-0" />

        {/* Stats grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 min-w-0">
          <StatCard
            label="Risks"
            value={analysis.risks.length}
            sublabel={
              high > 0
                ? `${high} high, ${medium} med, ${low} low`
                : medium > 0
                  ? `${medium} medium, ${low} low`
                  : `${low} low`
            }
            accent={high > 0 ? "text-coral-dark" : undefined}
          />

          <StatCard
            label="Compliance"
            value={`${compliant}/${analysis.compliance.length}`}
            sublabel={
              nonCompliant > 0
                ? `${nonCompliant} non-compliant`
                : warnings > 0
                  ? `${warnings} warning${warnings > 1 ? "s" : ""}`
                  : "All clear"
            }
            accent={nonCompliant > 0 ? "text-coral-dark" : compliant === analysis.compliance.length ? "text-success" : undefined}
          />

          <StatCard
            label="Parties"
            value={parties.length}
            sublabel={parties.slice(0, 2).map((p) => p.name).join(", ") || "—"}
          />

          <StatCard
            label="Pages"
            value={pageCount}
            sublabel={
              analysis.keyTerms?.jurisdiction
                ? analysis.keyTerms.jurisdiction
                : analysis.keyTerms?.governingLaw
                  ? analysis.keyTerms.governingLaw
                  : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}

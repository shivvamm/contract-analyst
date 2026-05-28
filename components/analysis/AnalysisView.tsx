"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Contract } from "@/types";
import { ProgressBar } from "@/components/analysis/ProgressBar";
import { OverviewStrip } from "@/components/analysis/OverviewStrip";
import { SummaryPanel } from "@/components/analysis/SummaryPanel";
import { RiskPanel } from "@/components/analysis/RiskPanel";
import { KeyTermsPanel } from "@/components/analysis/KeyTermsPanel";
import { CompliancePanel } from "@/components/analysis/CompliancePanel";

interface AnalysisViewProps {
  contract: Contract;
  onBack?: () => void;
}

type SectionId = "summary" | "risks" | "terms" | "compliance";

const sections: { id: SectionId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "risks", label: "Risks" },
  { id: "terms", label: "Key Terms" },
  { id: "compliance", label: "Compliance" },
];

function SkeletonCard() {
  return (
    <div className="bg-surface ring-miro rounded-[var(--radius-card)] p-5 animate-pulse">
      <div className="h-4 bg-border rounded w-1/3 mb-3" />
      <div className="space-y-2">
        <div className="h-3 bg-border rounded w-full" />
        <div className="h-3 bg-border rounded w-5/6" />
        <div className="h-3 bg-border rounded w-4/6" />
      </div>
    </div>
  );
}

export function AnalysisView({ contract, onBack }: AnalysisViewProps) {
  const { analysis } = contract;
  const isProcessing =
    analysis.status !== "complete" &&
    analysis.status !== "error" &&
    analysis.status !== "idle";
  const isComplete = analysis.status === "complete";

  const [activeNav, setActiveNav] = useState<SectionId | null>(null);
  const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({
    summary: null,
    risks: null,
    terms: null,
    compliance: null,
  });

  // Intersection observer for active nav tracking
  useEffect(() => {
    if (!isComplete) return;
    const refs = sectionRefs.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.getAttribute("data-section") as SectionId);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    for (const id of Object.keys(refs) as SectionId[]) {
      const el = refs[id];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [isComplete]);

  function scrollTo(id: SectionId) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (analysis.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-14 h-14 rounded-full bg-coral-light flex items-center justify-center">
          <svg
            className="w-7 h-7 text-coral-dark"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-feature text-coral-dark">Analysis Failed</p>
          <p className="text-body text-slate mt-1 max-w-md">
            {analysis.error ?? "An unknown error occurred."}
          </p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="bg-blue-450 text-surface text-button px-6 py-2.5 rounded-[var(--radius-button)] hover:bg-blue-pressed transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress bar while processing */}
      {isProcessing && (
        <div className="bg-surface ring-miro rounded-[var(--radius-card)] p-5">
          <ProgressBar
            progress={analysis.progress}
            status={analysis.status}
            statusMessage={analysis.statusMessage}
          />
        </div>
      )}

      {/* Overview strip — visible once we have some data */}
      {isComplete && (
        <OverviewStrip analysis={analysis} pageCount={contract.pageCount} />
      )}

      {/* Section jump nav — desktop only, visible when complete */}
      {isComplete && (
        <nav className="hidden md:flex items-center gap-1 bg-surface ring-miro rounded-[var(--radius-button)] p-1 w-fit">
          {sections.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`px-3.5 py-1.5 rounded-[var(--radius-button)] text-small transition-colors ${
                activeNav === id
                  ? "bg-blue-450 text-surface"
                  : "text-slate hover:text-near-black hover:bg-bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      {/* Dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Summary — full width */}
        <div
          className="lg:col-span-2"
          ref={(el) => { sectionRefs.current.summary = el; }}
          data-section="summary"
        >
          {analysis.summary ? (
            <SummaryPanel summary={analysis.summary} />
          ) : (
            isProcessing && <SkeletonCard />
          )}
        </div>

        {/* Risks — left column */}
        <div
          ref={(el) => { sectionRefs.current.risks = el; }}
          data-section="risks"
        >
          {analysis.risks.length > 0 || isComplete ? (
            <RiskPanel risks={analysis.risks} />
          ) : (
            isProcessing && <SkeletonCard />
          )}
        </div>

        {/* Key Terms — right column */}
        <div
          ref={(el) => { sectionRefs.current.terms = el; }}
          data-section="terms"
        >
          {analysis.keyTerms ? (
            <KeyTermsPanel keyTerms={analysis.keyTerms} />
          ) : (
            isProcessing && <SkeletonCard />
          )}
        </div>

        {/* Compliance — full width */}
        <div
          className="lg:col-span-2"
          ref={(el) => { sectionRefs.current.compliance = el; }}
          data-section="compliance"
        >
          {analysis.compliance.length > 0 || isComplete ? (
            <CompliancePanel findings={analysis.compliance} />
          ) : (
            isProcessing && <SkeletonCard />
          )}
        </div>
      </div>
    </div>
  );
}

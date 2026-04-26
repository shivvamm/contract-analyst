import React from "react";
import type { AnalysisStatus } from "@/types";

interface ProgressBarProps {
  progress: number;
  status: AnalysisStatus;
}

const statusLabels: Record<AnalysisStatus, string> = {
  idle: "Waiting…",
  parsing: "Parsing document…",
  extracting: "Extracting key terms…",
  "analyzing-risks": "Analyzing risks…",
  "checking-compliance": "Checking compliance…",
  summarizing: "Generating summary…",
  complete: "Analysis complete",
  error: "Error",
};

const stages: AnalysisStatus[] = [
  "parsing",
  "extracting",
  "analyzing-risks",
  "checking-compliance",
  "summarizing",
  "complete",
];

function getStageIndex(status: AnalysisStatus): number {
  return stages.indexOf(status);
}

export function ProgressBar({ progress, status }: ProgressBarProps) {
  const isError = status === "error";
  const isComplete = status === "complete";
  const currentIndex = getStageIndex(status);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <span className={`text-caption font-medium ${isError ? "text-coral-dark" : isComplete ? "text-success" : "text-blue-450"}`}>
          {statusLabels[status]}
        </span>
        <span className="text-small text-placeholder">{progress}%</span>
      </div>

      {/* Progress track */}
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isError ? "bg-coral-dark" : isComplete ? "bg-success" : "bg-blue-450"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage indicators */}
      <div className="flex items-center justify-between mt-1">
        {stages.map((stage, i) => {
          const done = currentIndex > i || isComplete;
          const active = currentIndex === i && !isComplete && !isError;
          return (
            <div key={stage} className="flex flex-col items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  done
                    ? "bg-success"
                    : active
                    ? "bg-blue-450"
                    : "bg-border"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

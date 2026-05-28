"use client";

import React, { useState, useEffect, useRef } from "react";
import type { AnalysisStatus } from "@/types";

interface ProgressBarProps {
  progress: number;
  status: AnalysisStatus;
  statusMessage?: string | null;
}

interface Stage {
  key: AnalysisStatus;
  label: string;
  estimateSec: number;
}

const stages: Stage[] = [
  { key: "parsing", label: "Parsing document", estimateSec: 3 },
  { key: "extracting", label: "Extracting key terms", estimateSec: 15 },
  { key: "analyzing-risks", label: "Analyzing risks", estimateSec: 20 },
  { key: "checking-compliance", label: "Checking compliance", estimateSec: 20 },
  { key: "summarizing", label: "Generating summary", estimateSec: 20 },
];

const totalEstimateSec = stages.reduce((s, st) => s + st.estimateSec, 0);

function getStageIndex(status: AnalysisStatus): number {
  return stages.findIndex((s) => s.key === status);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function ProgressBar({ progress, status, statusMessage }: ProgressBarProps) {
  const isError = status === "error";
  const isComplete = status === "complete";
  const currentIndex = getStageIndex(status);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const stageStartRef = useRef(Date.now());
  const [stageElapsed, setStageElapsed] = useState(0);

  useEffect(() => {
    startRef.current = Date.now();
  }, []);

  useEffect(() => {
    stageStartRef.current = Date.now();
    setStageElapsed(0);
  }, [status]);

  useEffect(() => {
    if (isComplete || isError) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      setStageElapsed(Math.floor((Date.now() - stageStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isComplete, isError]);

  const currentStage = currentIndex >= 0 ? stages[currentIndex] : null;
  const remainingEstimate = Math.max(
    0,
    stages.slice(currentIndex >= 0 ? currentIndex : 0).reduce((s, st) => s + st.estimateSec, 0) - stageElapsed
  );

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isComplete && !isError && (
            <div className="w-4 h-4 border-2 border-blue-450 border-t-transparent rounded-full animate-spin" />
          )}
          {isComplete && (
            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isError && (
            <svg className="w-4 h-4 text-coral-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className={`text-caption font-medium ${isError ? "text-coral-dark" : isComplete ? "text-success" : "text-near-black"}`}>
            {isComplete ? "Analysis complete" : isError ? "Analysis failed" : currentStage?.label ?? "Starting…"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-small text-placeholder">
          <span>{formatTime(elapsed)} elapsed</span>
          {!isComplete && !isError && (
            <span>~{formatTime(remainingEstimate)} remaining</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={currentStage?.label ?? "Analysis progress"}
        className="h-2 bg-border rounded-full overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isError ? "bg-coral-dark" : isComplete ? "bg-success" : "bg-blue-450"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage steps */}
      <div className="space-y-0">
        {stages.map((stage, i) => {
          const done = currentIndex > i || isComplete;
          const active = currentIndex === i && !isComplete && !isError;
          const pending = !done && !active;

          return (
            <div key={stage.key} className="flex items-center gap-3 py-1.5">
              {/* Icon */}
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {done && (
                  <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                    <svg className="w-3 h-3 text-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {active && (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-450 border-t-transparent animate-spin" />
                )}
                {pending && (
                  <div className="w-5 h-5 rounded-full border-2 border-border" />
                )}
              </div>

              {/* Label */}
              <span className={`text-small flex-1 ${
                done ? "text-success" : active ? "text-near-black font-medium" : "text-placeholder"
              }`}>
                {stage.label}
              </span>

              {/* Time */}
              <span className="text-small text-placeholder tabular-nums">
                {done && (
                  <svg className="w-3.5 h-3.5 text-success inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {active && `${formatTime(stageElapsed)} / ~${formatTime(stage.estimateSec)}`}
                {pending && `~${formatTime(stage.estimateSec)}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Retry / slow stage note */}
      {!isComplete && !isError && statusMessage && (
        <p className="text-small text-yellow-dark italic">
          {statusMessage}
        </p>
      )}
      {!isComplete && !isError && !statusMessage && stageElapsed > 30 && (
        <p className="text-small text-placeholder italic">
          This step is taking longer than usual…
        </p>
      )}
    </div>
  );
}

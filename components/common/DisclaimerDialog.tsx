"use client";

import React from "react";
import { useContractStore } from "@/stores/contract-store";

export function DisclaimerDialog() {
  const { settings, updateSettings } = useContractStore();

  if (settings.disclaimerAcknowledged) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-near-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-[var(--radius-container)] ring-miro p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-orange-light flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-card-title text-near-black">Legal Disclaimer</h2>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-body text-slate">
            This tool uses AI to analyze contracts and is provided for informational purposes only.
          </p>
          <p className="text-body text-slate">
            <strong className="text-near-black">It is not a substitute for professional legal advice.</strong> The analysis may contain errors, omissions, or inaccuracies.
          </p>
          <p className="text-body text-slate">
            Always consult a qualified attorney before making any legal decisions based on this analysis.
          </p>
        </div>

        <button
          onClick={() => updateSettings({ disclaimerAcknowledged: true })}
          className="w-full bg-blue-450 text-surface text-button py-3 px-6 rounded-[var(--radius-button)] hover:bg-blue-pressed transition-colors"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}

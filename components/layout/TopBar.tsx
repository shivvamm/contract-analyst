"use client";

import React from "react";
import type { Contract } from "@/types";
import { ExportButtons } from "@/components/common/ExportButtons";
import { useContractStore } from "@/stores/contract-store";

interface TopBarProps {
  contract: Contract;
  onCompare?: () => void;
  onToggleChat?: () => void;
  onBack?: () => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TopBar({ contract, onCompare, onToggleChat, onBack }: TopBarProps) {
  const { settings, updateSettings } = useContractStore();
  const toggleDark = () => updateSettings({ darkMode: !settings.darkMode });

  return (
    <header className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-2 sm:py-3 bg-surface border-b border-border flex-shrink-0">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1 sm:gap-1.5 text-caption text-slate hover:text-near-black transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Back</span>
        </button>
      )}

      <div className="flex-1 min-w-0">
        <h2 className="text-feature text-near-black truncate max-w-[150px] sm:max-w-xs md:max-w-none">{contract.fileName}</h2>
        <div className="hidden sm:flex items-center gap-3 text-small text-placeholder mt-0.5">
          {contract.pageCount > 0 && <span>{contract.pageCount} pages</span>}
          <span>{formatDate(contract.uploadedAt)}</span>
          <span className="capitalize">{contract.fileType}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 flex-wrap justify-end">
        <div className="hidden sm:block">
          <ExportButtons contractId={contract.id} />
        </div>

        <button
          onClick={toggleDark}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-[var(--radius-button)] border border-border text-caption text-slate hover:border-blue-450 hover:text-blue-450 transition-colors"
          aria-label={settings.darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {settings.darkMode ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {onCompare && (
          <button
            onClick={onCompare}
            className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 rounded-[var(--radius-button)] border border-border text-caption text-slate hover:border-blue-450 hover:text-blue-450 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <span className="hidden sm:inline">Compare</span>
          </button>
        )}

        {onToggleChat && (
          <button
            onClick={onToggleChat}
            className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 rounded-[var(--radius-button)] bg-blue-450 text-surface text-caption hover:bg-blue-pressed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="hidden sm:inline">Chat</span>
          </button>
        )}
      </div>
    </header>
  );
}

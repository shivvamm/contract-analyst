import React from "react";
import type { Contract } from "@/types";
import { ExportButtons } from "@/components/common/ExportButtons";

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
  return (
    <header className="flex items-center gap-4 px-6 py-3 bg-surface border-b border-border flex-shrink-0">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-caption text-slate hover:text-near-black transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      <div className="flex-1 min-w-0">
        <h2 className="text-feature text-near-black truncate">{contract.fileName}</h2>
        <div className="flex items-center gap-3 text-small text-placeholder mt-0.5">
          {contract.pageCount > 0 && <span>{contract.pageCount} pages</span>}
          <span>{formatDate(contract.uploadedAt)}</span>
          <span className="capitalize">{contract.fileType}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <ExportButtons contractId={contract.id} />

        {onCompare && (
          <button
            onClick={onCompare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-button)] border border-border text-caption text-slate hover:border-blue-450 hover:text-blue-450 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Compare
          </button>
        )}

        {onToggleChat && (
          <button
            onClick={onToggleChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-button)] bg-blue-450 text-surface text-caption hover:bg-blue-pressed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Chat
          </button>
        )}
      </div>
    </header>
  );
}

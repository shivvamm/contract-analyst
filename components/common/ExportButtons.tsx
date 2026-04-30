"use client";

import React, { useState } from "react";
import { useContractStore } from "@/stores/contract-store";

interface ExportButtonsProps {
  contractId: string;
}

type ExportFormat = "pdf" | "excel" | "csv";

export function ExportButtons({ contractId }: ExportButtonsProps) {
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const { contracts } = useContractStore();

  async function handleExport(format: ExportFormat) {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract || contract.analysis.status !== "complete") return;

    setLoading(format);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: format === "excel" ? "xlsx" : format,
          fileName: contract.fileName,
          analysis: contract.analysis,
          pageCount: contract.pageCount,
        }),
      });
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = format === "excel" ? "xlsx" : format;
      a.download = `${contract.fileName}-analysis.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setLoading(null);
    }
  }

  const formats: { key: ExportFormat; label: string }[] = [
    { key: "pdf", label: "PDF" },
    { key: "excel", label: "Excel" },
    { key: "csv", label: "CSV" },
  ];

  return (
    <div className="flex items-center gap-2">
      {formats.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => handleExport(key)}
          disabled={loading !== null}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-button)] border border-border text-caption text-slate hover:bg-gray-50 hover:border-blue-450 hover:text-blue-450 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === key ? (
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          )}
          {label}
        </button>
      ))}
    </div>
  );
}

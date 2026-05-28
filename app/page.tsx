"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useContractStore } from "@/stores/contract-store";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useComparison } from "@/hooks/useComparison";

// Common
import { DisclaimerDialog } from "@/components/common/DisclaimerDialog";

// Landing
import { HeroSection } from "@/components/landing/HeroSection";
import { DropZone } from "@/components/landing/DropZone";
import { FileCard } from "@/components/landing/FileCard";
import { TextPasteTab } from "@/components/landing/TextPasteTab";
import { ApiKeyInput } from "@/components/landing/ApiKeyInput";

// Analysis
import { AnalysisView } from "@/components/analysis/AnalysisView";

// Chat
import { ChatSidebar } from "@/components/chat/ChatSidebar";

// Layout
import { ContractSidebar } from "@/components/layout/ContractSidebar";
import { TopBar } from "@/components/layout/TopBar";

// Comparison
import { ComparisonView } from "@/components/comparison/ComparisonView";

type ViewState = "landing" | "analysis" | "comparison";
type LandingTab = "upload" | "paste";

interface UploadItem {
  file: File;
  status: "queued" | "uploading" | "analyzing" | "complete" | "error";
  progress: number;
}

export default function Home() {
  const [view, setView] = useState<ViewState>("landing");
  const [landingTab, setLandingTab] = useState<LandingTab>("upload");
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [activeComparisonId, setActiveComparisonId] = useState<string | null>(null);

  const { contracts, activeContractId, setActiveContract, comparisons, settings, updateSettings } = useContractStore();
  const { analyzeFile, analyzeText } = useAnalysis();
  const { compare, isComparing } = useComparison();

  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  const activeContract = contracts.find((c) => c.id === activeContractId) ?? null;
  const activeComparison = comparisons.find((c) => c.id === activeComparisonId) ?? null;

  useEffect(() => {
    function onQuota(e: Event) {
      setStorageWarning((e as CustomEvent).detail);
      setTimeout(() => setStorageWarning(null), 8000);
    }
    window.addEventListener("storage-quota-exceeded", onQuota);
    return () => window.removeEventListener("storage-quota-exceeded", onQuota);
  }, []);

  // Auto-navigate to analysis view when persisted contracts exist on mount
  useEffect(() => {
    if (contracts.length > 0 && view === "landing") {
      setView("analysis");
      if (!activeContractId) {
        setActiveContract(contracts[0].id);
      }
    }
    // Only run on hydration, not on every contracts change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contracts.length > 0]);

  // Handle files dropped/selected
  const handleFiles = useCallback(
    async (files: File[]) => {
      const items: UploadItem[] = files.map((file) => ({
        file,
        status: "queued" as const,
        progress: 0,
      }));
      setUploadQueue((q) => [...q, ...items]);
      setView("analysis");

      for (const item of items) {
        setUploadQueue((q) =>
          q.map((qi) =>
            qi.file === item.file ? { ...qi, status: "analyzing", progress: 10 } : qi
          )
        );
        try {
          await analyzeFile(item.file);
          setUploadQueue((q) =>
            q.map((qi) =>
              qi.file === item.file ? { ...qi, status: "complete", progress: 100 } : qi
            )
          );
        } catch {
          setUploadQueue((q) =>
            q.map((qi) =>
              qi.file === item.file ? { ...qi, status: "error", progress: 0 } : qi
            )
          );
        }
      }
    },
    [analyzeFile]
  );

  // Handle text paste submit
  const handleTextSubmit = useCallback(
    async (text: string) => {
      setView("analysis");
      try {
        await analyzeText(text);
      } catch {
        // error handled in store
      }
    },
    [analyzeText]
  );

  // Toggle compare selection
  const handleToggleCompareSelect = useCallback((id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }, []);

  // Run comparison
  const handleRunCompare = useCallback(async () => {
    if (selectedForCompare.length < 2) return;
    const mode = selectedForCompare.length === 2 ? "side-by-side" : "matrix";
    const id = await compare(selectedForCompare, mode);
    if (id) {
      setActiveComparisonId(id);
      setView("comparison");
      setIsCompareMode(false);
      setSelectedForCompare([]);
    }
  }, [selectedForCompare, compare]);

  // Back from comparison
  const handleBackFromComparison = useCallback(() => {
    setView("analysis");
    setActiveComparisonId(null);
  }, []);

  // Switch comparison mode
  const handleSwitchComparisonMode = useCallback(
    async (mode: "side-by-side" | "matrix") => {
      if (!activeComparison) return;
      const id = await compare(activeComparison.contractIds, mode);
      if (id) setActiveComparisonId(id);
    },
    [activeComparison, compare]
  );

  // Switch to analysis view when clicking a contract
  const handleContractSelect = useCallback(
    (id: string) => {
      setActiveContract(id);
      setView("analysis");
    },
    [setActiveContract]
  );

  // ——— LANDING VIEW ———
  if (view === "landing") {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <DisclaimerDialog />

        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-button)] border border-border text-slate hover:border-blue-450 hover:text-blue-450 transition-colors bg-surface"
            aria-label={settings.darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {settings.darkMode ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <div className="w-full max-w-2xl space-y-8">
            {contracts.length > 0 && (
              <button
                onClick={() => {
                  if (!activeContractId) setActiveContract(contracts[0].id);
                  setView("analysis");
                }}
                className="mx-auto flex items-center gap-2 px-4 py-2.5 bg-blue-450/10 border border-blue-450/30 rounded-[var(--radius-card)] text-caption text-blue-450 hover:bg-blue-450/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View {contracts.length} previous {contracts.length === 1 ? "analysis" : "analyses"}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            <HeroSection />

            {/* Tab switcher */}
            <div className="flex rounded-[var(--radius-button)] bg-bg-muted p-1 w-fit mx-auto">
              <button
                onClick={() => setLandingTab("upload")}
                className={`px-5 py-2 rounded-[var(--radius-button)] text-button transition-colors ${
                  landingTab === "upload"
                    ? "bg-surface ring-miro text-near-black shadow-sm"
                    : "text-slate hover:text-near-black"
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setLandingTab("paste")}
                className={`px-5 py-2 rounded-[var(--radius-button)] text-button transition-colors ${
                  landingTab === "paste"
                    ? "bg-surface ring-miro text-near-black shadow-sm"
                    : "text-slate hover:text-near-black"
                }`}
              >
                Paste Text
              </button>
            </div>

            {/* Tab content */}
            {landingTab === "upload" ? (
              <div className="space-y-4">
                <DropZone onFiles={handleFiles} />

                {/* Upload queue */}
                {uploadQueue.length > 0 && (
                  <div className="space-y-2">
                    {uploadQueue.map((item, i) => (
                      <FileCard
                        key={i}
                        fileName={item.file.name}
                        fileType={(item.file.type || item.file.name.split(".").pop()) ?? ""}
                        status={item.status}
                        progress={item.progress}
                        onRemove={() =>
                          setUploadQueue((q) => q.filter((_, qi) => qi !== i))
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <TextPasteTab onSubmit={handleTextSubmit} />
            )}

            {/* API key / settings */}
            <ApiKeyInput />

            {/* Disclaimer footer */}
            <p className="text-small text-placeholder text-center max-w-md mx-auto">
              This tool provides AI-generated analysis for informational purposes only.
              It is not legal advice. Always consult a qualified attorney.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ——— COMPARISON VIEW ———
  if (view === "comparison" && activeComparison) {
    return (
      <div className="min-h-screen bg-bg">
        <DisclaimerDialog />
        <ComparisonView
          comparison={activeComparison}
          onBack={handleBackFromComparison}
          onSwitchMode={handleSwitchComparisonMode}
          isSwitching={isComparing}
        />
      </div>
    );
  }

  // ——— ANALYSIS VIEW ———
  return (
    <div className="h-screen bg-bg flex flex-col overflow-hidden">
      <DisclaimerDialog />

      {storageWarning && (
        <div className="bg-orange-light border-b border-yellow-dark/30 px-4 py-2 flex items-center justify-between">
          <p className="text-caption text-yellow-dark">{storageWarning}</p>
          <button onClick={() => setStorageWarning(null)} className="text-yellow-dark/60 hover:text-yellow-dark ml-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {activeContract && (
        <TopBar
          contract={activeContract}
          onBack={() => setView("landing")}
          onCompare={() => {
            setIsCompareMode(true);
            setSelectedForCompare([activeContractId ?? ""]);
          }}
          onToggleChat={() => setIsChatOpen((v) => !v)}
        />
      )}

      <div className="flex flex-1 min-h-0">
        {/* Left sidebar — only when > 1 contract */}
        {contracts.length > 1 && (
          <ContractSidebar
            selectedForCompare={selectedForCompare}
            onToggleCompareSelect={handleToggleCompareSelect}
            isCompareMode={isCompareMode}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-4 md:p-6">
          {/* Compare mode toolbar */}
          {isCompareMode && (
            <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3 bg-blue-450/10 border border-blue-450/30 rounded-[var(--radius-card)] px-3 py-2 sm:px-4 sm:py-3">
              <svg className="w-5 h-5 text-blue-450 flex-shrink-0 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <p className="text-caption text-blue-450 flex-1 min-w-0">
                Select {selectedForCompare.length < 2 ? `${2 - selectedForCompare.length} more contract` : "contracts"} to compare
                {selectedForCompare.length >= 2 && " — ready!"}
              </p>
              <div className="flex items-center gap-2">
                {selectedForCompare.length >= 2 && (
                  <button
                    onClick={() => void handleRunCompare()}
                    disabled={isComparing}
                    className="px-3 py-1.5 sm:px-4 bg-blue-450 text-surface text-caption rounded-[var(--radius-button)] hover:bg-blue-pressed transition-colors disabled:opacity-50"
                  >
                    {isComparing ? "Comparing…" : "Compare"}
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsCompareMode(false);
                    setSelectedForCompare([]);
                  }}
                  className="text-caption text-slate hover:text-near-black"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {activeContract ? (
            <AnalysisView contract={activeContract} onBack={() => setView("landing")} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <p className="text-body text-slate">No contract selected.</p>
              <button
                onClick={() => setView("landing")}
                className="bg-blue-450 text-surface text-button px-6 py-2.5 rounded-[var(--radius-button)] hover:bg-blue-pressed transition-colors"
              >
                Upload a Contract
              </button>
            </div>
          )}
        </main>

        {/* Chat sidebar */}
        {activeContractId && (
          <ChatSidebar
            contractId={activeContractId}
            isOpen={isChatOpen}
            onToggle={() => setIsChatOpen((v) => !v)}
          />
        )}
      </div>
    </div>
  );
}

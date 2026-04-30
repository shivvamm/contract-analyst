"use client";

import React, { useState, useCallback } from "react";
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

  const { contracts, activeContractId, setActiveContract, comparisons } = useContractStore();
  const { analyzeFile, analyzeText } = useAnalysis();
  const { compare, isComparing } = useComparison();

  const activeContract = contracts.find((c) => c.id === activeContractId) ?? null;
  const activeComparison = comparisons.find((c) => c.id === activeComparisonId) ?? null;

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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DisclaimerDialog />

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <div className="w-full max-w-2xl space-y-8">
            <HeroSection />

            {/* Tab switcher */}
            <div className="flex rounded-[var(--radius-button)] bg-gray-100 p-1 w-fit mx-auto">
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
      <div className="min-h-screen bg-gray-50">
        <DisclaimerDialog />
        <ComparisonView comparison={activeComparison} onBack={handleBackFromComparison} />
      </div>
    );
  }

  // ——— ANALYSIS VIEW ———
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <DisclaimerDialog />

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
        <main className="flex-1 min-w-0 overflow-y-auto p-6">
          {/* Compare mode toolbar */}
          {isCompareMode && (
            <div className="mb-4 flex items-center gap-3 bg-blue-450/10 border border-blue-450/30 rounded-[var(--radius-card)] px-4 py-3">
              <svg className="w-5 h-5 text-blue-450 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <p className="text-caption text-blue-450 flex-1">
                Select {selectedForCompare.length < 2 ? `${2 - selectedForCompare.length} more contract` : "contracts"} to compare
                {selectedForCompare.length >= 2 && " — ready!"}
              </p>
              <div className="flex items-center gap-2">
                {selectedForCompare.length >= 2 && (
                  <button
                    onClick={() => void handleRunCompare()}
                    disabled={isComparing}
                    className="px-4 py-1.5 bg-blue-450 text-surface text-caption rounded-[var(--radius-button)] hover:bg-blue-pressed transition-colors disabled:opacity-50"
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
            <AnalysisView contract={activeContract} />
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

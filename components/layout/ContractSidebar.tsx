"use client";

import React from "react";
import { useContractStore } from "@/stores/contract-store";
import type { Contract } from "@/types";

interface ContractSidebarProps {
  selectedForCompare: string[];
  onToggleCompareSelect: (id: string) => void;
  isCompareMode: boolean;
}

function ContractItem({
  contract,
  isActive,
  isCompareMode,
  isSelected,
  onSelect,
  onToggleCompare,
}: {
  contract: Contract;
  isActive: boolean;
  isCompareMode: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggleCompare: () => void;
}) {
  const statusColors: Record<string, string> = {
    complete: "bg-success",
    error: "bg-coral-dark",
    idle: "bg-border",
  };
  const dotColor = statusColors[contract.analysis.status] ?? "bg-blue-450";

  return (
    <div
      onClick={isCompareMode ? onToggleCompare : onSelect}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-button)] cursor-pointer transition-colors ${
        isActive && !isCompareMode
          ? "bg-blue-450/10 ring-1 ring-blue-450"
          : "hover:bg-gray-100"
      } ${isSelected ? "bg-blue-450/10 ring-1 ring-blue-450" : ""}`}
    >
      {isCompareMode && (
        <div
          className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
            isSelected ? "bg-blue-450 border-blue-450" : "border-border bg-surface"
          }`}
        >
          {isSelected && (
            <svg className="w-2.5 h-2.5 text-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-small text-near-black truncate font-medium">{contract.fileName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
          <span className="text-small text-placeholder capitalize">
            {contract.analysis.status === "complete"
              ? `${contract.pageCount}p`
              : contract.analysis.status}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ContractSidebar({
  selectedForCompare,
  onToggleCompareSelect,
  isCompareMode,
}: ContractSidebarProps) {
  const { contracts, activeContractId, setActiveContract, removeContract } = useContractStore();

  if (contracts.length === 0) return null;

  return (
    <aside className="w-56 flex-shrink-0 bg-surface border-r border-border flex flex-col">
      <div className="flex-shrink-0 px-4 pt-3 pb-2">
        <p className="text-micro text-placeholder uppercase tracking-wide px-1">
          {isCompareMode ? "Select to Compare" : "Contracts"}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="space-y-0.5">
          {contracts.map((contract) => (
            <div key={contract.id} className="relative group/item">
              <ContractItem
                contract={contract}
                isActive={activeContractId === contract.id}
                isCompareMode={isCompareMode}
                isSelected={selectedForCompare.includes(contract.id)}
                onSelect={() => setActiveContract(contract.id)}
                onToggleCompare={() => onToggleCompareSelect(contract.id)}
              />
              {!isCompareMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeContract(contract.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-placeholder hover:text-coral-dark hover:bg-coral-light transition-colors opacity-0 group-hover/item:opacity-100"
                  aria-label="Remove contract"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

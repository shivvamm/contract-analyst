"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useContractStore } from "@/stores/contract-store";
import type { ComparisonMode, ComparisonResult, SideBySideResult, MatrixResult } from "@/types";

export function useComparison() {
  const [isComparing, setIsComparing] = useState(false);
  const { contracts, addComparison, settings } = useContractStore();

  const compare = useCallback(
    async (contractIds: string[], mode: ComparisonMode): Promise<string | null> => {
      if (contractIds.length < 2) return null;

      // Build the contracts payload expected by the API
      const selectedContracts = contractIds.map((id) => {
        const contract = contracts.find((c) => c.id === id);
        return {
          name: contract?.fileName ?? id,
          keyTerms: contract?.analysis.keyTerms ?? null,
          risks: contract?.analysis.risks ?? [],
        };
      });

      setIsComparing(true);

      try {
        const response = await fetch("/api/compare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-gemini-api-key": settings.geminiApiKey,
            "x-output-language": settings.outputLanguage,
          },
          body: JSON.stringify({ mode, contracts: selectedContracts }),
        });

        if (!response.ok) {
          const errorBody = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(errorBody.error ?? `Request failed: ${response.statusText}`);
        }

        const result = (await response.json()) as {
          mode: ComparisonMode;
          sideBySide?: SideBySideResult;
          matrix?: MatrixResult;
          recommendation: string;
        };

        const comparisonId = uuidv4();
        const comparison: ComparisonResult = {
          id: comparisonId,
          contractIds,
          mode,
          sideBySide: result.sideBySide ?? null,
          matrix: result.matrix ?? null,
          recommendation: result.recommendation ?? "",
          createdAt: Date.now(),
        };

        addComparison(comparison);
        return comparisonId;
      } finally {
        setIsComparing(false);
      }
    },
    [contracts, addComparison, settings]
  );

  return { compare, isComparing };
}

"use client";

import { useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useContractStore } from "@/stores/contract-store";
import { detectFileType } from "@/lib/parsers/detect-file-type";
import type {
  AnalyzeSSEEvent,
  Contract,
  ContractChunk,
  KeyTerms,
  Risk,
  ComplianceFinding,
  ContractSummary,
} from "@/types";

export function useAnalysis() {
  const { addContract, updateAnalysis, updateContract, setSuggestedQuestions, settings } =
    useContractStore();

  const abortRef = useRef<AbortController | null>(null);

  // Clean up on unmount: abort any in-progress analysis
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const processStream = useCallback(
    async (contractId: string, response: Response, signal: AbortSignal) => {
      const reader = response.body?.getReader();
      if (!reader) {
        updateAnalysis(contractId, { status: "error", error: "No response stream" });
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          if (signal.aborted) break;
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split("\n\n");
          // Keep the last (potentially incomplete) part in the buffer
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const lines = part.split("\n");
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice("data: ".length);
              let event: AnalyzeSSEEvent;
              try {
                event = JSON.parse(jsonStr) as AnalyzeSSEEvent;
              } catch {
                continue;
              }

              switch (event.type) {
                case "parsing": {
                  const d = event.data as {
                    rawText: string;
                    chunks: ContractChunk[];
                    pageCount: number;
                    ocrWarning: string | null;
                  };
                  updateContract(contractId, {
                    rawText: d.rawText,
                    chunks: d.chunks,
                    pageCount: d.pageCount,
                  });
                  updateAnalysis(contractId, { status: "parsing", progress: 10 });
                  break;
                }
                case "progress": {
                  const d = event.data as { stage: string; percent: number };
                  updateAnalysis(contractId, { progress: d.percent });
                  break;
                }
                case "extraction": {
                  const keyTerms = event.data as KeyTerms;
                  updateAnalysis(contractId, {
                    status: "extracting",
                    keyTerms,
                  });
                  break;
                }
                case "risks": {
                  const risks = event.data as Risk[];
                  updateAnalysis(contractId, {
                    status: "analyzing-risks",
                    risks,
                  });
                  break;
                }
                case "compliance": {
                  const compliance = event.data as ComplianceFinding[];
                  updateAnalysis(contractId, {
                    status: "checking-compliance",
                    compliance,
                  });
                  break;
                }
                case "summary": {
                  const summary = event.data as ContractSummary;
                  updateAnalysis(contractId, {
                    status: "summarizing",
                    summary,
                  });
                  break;
                }
                case "suggested-questions": {
                  const questions = event.data as string[];
                  setSuggestedQuestions(contractId, questions);
                  break;
                }
                case "complete": {
                  updateAnalysis(contractId, { status: "complete", progress: 100 });
                  break;
                }
                case "error": {
                  const d = event.data as { message: string };
                  updateAnalysis(contractId, { status: "error", error: d.message });
                  break;
                }
              }
            }
          }
        }
      } catch (err) {
        if (signal.aborted) return; // Don't surface abort as an error
        const message = err instanceof Error ? err.message : "Stream read failed";
        updateAnalysis(contractId, { status: "error", error: message });
      } finally {
        reader.releaseLock();
      }
    },
    [updateAnalysis, updateContract, setSuggestedQuestions]
  );

  const createInitialContract = useCallback(
    (fileName: string, fileType: Contract["fileType"]): string => {
      const id = uuidv4();
      const contract: Contract = {
        id,
        fileName,
        fileType,
        uploadedAt: Date.now(),
        pageCount: 0,
        rawText: "",
        chunks: [],
        analysis: {
          status: "parsing",
          progress: 0,
          keyTerms: null,
          risks: [],
          compliance: [],
          summary: null,
          error: null,
        },
        chat: {
          messages: [],
          suggestedQuestions: [],
        },
      };
      addContract(contract);
      return id;
    },
    [addContract]
  );

  const analyzeFile = useCallback(
    async (file: File): Promise<void> => {
      // Abort any in-progress analysis
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const fileType = detectFileType(file.name, file.type);
      const contractId = createInitialContract(file.name, fileType);

      const formData = new FormData();
      formData.append("file", file);

      const headers: Record<string, string> = {
        "x-output-language": settings.outputLanguage,
      };
      if (settings.geminiApiKey) {
        headers["x-gemini-api-key"] = settings.geminiApiKey;
      }

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers,
          body: formData,
          signal: controller.signal,
        });

        if (!response.ok) {
          updateAnalysis(contractId, {
            status: "error",
            error: `Request failed: ${response.statusText}`,
          });
          return;
        }

        await processStream(contractId, response, controller.signal);
      } catch (err) {
        if (controller.signal.aborted) return; // Cancelled, not an error
        const message = err instanceof Error ? err.message : "Analysis failed";
        updateAnalysis(contractId, { status: "error", error: message });
      }
    },
    [createInitialContract, processStream, updateAnalysis, settings]
  );

  const analyzeText = useCallback(
    async (text: string): Promise<void> => {
      // Abort any in-progress analysis
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const contractId = createInitialContract("Pasted Text", "text");

      const textHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        "x-output-language": settings.outputLanguage,
      };
      if (settings.geminiApiKey) {
        textHeaders["x-gemini-api-key"] = settings.geminiApiKey;
      }

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: textHeaders,
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });

        if (!response.ok) {
          updateAnalysis(contractId, {
            status: "error",
            error: `Request failed: ${response.statusText}`,
          });
          return;
        }

        await processStream(contractId, response, controller.signal);
      } catch (err) {
        if (controller.signal.aborted) return; // Cancelled, not an error
        const message = err instanceof Error ? err.message : "Analysis failed";
        updateAnalysis(contractId, { status: "error", error: message });
      }
    },
    [createInitialContract, processStream, updateAnalysis, settings]
  );

  return { analyzeFile, analyzeText };
}

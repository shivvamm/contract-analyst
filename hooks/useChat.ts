"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useContractStore } from "@/stores/contract-store";
import type { ChatMessage, SourceReference } from "@/types";

export function useChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const { addChatMessage, updateContract, settings } = useContractStore();

  const abortRef = useRef<AbortController | null>(null);

  // Clean up on unmount: abort any in-progress chat stream
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(
    async (question: string): Promise<void> => {
      // Capture the contract ID at the start of this call so it stays
      // stable even if the user switches contracts during streaming.
      const contractId = useContractStore.getState().activeContractId;
      if (!contractId) return;

      // Snapshot current contract state
      const state = useContractStore.getState();
      const contract = state.contracts.find((c) => c.id === contractId);
      if (!contract) return;

      // Build user message
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: "user",
        content: question,
        sources: [],
        timestamp: Date.now(),
      };

      // Build placeholder assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "",
        sources: [],
        timestamp: Date.now(),
      };

      // Abort any in-progress chat stream
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Add both messages to store before fetching
      addChatMessage(contractId, userMessage);
      addChatMessage(contractId, assistantMessage);

      const assistantMsgId = assistantMessage.id;

      // Build chatHistory from last 10 messages (excluding the two we just added)
      const previousMessages = contract.chat.messages.slice(-10);
      const chatHistory = previousMessages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n");

      // Guard: if rawText was lost (e.g. cleared from storage), surface an error
      // instead of sending the LLM a request with no contract context.
      if (!contract.rawText) {
        const currentState = useContractStore.getState();
        const currentContract = currentState.contracts.find((c) => c.id === contractId);
        if (currentContract) {
          const updatedMessages = currentContract.chat.messages.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content:
                    "Contract text is no longer available. Please re-upload the document to continue chatting.",
                }
              : m
          );
          updateContract(contractId, {
            chat: { ...currentContract.chat, messages: updatedMessages },
          });
        }
        return;
      }

      const analysisContext = contract.analysis.keyTerms
        ? JSON.stringify(contract.analysis.keyTerms)
        : "";

      setIsStreaming(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-gemini-api-key": settings.geminiApiKey,
            "x-output-language": settings.outputLanguage,
          },
          body: JSON.stringify({
            question,
            contractText: contract.rawText,
            analysisContext,
            chatHistory,
          }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          // Update assistant message with error
          const currentState = useContractStore.getState();
          const currentContract = currentState.contracts.find((c) => c.id === contractId);
          if (currentContract) {
            const updatedMessages = currentContract.chat.messages.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: "Sorry, there was an error processing your request." }
                : m
            );
            updateContract(contractId, {
              chat: { ...currentContract.chat, messages: updatedMessages },
            });
          }
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedContent = "";

        try {
          while (true) {
            if (controller.signal.aborted) break;
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const parts = buffer.split("\n\n");
            buffer = parts.pop() ?? "";

            for (const part of parts) {
              const lines = part.split("\n");
              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const jsonStr = line.slice("data: ".length);
                let event: { type: string; data: unknown };
                try {
                  event = JSON.parse(jsonStr) as { type: string; data: unknown };
                } catch {
                  continue;
                }

                if (event.type === "token") {
                  accumulatedContent += event.data as string;

                  // Use getState() with captured contractId to write to correct contract
                  const latestState = useContractStore.getState();
                  const latestContract = latestState.contracts.find(
                    (c) => c.id === contractId
                  );
                  if (latestContract) {
                    const updatedMessages = latestContract.chat.messages.map((m) =>
                      m.id === assistantMsgId
                        ? { ...m, content: accumulatedContent }
                        : m
                    );
                    updateContract(contractId, {
                      chat: { ...latestContract.chat, messages: updatedMessages },
                    });
                  }
                } else if (event.type === "sources") {
                  const sources = event.data as SourceReference[];
                  const latestState = useContractStore.getState();
                  const latestContract = latestState.contracts.find(
                    (c) => c.id === contractId
                  );
                  if (latestContract) {
                    const updatedMessages = latestContract.chat.messages.map((m) =>
                      m.id === assistantMsgId ? { ...m, sources } : m
                    );
                    updateContract(contractId, {
                      chat: { ...latestContract.chat, messages: updatedMessages },
                    });
                  }
                } else if (event.type === "error") {
                  const d = event.data as { message: string };
                  const latestState = useContractStore.getState();
                  const latestContract = latestState.contracts.find(
                    (c) => c.id === contractId
                  );
                  if (latestContract) {
                    const updatedMessages = latestContract.chat.messages.map((m) =>
                      m.id === assistantMsgId
                        ? { ...m, content: d.message || "An error occurred." }
                        : m
                    );
                    updateContract(contractId, {
                      chat: { ...latestContract.chat, messages: updatedMessages },
                    });
                  }
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } catch (err) {
        if (controller.signal.aborted) return; // Cancelled, not an error
        throw err;
      } finally {
        setIsStreaming(false);
      }
    },
    [addChatMessage, updateContract, settings]
  );

  return { sendMessage, isStreaming };
}

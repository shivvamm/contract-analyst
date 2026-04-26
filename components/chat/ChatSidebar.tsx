"use client";

import React, { useState, useRef, useEffect } from "react";
import { useContractStore } from "@/stores/contract-store";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/chat/ChatMessage";

interface ChatSidebarProps {
  contractId: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({ contractId, isOpen, onToggle }: ChatSidebarProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { contracts, setActiveContract } = useContractStore();
  const { sendMessage, isStreaming } = useChat();

  const contract = contracts.find((c) => c.id === contractId);
  const messages = contract?.chat.messages ?? [];
  const suggestedQuestions = contract?.chat.suggestedQuestions ?? [];

  // Set active contract to ensure chat hooks work
  useEffect(() => {
    setActiveContract(contractId);
  }, [contractId, setActiveContract]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    await sendMessage(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  async function handleSuggestedQuestion(q: string) {
    await sendMessage(q);
  }

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-450 hover:bg-blue-pressed text-surface rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
        aria-label="Open chat"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-surface border-l border-border flex flex-col z-40 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-450/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <span className="text-feature text-near-black">Ask about contract</span>
        </div>
        <button
          onClick={onToggle}
          className="w-7 h-7 flex items-center justify-center rounded-full text-placeholder hover:text-near-black hover:bg-gray-100 transition-colors"
          aria-label="Close chat"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-caption text-placeholder text-center">
              Ask anything about this contract
            </p>
            {suggestedQuestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => void handleSuggestedQuestion(q)}
                    disabled={isStreaming}
                    className="px-3 py-1.5 rounded-[var(--radius-pill)] border border-blue-450 text-small text-blue-450 hover:bg-blue-450 hover:text-surface transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-border">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question…"
            rows={2}
            disabled={isStreaming}
            className="flex-1 rounded-[var(--radius-button)] border border-input-border bg-gray-50 px-3 py-2 text-body text-near-black placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-blue-450 focus:border-transparent resize-none disabled:opacity-50 transition-colors"
          />
          <button
            onClick={() => void handleSend()}
            disabled={!input.trim() || isStreaming}
            className="flex-shrink-0 w-10 h-10 bg-blue-450 hover:bg-blue-pressed text-surface rounded-[var(--radius-button)] flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            {isStreaming ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-small text-placeholder mt-1.5">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}

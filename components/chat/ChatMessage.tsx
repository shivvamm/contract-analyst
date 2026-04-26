import React from "react";
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-[var(--radius-card)] px-4 py-3 space-y-2 ${
          isUser
            ? "bg-blue-450 text-surface"
            : "bg-gray-50 text-near-black ring-miro"
        }`}
      >
        <p className="text-body whitespace-pre-wrap">{message.content}</p>

        {message.sources.length > 0 && (
          <div className="border-t border-current/20 pt-2 mt-2 space-y-1">
            <p className={`text-small font-medium ${isUser ? "text-surface/70" : "text-placeholder"}`}>
              Sources
            </p>
            {message.sources.map((source, i) => (
              <div key={i} className={`text-small ${isUser ? "text-surface/80" : "text-slate"}`}>
                <span className="italic">&ldquo;{source.clause}&rdquo;</span>
                {source.pageNumber && (
                  <span className={`ml-1 ${isUser ? "text-surface/60" : "text-placeholder"}`}>
                    — p. {source.pageNumber}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

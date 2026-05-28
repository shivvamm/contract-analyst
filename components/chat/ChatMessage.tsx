import React from "react";
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

function renderMarkdown(content: string): React.ReactNode[] {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trimStart().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre key={elements.length} className="bg-near-black/5 rounded-[var(--radius-button)] px-3 py-2 overflow-x-auto my-1">
          <code className="text-small">{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(<p key={elements.length} className="font-semibold mt-2 mb-1">{formatInline(line.slice(4))}</p>);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(<p key={elements.length} className="font-semibold text-lg mt-2 mb-1">{formatInline(line.slice(3))}</p>);
      i++;
      continue;
    }

    // Unordered list
    if (line.match(/^\s*[-*]\s/)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && lines[i].match(/^\s*[-*]\s/)) {
        items.push(<li key={items.length}>{formatInline(lines[i].replace(/^\s*[-*]\s/, ""))}</li>);
        i++;
      }
      elements.push(<ul key={elements.length} className="list-disc pl-5 space-y-0.5 my-1">{items}</ul>);
      continue;
    }

    // Ordered list
    if (line.match(/^\s*\d+\.\s/)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && lines[i].match(/^\s*\d+\.\s/)) {
        items.push(<li key={items.length}>{formatInline(lines[i].replace(/^\s*\d+\.\s/, ""))}</li>);
        i++;
      }
      elements.push(<ol key={elements.length} className="list-decimal pl-5 space-y-0.5 my-1">{items}</ol>);
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(<p key={elements.length} className="my-0.5">{formatInline(line)}</p>);
    i++;
  }

  return elements;
}

function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|__(.+?)__|`([^`]+)`|\*(.+?)\*|_(.+?)_)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2] || match[3]) {
      parts.push(<strong key={parts.length}>{match[2] || match[3]}</strong>);
    } else if (match[4]) {
      parts.push(
        <code key={parts.length} className="bg-near-black/5 px-1 py-0.5 rounded text-small">
          {match[4]}
        </code>
      );
    } else if (match[5] || match[6]) {
      parts.push(<em key={parts.length}>{match[5] || match[6]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-[var(--radius-card)] px-4 py-3 space-y-1 ${
          isUser
            ? "bg-blue-450 text-surface"
            : "bg-bg text-near-black ring-miro"
        }`}
      >
        {isUser ? (
          <p className="text-body whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-body">{renderMarkdown(message.content)}</div>
        )}

        {message.sources && message.sources.length > 0 && (
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

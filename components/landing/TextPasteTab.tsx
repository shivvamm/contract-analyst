"use client";

import React, { useState } from "react";

interface TextPasteTabProps {
  onSubmit: (text: string) => void;
}

export function TextPasteTab({ onSubmit }: TextPasteTabProps) {
  const [text, setText] = useState("");

  function handleSubmit() {
    const trimmed = text.trim();
    if (trimmed.length > 0) {
      onSubmit(trimmed);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your contract text here…"
        rows={10}
        className="w-full rounded-[var(--radius-card)] border border-input-border bg-gray-50 px-4 py-3 text-body text-near-black placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-blue-450 focus:border-transparent resize-none transition-colors"
      />
      <div className="flex items-center justify-between">
        <span className="text-small text-placeholder">
          {text.length.toLocaleString()} characters
        </span>
        <button
          onClick={handleSubmit}
          disabled={text.trim().length === 0}
          className="bg-blue-450 text-surface text-button px-6 py-2.5 rounded-[var(--radius-button)] hover:bg-blue-pressed transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Analyze Text
        </button>
      </div>
    </div>
  );
}

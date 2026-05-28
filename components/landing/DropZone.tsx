"use client";

import React, { useCallback, useRef, useState } from "react";

const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".png", ".jpg", ".jpeg", ".txt"];
const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

function filterSupportedFiles(files: File[]): { supported: File[]; rejected: File[]; tooLarge: File[] } {
  const supported: File[] = [];
  const rejected: File[] = [];
  const tooLarge: File[] = [];
  for (const file of files) {
    const lower = file.name.toLowerCase();
    if (!SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      rejected.push(file);
    } else if (file.size > MAX_FILE_SIZE) {
      tooLarge.push(file);
    } else {
      supported.push(file);
    }
  }
  return { supported, rejected, tooLarge };
}

interface DropZoneProps {
  onFiles: (files: File[]) => void;
}

export function DropZone({ onFiles }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const allFiles = Array.from(e.dataTransfer.files);
      const { supported, rejected, tooLarge } = filterSupportedFiles(allFiles);
      const warnings: string[] = [];
      if (rejected.length > 0) {
        warnings.push(`Unsupported file${rejected.length > 1 ? "s" : ""}: ${rejected.map((f) => f.name).join(", ")}. Supported formats: PDF, DOCX, PNG, JPG, TXT.`);
      }
      if (tooLarge.length > 0) {
        warnings.push(`File${tooLarge.length > 1 ? "s" : ""} too large (max ${MAX_FILE_SIZE_MB} MB): ${tooLarge.map((f) => f.name).join(", ")}`);
      }
      if (warnings.length > 0) window.alert(warnings.join("\n\n"));
      if (supported.length > 0) {
        onFiles(supported);
      }
    },
    [onFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const allFiles = Array.from(e.target.files ?? []);
      const { supported, rejected, tooLarge } = filterSupportedFiles(allFiles);
      const warnings: string[] = [];
      if (rejected.length > 0) {
        warnings.push(`Unsupported file${rejected.length > 1 ? "s" : ""}: ${rejected.map((f) => f.name).join(", ")}. Supported formats: PDF, DOCX, PNG, JPG, TXT.`);
      }
      if (tooLarge.length > 0) {
        warnings.push(`File${tooLarge.length > 1 ? "s" : ""} too large (max ${MAX_FILE_SIZE_MB} MB): ${tooLarge.map((f) => f.name).join(", ")}`);
      }
      if (warnings.length > 0) window.alert(warnings.join("\n\n"));
      if (supported.length > 0) {
        onFiles(supported);
      }
      // Reset so the same file can be re-selected
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onFiles]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload contract file"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={`
        relative flex flex-col items-center justify-center gap-4
        border-2 border-dashed rounded-[var(--radius-container)]
        p-12 cursor-pointer transition-all
        focus:outline-none focus:ring-2 focus:ring-blue-450 focus:ring-offset-2
        ${isDragging
          ? "border-blue-450 bg-blue-450/5"
          : "border-border bg-bg hover:border-blue-450 hover:bg-blue-450/5"
        }
      `}
    >
      <input
        ref={inputRef}
        id="contract-file-input"
        type="file"
        multiple
        accept=".pdf,.docx,.png,.jpg,.jpeg,.txt"
        aria-label="Select contract file to upload"
        className="hidden"
        onChange={handleChange}
      />

      <div className={`w-14 h-14 rounded-[var(--radius-card)] flex items-center justify-center transition-colors ${isDragging ? "bg-blue-450" : "bg-blue-450/10"}`}>
        <svg
          className={`w-7 h-7 transition-colors ${isDragging ? "text-surface" : "text-blue-450"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-feature text-near-black mb-1">
          Drop files here or{" "}
          <span className="text-blue-450 underline underline-offset-2">browse</span>
        </p>
        <p className="text-caption text-slate">
          PDF, DOCX, PNG, JPG, TXT &mdash; up to 20 MB each
        </p>
      </div>
    </div>
  );
}

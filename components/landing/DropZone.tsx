"use client";

import React, { useCallback, useRef, useState } from "react";

const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".png", ".jpg", ".jpeg", ".txt"];

function filterSupportedFiles(files: File[]): { supported: File[]; rejected: File[] } {
  const supported: File[] = [];
  const rejected: File[] = [];
  for (const file of files) {
    const lower = file.name.toLowerCase();
    if (SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      supported.push(file);
    } else {
      rejected.push(file);
    }
  }
  return { supported, rejected };
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
      const { supported, rejected } = filterSupportedFiles(allFiles);
      if (rejected.length > 0) {
        const names = rejected.map((f) => f.name).join(", ");
        window.alert(
          `Unsupported file${rejected.length > 1 ? "s" : ""}: ${names}. Supported formats: PDF, DOCX, PNG, JPG, TXT.`
        );
      }
      if (supported.length > 0) {
        onFiles(supported);
      }
    },
    [onFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const allFiles = Array.from(e.target.files ?? []);
      const { supported, rejected } = filterSupportedFiles(allFiles);
      if (rejected.length > 0) {
        const names = rejected.map((f) => f.name).join(", ");
        window.alert(
          `Unsupported file${rejected.length > 1 ? "s" : ""}: ${names}. Supported formats: PDF, DOCX, PNG, JPG, TXT.`
        );
      }
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
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-4
        border-2 border-dashed rounded-[var(--radius-container)]
        p-12 cursor-pointer transition-all
        ${isDragging
          ? "border-blue-450 bg-blue-450/5"
          : "border-border bg-gray-50 hover:border-blue-450 hover:bg-blue-450/5"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.png,.jpg,.jpeg,.txt"
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

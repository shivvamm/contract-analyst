import React from "react";

interface FileCardProps {
  fileName: string;
  fileType: string;
  status: "queued" | "uploading" | "analyzing" | "complete" | "error";
  progress?: number;
  onRemove?: () => void;
}

function FileIcon({ fileType }: { fileType: string }) {
  const ext = fileType.toLowerCase();
  if (ext.includes("pdf")) {
    return (
      <div className="w-9 h-9 rounded-[var(--radius-card)] bg-coral-light flex items-center justify-center flex-shrink-0">
        <span className="text-micro text-coral-dark font-bold">PDF</span>
      </div>
    );
  }
  if (ext.includes("doc")) {
    return (
      <div className="w-9 h-9 rounded-[var(--radius-card)] bg-blue-450/10 flex items-center justify-center flex-shrink-0">
        <span className="text-micro text-blue-450 font-bold">DOC</span>
      </div>
    );
  }
  if (ext.includes("png") || ext.includes("jpg") || ext.includes("jpeg") || ext.includes("image")) {
    return (
      <div className="w-9 h-9 rounded-[var(--radius-card)] bg-teal-light flex items-center justify-center flex-shrink-0">
        <span className="text-micro text-teal-dark font-bold">IMG</span>
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-[var(--radius-card)] bg-orange-light flex items-center justify-center flex-shrink-0">
      <span className="text-micro text-yellow-dark font-bold">TXT</span>
    </div>
  );
}

const statusLabels: Record<string, string> = {
  queued: "Queued",
  uploading: "Uploading…",
  analyzing: "Analyzing…",
  complete: "Complete",
  error: "Error",
};

const statusColors: Record<string, string> = {
  queued: "text-slate",
  uploading: "text-blue-450",
  analyzing: "text-blue-450",
  complete: "text-success",
  error: "text-coral-dark",
};

export function FileCard({ fileName, fileType, status, progress = 0, onRemove }: FileCardProps) {
  const isActive = status === "uploading" || status === "analyzing";

  return (
    <div className="flex items-center gap-3 bg-surface ring-miro rounded-[var(--radius-card)] p-3">
      <FileIcon fileType={fileType} />

      <div className="flex-1 min-w-0">
        <p className="text-caption text-near-black truncate font-medium">{fileName}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-small ${statusColors[status]}`}>{statusLabels[status]}</span>
          {isActive && (
            <span className="text-small text-placeholder">{progress}%</span>
          )}
        </div>
        {isActive && (
          <div className="mt-1.5 h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-450 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-placeholder hover:text-near-black hover:bg-bg-muted transition-colors"
          aria-label="Remove file"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

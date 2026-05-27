import type { Contract } from "@/types";

export type FileType = Contract["fileType"];

const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".png", ".jpg", ".jpeg", ".txt"];

const SUPPORTED_FORMATS_LABEL = "PDF, DOCX, PNG, JPG, and TXT";

export function detectFileType(fileName: string, mimeType: string): FileType {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf") || mimeType === "application/pdf") return "pdf";
  if (lower.endsWith(".docx") || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || mimeType.startsWith("image/")) return "image";
  return "text";
}

/**
 * Returns true if the file is a supported format based on its extension and MIME type.
 * Use this to reject unsupported files before they reach the parser.
 */
export function isSupportedFile(fileName: string, mimeType: string): boolean {
  const lower = fileName.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext))
    || mimeType === "application/pdf"
    || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    || mimeType.startsWith("image/");
}

/** Human-readable label for error messages. */
export { SUPPORTED_EXTENSIONS, SUPPORTED_FORMATS_LABEL };

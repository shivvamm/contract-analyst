import type { Contract } from "@/types";

export type FileType = Contract["fileType"];

export function detectFileType(fileName: string, mimeType: string): FileType {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf") || mimeType === "application/pdf") return "pdf";
  if (lower.endsWith(".docx") || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || mimeType.startsWith("image/")) return "image";
  return "text";
}

import { parsePdf } from "./pdf-parser";
import { parseDocx } from "./docx-parser";
import { parseImageOcr } from "./ocr-parser";
import type { Contract } from "@/types";

export type FileType = Contract["fileType"];

export function detectFileType(fileName: string, mimeType: string): FileType {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf") || mimeType === "application/pdf") return "pdf";
  if (lower.endsWith(".docx") || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || mimeType.startsWith("image/")) return "image";
  return "text";
}

export function parseTextInput(text: string): { rawText: string; pageCount: number } {
  return { rawText: text, pageCount: 1 };
}

export async function parseFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ rawText: string; pageCount: number; ocrWarning?: string }> {
  const fileType = detectFileType(fileName, mimeType);

  switch (fileType) {
    case "pdf": {
      const pdfResult = await parsePdf(buffer);
      if (!pdfResult.hasExtractableText) {
        const ocrResult = await parseImageOcr(buffer, "application/pdf");
        return {
          rawText: ocrResult.rawText,
          pageCount: pdfResult.pageCount,
          ocrWarning: ocrResult.confidence < 60 ? "Some pages had low text quality — results may be incomplete" : undefined,
        };
      }
      return { rawText: pdfResult.rawText, pageCount: pdfResult.pageCount };
    }
    case "docx": {
      const docxResult = await parseDocx(buffer);
      return { rawText: docxResult.rawText, pageCount: docxResult.pageCount };
    }
    case "image": {
      const ocrResult = await parseImageOcr(buffer, mimeType);
      return {
        rawText: ocrResult.rawText,
        pageCount: ocrResult.pageCount,
        ocrWarning: ocrResult.confidence < 60 ? "Some pages had low text quality — results may be incomplete" : undefined,
      };
    }
    default:
      throw new Error(`Unsupported file type: ${fileName}`);
  }
}

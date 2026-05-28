import { parsePdf } from "./pdf-parser";
import { parseDocx } from "./docx-parser";
import { parseImageOcr, ocrPdfPages } from "./ocr-parser";
import { detectFileType, isSupportedFile, SUPPORTED_FORMATS_LABEL } from "./detect-file-type";
export type { FileType } from "./detect-file-type";
export { detectFileType, isSupportedFile };

export function parseTextInput(text: string): { rawText: string; pageCount: number } {
  return { rawText: text, pageCount: 1 };
}

export async function parseFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ rawText: string; pageCount: number; ocrWarning?: string }> {
  if (!isSupportedFile(fileName, mimeType)) {
    const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "(unknown)";
    throw new Error(
      `Unsupported file format: ${ext}. Supported formats: ${SUPPORTED_FORMATS_LABEL}.`
    );
  }

  const fileType = detectFileType(fileName, mimeType);

  switch (fileType) {
    case "pdf": {
      const pdfResult = await parsePdf(buffer);
      if (!pdfResult.hasExtractableText) {
        const ocrResult = await ocrPdfPages(buffer, pdfResult.pageCount);
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

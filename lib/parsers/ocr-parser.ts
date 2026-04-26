import Tesseract from "tesseract.js";

export interface OcrParseResult {
  rawText: string;
  pageCount: number;
  confidence: number;
}

export async function parseImageOcr(buffer: Buffer, mimeType: string): Promise<OcrParseResult> {
  const base64 = buffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64}`;
  const { data: { text, confidence } } = await Tesseract.recognize(dataUri, "eng");
  return { rawText: `[PAGE 1]\n${text.trim()}`, pageCount: 1, confidence };
}

export async function ocrPdfPages(buffer: Buffer, pageCount: number): Promise<OcrParseResult> {
  const { data: { text, confidence } } = await Tesseract.recognize(buffer, "eng");
  return { rawText: `[PAGE 1]\n${text.trim()}`, pageCount: pageCount || 1, confidence };
}

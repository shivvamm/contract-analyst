import mammoth from "mammoth";

export interface DocxParseResult {
  rawText: string;
  pageCount: number;
}

export async function parseDocx(buffer: Buffer): Promise<DocxParseResult> {
  const result = await mammoth.extractRawText({ buffer });
  const rawText = result.value;
  const estimatedPages = Math.max(1, Math.ceil(rawText.length / 3000));
  return { rawText: `[PAGE 1]\n${rawText}`, pageCount: estimatedPages };
}

export interface PdfParseResult {
  rawText: string;
  pageCount: number;
  hasExtractableText: boolean;
}

export async function parsePdf(buffer: Buffer): Promise<PdfParseResult> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse/lib/pdf-parse") as (buffer: Buffer) => Promise<{ text: string; numpages: number }>;
  let data: { text: string; numpages: number };
  try {
    data = await pdfParse(buffer);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("encrypt")) {
      throw new Error("This PDF is password-protected and cannot be parsed. Please remove the password and try again.");
    }
    throw new Error(`Failed to parse PDF: ${msg}`);
  }
  const pageTexts: string[] = [];
  const pages = data.text.split(/\f/);

  for (let i = 0; i < pages.length; i++) {
    const pageText = pages[i].trim();
    if (pageText.length > 0) {
      pageTexts.push(`[PAGE ${i + 1}]\n${pageText}`);
    }
  }

  const rawText = pageTexts.join("\n\n");
  const hasExtractableText = rawText.replace(/\[PAGE \d+\]/g, "").trim().length > 50;

  return { rawText, pageCount: data.numpages, hasExtractableText };
}

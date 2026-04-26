// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export interface PdfParseResult {
  rawText: string;
  pageCount: number;
  hasExtractableText: boolean;
}

export async function parsePdf(buffer: Buffer): Promise<PdfParseResult> {
  const data = await pdfParse(buffer);
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

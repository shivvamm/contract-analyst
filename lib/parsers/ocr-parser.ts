import Tesseract from "tesseract.js";

export interface OcrParseResult {
  rawText: string;
  pageCount: number;
  confidence: number;
}

export async function parseImageOcr(
  buffer: Buffer,
  mimeType: string
): Promise<OcrParseResult> {
  // For PDFs, delegate to ocrPdfPages which handles multi-page rendering
  if (mimeType === "application/pdf") {
    return ocrPdfPages(buffer, 0);
  }

  const base64 = buffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64}`;
  const {
    data: { text, confidence },
  } = await Tesseract.recognize(dataUri, "eng");
  return { rawText: `[PAGE 1]\n${text.trim()}`, pageCount: 1, confidence };
}

/* ------------------------------------------------------------------ */
/*  Internal types for pdfjs-dist + node-canvas                       */
/* ------------------------------------------------------------------ */

interface PdfJsViewport {
  width: number;
  height: number;
}

interface PdfJsPage {
  getViewport: (opts: { scale: number }) => PdfJsViewport;
  render: (opts: {
    canvasContext: unknown;
    viewport: PdfJsViewport;
  }) => { promise: Promise<void> };
}

interface PdfJsDocument {
  numPages: number;
  getPage: (n: number) => Promise<PdfJsPage>;
  destroy: () => void;
}

interface PdfJsLib {
  getDocument: (opts: { data: Uint8Array }) => {
    promise: Promise<PdfJsDocument>;
  };
  GlobalWorkerOptions: { workerSrc: string };
}

interface CanvasModule {
  createCanvas: (w: number, h: number) => {
    getContext: (type: string) => unknown;
    toBuffer: (mime: string) => Buffer;
  };
}

/* ------------------------------------------------------------------ */

/**
 * Dynamically load pdfjs-dist. Returns null if the package is not installed.
 * Uses string variable to prevent bundlers / TS from resolving at build time.
 */
async function loadPdfjsLib(): Promise<PdfJsLib | null> {
  try {
    const legacyPath = "pdfjs-dist/legacy/build/pdf.mjs";
    const mod = await import(/* webpackIgnore: true */ legacyPath);
    return mod as unknown as PdfJsLib;
  } catch {
    try {
      const fallbackPath = "pdfjs-dist";
      const mod = await import(/* webpackIgnore: true */ fallbackPath);
      return mod as unknown as PdfJsLib;
    } catch {
      return null;
    }
  }
}

/**
 * Dynamically load node-canvas. Returns null if the package is not installed.
 */
async function loadCanvas(): Promise<CanvasModule | null> {
  try {
    const canvasPath = "canvas";
    const mod = await import(/* webpackIgnore: true */ canvasPath);
    return mod as unknown as CanvasModule;
  } catch {
    return null;
  }
}

/**
 * Render a single PDF page to a PNG buffer using pdfjs-dist and node-canvas.
 * Returns null if rendering fails.
 */
async function renderPdfPageToPng(
  canvasMod: CanvasModule,
  pdfDoc: PdfJsDocument,
  pageNum: number,
  scale: number
): Promise<Buffer | null> {
  try {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = canvasMod.createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    return canvas.toBuffer("image/png");
  } catch {
    return null;
  }
}

export async function ocrPdfPages(
  buffer: Buffer,
  pageCount: number
): Promise<OcrParseResult> {
  const pdfjsLib = await loadPdfjsLib();

  if (!pdfjsLib) {
    // Fallback: OCR the raw buffer as a single page (original behavior)
    console.warn(
      "[ocr-parser] pdfjs-dist not available. Only the first page will be OCR'd."
    );
    const {
      data: { text, confidence },
    } = await Tesseract.recognize(buffer, "eng");
    return {
      rawText: `[PAGE 1]\n${text.trim()}`,
      pageCount: pageCount || 1,
      confidence,
    };
  }

  // Disable the worker for Node.js server-side usage
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";

  const data = new Uint8Array(buffer);
  const pdfDoc = await pdfjsLib.getDocument({ data }).promise;
  const totalPages = pageCount || pdfDoc.numPages;

  const canvasMod = await loadCanvas();

  if (!canvasMod) {
    // canvas not available — fall back to OCR-ing the raw buffer for the first page
    console.warn(
      "[ocr-parser] canvas not available. Only the first page will be OCR'd."
    );
    pdfDoc.destroy();
    const {
      data: { text, confidence },
    } = await Tesseract.recognize(buffer, "eng");
    return {
      rawText: `[PAGE 1]\n${text.trim()}`,
      pageCount: totalPages,
      confidence,
    };
  }

  const pageTexts: string[] = [];
  let totalConfidence = 0;
  let pagesOcrd = 0;

  // 200 DPI: PDF default is 72 DPI, so scale = 200/72 ~ 2.78
  const scale = 200 / 72;

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const pngBuffer = await renderPdfPageToPng(canvasMod, pdfDoc, i, scale);

    if (pngBuffer) {
      try {
        const {
          data: { text, confidence },
        } = await Tesseract.recognize(pngBuffer, "eng");
        pageTexts.push(`[PAGE ${i}]\n${text.trim()}`);
        totalConfidence += confidence;
        pagesOcrd++;
      } catch {
        pageTexts.push(`[PAGE ${i}]\n[OCR failed for this page]`);
      }
    } else {
      pageTexts.push(`[PAGE ${i}]\n[Rendering failed for this page]`);
    }
  }

  pdfDoc.destroy();

  const avgConfidence = pagesOcrd > 0 ? totalConfidence / pagesOcrd : 0;

  return {
    rawText: pageTexts.join("\n\n"),
    pageCount: totalPages,
    confidence: avgConfidence,
  };
}

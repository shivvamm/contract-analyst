import { NextRequest } from "next/server";
import { parseFile, parseTextInput } from "@/lib/parsers";
import { chunkText } from "@/lib/gemini/chunker";
import { runPipeline } from "@/lib/pipeline/orchestrator";

function sseEvent(type: string, data: unknown): string {
  return `data: ${JSON.stringify({ type, data })}\n\n`;
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  const userApiKey = request.headers.get("x-gemini-api-key") || undefined;
  const language = request.headers.get("x-output-language") || "English";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let rawText: string;
        let pageCount: number;
        let ocrWarning: string | undefined;

        if (contentType.includes("multipart/form-data")) {
          const formData = await request.formData();
          const file = formData.get("file") as File | null;
          if (!file) {
            controller.enqueue(new TextEncoder().encode(sseEvent("error", { message: "No file provided" })));
            controller.close();
            return;
          }
          const MAX_FILE_SIZE = 20 * 1024 * 1024;
          if (file.size > MAX_FILE_SIZE) {
            controller.enqueue(new TextEncoder().encode(sseEvent("error", { message: "File exceeds 20 MB limit. Please upload a smaller file." })));
            controller.close();
            return;
          }
          const buffer = Buffer.from(await file.arrayBuffer());
          controller.enqueue(new TextEncoder().encode(sseEvent("progress", { stage: "parsing", percent: 5 })));
          const parseResult = await parseFile(buffer, file.name, file.type);
          rawText = parseResult.rawText;
          pageCount = parseResult.pageCount;
          ocrWarning = parseResult.ocrWarning;
        } else {
          const body = await request.json();
          const textResult = parseTextInput(body.text || "");
          rawText = textResult.rawText;
          pageCount = textResult.pageCount;
        }

        if (!rawText || rawText.trim().length === 0) {
          controller.enqueue(new TextEncoder().encode(sseEvent("error", { message: "No text could be extracted. Try re-exporting the file or pasting text directly." })));
          controller.close();
          return;
        }

        const chunks = chunkText(rawText);
        controller.enqueue(new TextEncoder().encode(sseEvent("parsing", { rawText, chunks, pageCount, ocrWarning: ocrWarning || null })));

        await runPipeline(chunks, language, {
          onProgress: (stage, percent) => { controller.enqueue(new TextEncoder().encode(sseEvent("progress", { stage, percent }))); },
          onExtraction: (keyTerms) => { controller.enqueue(new TextEncoder().encode(sseEvent("extraction", keyTerms))); },
          onRisks: (risks) => { controller.enqueue(new TextEncoder().encode(sseEvent("risks", risks))); },
          onCompliance: (compliance) => { controller.enqueue(new TextEncoder().encode(sseEvent("compliance", compliance))); },
          onSummary: (summary) => { controller.enqueue(new TextEncoder().encode(sseEvent("summary", summary))); },
          onSuggestedQuestions: (questions) => { controller.enqueue(new TextEncoder().encode(sseEvent("suggested-questions", questions))); },
        }, userApiKey);

        controller.enqueue(new TextEncoder().encode(sseEvent("complete", {})));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed";
        const isRateLimit = message.includes("429") || message.toLowerCase().includes("rate limit") || message.toLowerCase().includes("quota") || message.toLowerCase().includes("resource_exhausted");
        const isDailyLimit = message.toLowerCase().includes("per day") || message.includes("limit: 0");
        const rateLimitMsg = isDailyLimit
          ? "Daily API quota exhausted. Generate a new API key or wait until tomorrow."
          : "Rate limit reached. Please wait a minute and try again.";
        controller.enqueue(new TextEncoder().encode(sseEvent("error", { message: isRateLimit ? rateLimitMsg : message, isRateLimit })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

import { NextRequest } from "next/server";
import { generateStream } from "@/lib/llm/provider";
import { buildChatPrompt } from "@/lib/gemini/prompts";

function sseEvent(type: string, data: unknown): string {
  return `data: ${JSON.stringify({ type, data })}\n\n`;
}

export async function POST(request: NextRequest) {
  const userApiKey = request.headers.get("x-gemini-api-key") || undefined;
  const language = request.headers.get("x-output-language") || "English";
  const body = await request.json();
  const { question, contractText, analysisContext, chatHistory } = body;

  if (!question || !contractText) {
    return Response.json({ error: "Question and contract text are required" }, { status: 400 });
  }

  const prompt = buildChatPrompt(question, contractText, analysisContext || "", chatHistory || "", language);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let fullResponse = "";
        for await (const token of generateStream(prompt, userApiKey)) {
          fullResponse += token;
          controller.enqueue(new TextEncoder().encode(sseEvent("token", token)));
        }

        const sourcesMatch = fullResponse.match(/\[Sources?:\s*(.*?)\]/i);
        if (sourcesMatch) {
          const sourcesStr = sourcesMatch[1];
          const sources = sourcesStr.split(",").map((s) => {
            const pageMatch = s.match(/Page\s+(\d+)/i);
            return { clause: s.trim(), pageNumber: pageMatch ? parseInt(pageMatch[1], 10) : null };
          });
          controller.enqueue(new TextEncoder().encode(sseEvent("sources", sources)));
        }
        controller.enqueue(new TextEncoder().encode(sseEvent("done", {})));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Chat failed";
        controller.enqueue(new TextEncoder().encode(sseEvent("error", { message })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

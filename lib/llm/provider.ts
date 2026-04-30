import * as geminiClient from "@/lib/gemini/client";
import * as groqClient from "@/lib/groq/client";

export type LLMProvider = "gemini" | "groq";

export function getProvider(): LLMProvider {
  const provider = (process.env.LLM_PROVIDER || "gemini").toLowerCase();
  if (provider === "groq") return "groq";
  return "gemini";
}

export async function generateJSON<T>(prompt: string, userApiKey?: string): Promise<T> {
  const provider = getProvider();
  if (provider === "groq") {
    return groqClient.generateJSON<T>(prompt, userApiKey);
  }
  return geminiClient.generateJSON<T>(prompt, userApiKey);
}

export async function* generateStream(prompt: string, userApiKey?: string): AsyncGenerator<string> {
  const provider = getProvider();
  if (provider === "groq") {
    yield* groqClient.generateStream(prompt, userApiKey);
  } else {
    yield* geminiClient.generateStream(prompt, userApiKey);
  }
}

import * as geminiClient from "@/lib/gemini/client";
import * as groqClient from "@/lib/groq/client";
import * as mistralClient from "@/lib/mistral/client";

export type LLMProvider = "gemini" | "groq" | "mistral";

export function getProvider(): LLMProvider {
  const provider = (process.env.LLM_PROVIDER || "gemini").toLowerCase();
  if (provider === "groq") return "groq";
  if (provider === "mistral") return "mistral";
  return "gemini";
}

export async function generateJSON<T>(prompt: string, userApiKey?: string): Promise<T> {
  const provider = getProvider();
  if (provider === "groq") {
    return groqClient.generateJSON<T>(prompt, userApiKey);
  }
  if (provider === "mistral") {
    return mistralClient.generateJSON<T>(prompt, userApiKey);
  }
  return geminiClient.generateJSON<T>(prompt, userApiKey);
}

export async function* generateStream(prompt: string, userApiKey?: string): AsyncGenerator<string> {
  const provider = getProvider();
  if (provider === "groq") {
    yield* groqClient.generateStream(prompt, userApiKey);
  } else if (provider === "mistral") {
    yield* mistralClient.generateStream(prompt, userApiKey);
  } else {
    yield* geminiClient.generateStream(prompt, userApiKey);
  }
}

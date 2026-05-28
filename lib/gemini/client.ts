import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { extractJSON } from "@/lib/llm/extract-json";

export function getGeminiClient(userApiKey?: string): GoogleGenerativeAI {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("No Gemini API key available. Please provide your own API key.");
  }
  return new GoogleGenerativeAI(apiKey);
}

export function getModel(userApiKey?: string, modelName: string = "gemini-2.0-flash"): GenerativeModel {
  const client = getGeminiClient(userApiKey);
  return client.getGenerativeModel({ model: modelName });
}

export async function generateJSON<T>(prompt: string, userApiKey?: string): Promise<T> {
  const model = getModel(userApiKey);
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(extractJSON(text)) as T;
}

export async function* generateStream(prompt: string, userApiKey?: string): AsyncGenerator<string> {
  const model = getModel(userApiKey);
  const result = await model.generateContentStream(prompt);
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

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

  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
    text.match(/\{[\s\S]*\}/) ||
    text.match(/\[[\s\S]*\]/);

  if (!jsonMatch) {
    throw new Error("Failed to parse JSON response from Gemini");
  }

  const jsonStr = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonStr) as T;
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

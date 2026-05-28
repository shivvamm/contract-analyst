import Groq from "groq-sdk";
import { extractJSON } from "@/lib/llm/extract-json";

const MODEL = "llama-3.3-70b-versatile";

function getGroqClient(userApiKey?: string): Groq {
  const apiKey = userApiKey || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("No Groq API key available. Please provide your own API key.");
  }
  return new Groq({ apiKey });
}

export async function generateJSON<T>(prompt: string, userApiKey?: string): Promise<T> {
  const client = getGroqClient(userApiKey);
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 32768,
  });

  const text = response.choices[0]?.message?.content || "";
  return JSON.parse(extractJSON(text)) as T;
}

export async function* generateStream(prompt: string, userApiKey?: string): AsyncGenerator<string> {
  const client = getGroqClient(userApiKey);
  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 8192,
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      yield text;
    }
  }
}

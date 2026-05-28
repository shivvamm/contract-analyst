import { Mistral } from "@mistralai/mistralai";
import { extractJSON } from "@/lib/llm/extract-json";

const MODEL = "mistral-small-latest";

function getMistralClient(userApiKey?: string): Mistral {
  const apiKey = userApiKey || process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("No Mistral API key available. Please provide your own API key.");
  }
  return new Mistral({ apiKey });
}

export async function generateJSON<T>(prompt: string, userApiKey?: string): Promise<T> {
  const client = getMistralClient(userApiKey);
  const response = await client.chat.complete({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    responseFormat: { type: "json_object" },
  });

  const text = response.choices?.[0]?.message?.content;
  if (!text || typeof text !== "string") {
    throw new Error("Empty response from Mistral");
  }

  return JSON.parse(extractJSON(text)) as T;
}

export async function* generateStream(prompt: string, userApiKey?: string): AsyncGenerator<string> {
  const client = getMistralClient(userApiKey);
  const stream = await client.chat.stream({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  for await (const event of stream) {
    const text = event.data?.choices?.[0]?.delta?.content;
    if (text && typeof text === "string") {
      yield text;
    }
  }
}

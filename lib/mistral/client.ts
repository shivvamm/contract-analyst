import { Mistral } from "@mistralai/mistralai";

let cachedClient: Mistral | null = null;
let cachedKey: string | null = null;

const MODEL = "mistral-small-latest";

function getMistralClient(userApiKey?: string): Mistral {
  const apiKey = userApiKey || process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("No Mistral API key available. Please provide your own API key.");
  }
  if (cachedClient && cachedKey === apiKey) {
    return cachedClient;
  }
  cachedClient = new Mistral({ apiKey });
  cachedKey = apiKey;
  return cachedClient;
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

  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
    text.match(/\{[\s\S]*\}/) ||
    text.match(/\[[\s\S]*\]/);

  if (!jsonMatch) {
    throw new Error("Failed to parse JSON response from Mistral");
  }

  const jsonStr = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonStr) as T;
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

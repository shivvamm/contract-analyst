import Groq from "groq-sdk";

let cachedClient: Groq | null = null;
let cachedKey: string | null = null;

const MODEL = "llama-3.3-70b-versatile";

function getGroqClient(userApiKey?: string): Groq {
  const apiKey = userApiKey || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("No Groq API key available. Please provide your own API key.");
  }
  if (cachedClient && cachedKey === apiKey) {
    return cachedClient;
  }
  cachedClient = new Groq({ apiKey });
  cachedKey = apiKey;
  return cachedClient;
}

export async function generateJSON<T>(prompt: string, userApiKey?: string): Promise<T> {
  const client = getGroqClient(userApiKey);
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 8192,
  });

  const text = response.choices[0]?.message?.content || "";

  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
    text.match(/\{[\s\S]*\}/) ||
    text.match(/\[[\s\S]*\]/);

  if (!jsonMatch) {
    throw new Error("Failed to parse JSON response from Groq");
  }

  const jsonStr = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonStr) as T;
}

export async function* generateStream(prompt: string, userApiKey?: string): AsyncGenerator<string> {
  const client = getGroqClient(userApiKey);
  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      yield text;
    }
  }
}

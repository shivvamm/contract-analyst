import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json() as { apiKey?: string };

    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      return NextResponse.json({ error: "No API key provided" }, { status: 400 });
    }

    const client = new GoogleGenerativeAI(apiKey.trim());
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Minimal prompt — cheapest possible call just to confirm the key works
    await model.generateContent("Hi");

    return NextResponse.json({ valid: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isInvalid =
      message.includes("API_KEY_INVALID") ||
      message.includes("400") ||
      message.includes("403") ||
      message.toLowerCase().includes("invalid api key") ||
      message.toLowerCase().includes("api key not valid");

    return NextResponse.json(
      { valid: false, error: isInvalid ? "Invalid API key" : message },
      { status: isInvalid ? 401 : 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/llm/provider";
import { buildSideBySidePrompt, buildMatrixPrompt } from "@/lib/gemini/prompts";
import type { SideBySideResult, MatrixResult } from "@/types";

export async function POST(request: NextRequest) {
  const userApiKey = request.headers.get("x-gemini-api-key") || undefined;
  const language = request.headers.get("x-output-language") || "English";

  try {
    const body = await request.json();
    const { mode, contracts } = body;

    if (!contracts || contracts.length < 2) {
      return NextResponse.json({ error: "At least 2 contracts required for comparison" }, { status: 400 });
    }

    if (mode === "side-by-side" && contracts.length === 2) {
      const result = await generateJSON<SideBySideResult & { recommendation: string }>(
        buildSideBySidePrompt(
          JSON.stringify(contracts[0].keyTerms), JSON.stringify(contracts[1].keyTerms),
          JSON.stringify(contracts[0].risks), JSON.stringify(contracts[1].risks),
          contracts[0].name, contracts[1].name, language
        ), userApiKey
      );
      return NextResponse.json({
        mode: "side-by-side",
        sideBySide: { betterInA: result.betterInA, betterInB: result.betterInB, missingInA: result.missingInA, missingInB: result.missingInB, riskDifferences: result.riskDifferences },
        recommendation: result.recommendation,
      });
    }

    const contractData = contracts.map((c: { name: string; keyTerms: unknown; risks: unknown }) => ({
      name: c.name, terms: JSON.stringify(c.keyTerms), risks: JSON.stringify(c.risks),
    }));
    const result = await generateJSON<MatrixResult>(buildMatrixPrompt(contractData, language), userApiKey);
    return NextResponse.json({ mode: "matrix", matrix: result, recommendation: "" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Comparison failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { generateJSON } from "@/lib/gemini/client";
import {
  buildExtractionPrompt,
  buildRiskPrompt,
  buildCompliancePrompt,
  buildSummaryPrompt,
  buildSuggestedQuestionsPrompt,
} from "@/lib/gemini/prompts";
import type {
  ContractChunk,
  KeyTerms,
  Risk,
  ComplianceFinding,
  ContractSummary,
} from "@/types";

export interface PipelineCallbacks {
  onProgress: (stage: string, percent: number) => void;
  onExtraction: (keyTerms: KeyTerms) => void;
  onRisks: (risks: Risk[]) => void;
  onCompliance: (findings: ComplianceFinding[]) => void;
  onSummary: (summary: ContractSummary) => void;
  onSuggestedQuestions: (questions: string[]) => void;
}

export async function runPipeline(
  chunks: ContractChunk[],
  language: string,
  callbacks: PipelineCallbacks,
  userApiKey?: string,
  retries: number = 2
): Promise<void> {
  callbacks.onProgress("extracting", 10);

  // Pass 1 and Pass 2 run in parallel
  const [keyTerms, risksResult] = await Promise.all([
    retryable(
      () => generateJSON<KeyTerms>(buildExtractionPrompt(chunks, language), userApiKey),
      retries
    ),
    retryable(
      () => generateJSON<{ risks: Risk[] }>(buildRiskPrompt(chunks, language), userApiKey),
      retries
    ),
  ]);

  callbacks.onExtraction(keyTerms);
  callbacks.onProgress("analyzing-risks", 40);

  callbacks.onRisks(risksResult.risks);
  callbacks.onProgress("checking-compliance", 55);

  const keyTermsJson = JSON.stringify(keyTerms);
  const risksJson = JSON.stringify(risksResult.risks);

  // Pass 3: depends on Pass 1
  const complianceResult = await retryable(
    () => generateJSON<{ compliance: ComplianceFinding[] }>(
      buildCompliancePrompt(chunks, keyTermsJson, language), userApiKey
    ),
    retries
  );

  callbacks.onCompliance(complianceResult.compliance);
  callbacks.onProgress("summarizing", 75);

  // Pass 4: depends on Pass 1 + 2
  const summary = await retryable(
    () => generateJSON<ContractSummary>(
      buildSummaryPrompt(chunks, keyTermsJson, risksJson, language), userApiKey
    ),
    retries
  );

  callbacks.onSummary(summary);
  callbacks.onProgress("generating-questions", 90);

  const questions = await retryable(
    () => generateJSON<string[]>(
      buildSuggestedQuestionsPrompt(keyTermsJson, risksJson, language), userApiKey
    ),
    retries
  );

  callbacks.onSuggestedQuestions(questions);
  callbacks.onProgress("complete", 100);
}

async function retryable<T>(fn: () => Promise<T>, maxRetries: number): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

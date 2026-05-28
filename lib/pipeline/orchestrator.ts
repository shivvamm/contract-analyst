import { generateJSON, getProvider } from "@/lib/llm/provider";
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
  onProgress: (stage: string, percent: number, message?: string) => void;
  onExtraction: (keyTerms: KeyTerms) => void;
  onRisks: (risks: Risk[]) => void;
  onCompliance: (findings: ComplianceFinding[]) => void;
  onSummary: (summary: ContractSummary) => void;
  onSuggestedQuestions: (questions: string[]) => void;
}

const GEMINI_FREE_TIER_DELAY_MS = 5000;

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("429") || msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("resource has been exhausted");
}

async function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function getFreeTierDelay(): number {
  const provider = getProvider();
  if (provider === "groq" || provider === "mistral") return 0;
  return GEMINI_FREE_TIER_DELAY_MS;
}

export async function runPipeline(
  chunks: ContractChunk[],
  language: string,
  callbacks: PipelineCallbacks,
  userApiKey?: string,
  retries: number = 3
): Promise<void> {
  const usingFreeTier = !userApiKey;
  const freeTierDelay = getFreeTierDelay();

  callbacks.onProgress("extracting", 10);

  const retryNotify = (stage: string) => (msg: string) => callbacks.onProgress(stage, -1, msg);

  // Pass 1: Key Terms Extraction
  const keyTerms = await retryable(
    () => generateJSON<KeyTerms>(buildExtractionPrompt(chunks, language), userApiKey),
    retries,
    retryNotify("extracting"),
  );

  callbacks.onExtraction(keyTerms);
  callbacks.onProgress("analyzing-risks", 30);

  if (usingFreeTier && freeTierDelay > 0) await delay(freeTierDelay);

  // Pass 2: Risk Analysis
  const risksResult = await retryable(
    () => generateJSON<{ risks: Risk[] }>(buildRiskPrompt(chunks, language), userApiKey),
    retries,
    retryNotify("analyzing-risks"),
  );

  const risks = Array.isArray(risksResult?.risks) ? risksResult.risks : [];
  callbacks.onRisks(risks);
  callbacks.onProgress("checking-compliance", 50);

  if (usingFreeTier && freeTierDelay > 0) await delay(freeTierDelay);

  const keyTermsJson = JSON.stringify(keyTerms);
  const risksJson = JSON.stringify(risks);

  // Pass 3: Compliance Check
  const complianceResult = await retryable(
    () => generateJSON<{ compliance: ComplianceFinding[] }>(
      buildCompliancePrompt(chunks, keyTermsJson, language), userApiKey
    ),
    retries,
    retryNotify("checking-compliance"),
  );

  const compliance = Array.isArray(complianceResult?.compliance) ? complianceResult.compliance : [];
  callbacks.onCompliance(compliance);
  callbacks.onProgress("summarizing", 70);

  if (usingFreeTier && freeTierDelay > 0) await delay(freeTierDelay);

  // Pass 4: Summary
  const summary = await retryable(
    () => generateJSON<ContractSummary>(
      buildSummaryPrompt(chunks, keyTermsJson, risksJson, language), userApiKey
    ),
    retries,
    retryNotify("summarizing"),
  );

  callbacks.onSummary(summary);
  callbacks.onProgress("generating-questions", 90);

  if (usingFreeTier && freeTierDelay > 0) await delay(freeTierDelay);

  // Pass 5: Suggested Questions
  const questions = await retryable(
    () => generateJSON<string[]>(
      buildSuggestedQuestionsPrompt(keyTermsJson, risksJson, language), userApiKey
    ),
    retries,
    retryNotify("generating-questions"),
  );

  const safeQuestions = Array.isArray(questions) ? questions : [];
  callbacks.onSuggestedQuestions(safeQuestions);
  callbacks.onProgress("complete", 100);
}

async function retryable<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  onRetryWait?: (message: string) => void,
): Promise<T> {
  const provider = getProvider();
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        let backoff: number;
        if (isRateLimitError(err)) {
          backoff = provider === "groq"
            ? 60000 * (attempt + 1)
            : 15000 * (attempt + 1);
        } else {
          backoff = 2000 * (attempt + 1);
        }
        if (onRetryWait) {
          const secs = Math.ceil(backoff / 1000);
          onRetryWait(`Rate limit hit — retrying in ${secs}s (attempt ${attempt + 2}/${maxRetries + 1})`);
        }
        await delay(backoff);
      }
    }
  }
  throw lastError;
}

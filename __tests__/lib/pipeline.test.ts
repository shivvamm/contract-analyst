import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/gemini/client", () => ({
  generateJSON: vi.fn(),
}));

import { runPipeline, PipelineCallbacks } from "@/lib/pipeline/orchestrator";
import { generateJSON } from "@/lib/gemini/client";
import type { ContractChunk } from "@/types";

const mockChunks: ContractChunk[] = [
  {
    id: "chunk-1",
    text: "ARTICLE 1: This is a test contract between Party A and Party B.",
    pageNumbers: [1],
    sectionTitle: "ARTICLE 1",
    index: 0,
  },
];

const mockKeyTerms = {
  parties: [{ name: "Party A", role: "Buyer" }],
  effectiveDates: [],
  paymentTerms: [],
  obligations: [],
  terminationConditions: [],
  confidentialityClauses: [],
  jurisdiction: null,
  governingLaw: null,
};

const mockRisks = { risks: [] };
const mockCompliance = { compliance: [] };
const mockSummary = {
  layer1: "A test contract.",
  layer2: ["Bullet 1"],
  layer3: [{ title: "Section 1", content: "Details", pageNumbers: [1] }],
};
const mockQuestions = ["What are the payment terms?"];

describe("runPipeline", () => {
  it("executes all four passes and returns results", async () => {
    const mockedGenerate = vi.mocked(generateJSON);
    mockedGenerate
      .mockResolvedValueOnce(mockKeyTerms)
      .mockResolvedValueOnce(mockRisks)
      .mockResolvedValueOnce(mockCompliance)
      .mockResolvedValueOnce(mockSummary)
      .mockResolvedValueOnce(mockQuestions);

    const callbacks: PipelineCallbacks = {
      onProgress: vi.fn(),
      onExtraction: vi.fn(),
      onRisks: vi.fn(),
      onCompliance: vi.fn(),
      onSummary: vi.fn(),
      onSuggestedQuestions: vi.fn(),
    };

    await runPipeline(mockChunks, "English", callbacks, "test-key");

    expect(callbacks.onProgress).toHaveBeenCalledWith("extracting", 10);
    expect(callbacks.onExtraction).toHaveBeenCalledWith(mockKeyTerms);
    expect(callbacks.onRisks).toHaveBeenCalledWith(mockRisks.risks);
    expect(callbacks.onCompliance).toHaveBeenCalledWith(mockCompliance.compliance);
    expect(callbacks.onSummary).toHaveBeenCalledWith(mockSummary);
    expect(callbacks.onSuggestedQuestions).toHaveBeenCalledWith(mockQuestions);
  });
});

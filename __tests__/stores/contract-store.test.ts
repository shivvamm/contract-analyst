import { describe, it, expect, beforeEach } from "vitest";
import { useContractStore } from "@/stores/contract-store";

describe("contract-store", () => {
  beforeEach(() => {
    useContractStore.getState().reset();
  });

  it("adds a contract", () => {
    const store = useContractStore.getState();
    store.addContract({
      id: "test-1",
      fileName: "test.pdf",
      fileType: "pdf",
      uploadedAt: Date.now(),
      pageCount: 0,
      rawText: "",
      chunks: [],
      analysis: {
        status: "idle",
        progress: 0,
        keyTerms: null,
        risks: [],
        compliance: [],
        summary: null,
        error: null,
      },
      chat: { messages: [], suggestedQuestions: [] },
    });
    expect(store.contracts).toHaveLength(1);
    expect(store.contracts[0].id).toBe("test-1");
  });

  it("sets active contract", () => {
    const store = useContractStore.getState();
    store.addContract({
      id: "test-1",
      fileName: "test.pdf",
      fileType: "pdf",
      uploadedAt: Date.now(),
      pageCount: 0,
      rawText: "",
      chunks: [],
      analysis: {
        status: "idle",
        progress: 0,
        keyTerms: null,
        risks: [],
        compliance: [],
        summary: null,
        error: null,
      },
      chat: { messages: [], suggestedQuestions: [] },
    });
    store.setActiveContract("test-1");
    expect(store.activeContractId).toBe("test-1");
  });

  it("updates analysis for a contract", () => {
    const store = useContractStore.getState();
    store.addContract({
      id: "test-1",
      fileName: "test.pdf",
      fileType: "pdf",
      uploadedAt: Date.now(),
      pageCount: 0,
      rawText: "",
      chunks: [],
      analysis: {
        status: "idle",
        progress: 0,
        keyTerms: null,
        risks: [],
        compliance: [],
        summary: null,
        error: null,
      },
      chat: { messages: [], suggestedQuestions: [] },
    });
    store.updateAnalysis("test-1", { status: "extracting", progress: 25 });
    const contract = store.contracts.find((c) => c.id === "test-1");
    expect(contract?.analysis.status).toBe("extracting");
    expect(contract?.analysis.progress).toBe(25);
  });

  it("adds chat message to a contract", () => {
    const store = useContractStore.getState();
    store.addContract({
      id: "test-1",
      fileName: "test.pdf",
      fileType: "pdf",
      uploadedAt: Date.now(),
      pageCount: 0,
      rawText: "",
      chunks: [],
      analysis: {
        status: "idle",
        progress: 0,
        keyTerms: null,
        risks: [],
        compliance: [],
        summary: null,
        error: null,
      },
      chat: { messages: [], suggestedQuestions: [] },
    });
    store.addChatMessage("test-1", {
      id: "msg-1",
      role: "user",
      content: "What is this contract about?",
      sources: [],
      timestamp: Date.now(),
    });
    const contract = store.contracts.find((c) => c.id === "test-1");
    expect(contract?.chat.messages).toHaveLength(1);
  });

  it("removes a contract", () => {
    const store = useContractStore.getState();
    store.addContract({
      id: "test-1",
      fileName: "test.pdf",
      fileType: "pdf",
      uploadedAt: Date.now(),
      pageCount: 0,
      rawText: "",
      chunks: [],
      analysis: {
        status: "idle",
        progress: 0,
        keyTerms: null,
        risks: [],
        compliance: [],
        summary: null,
        error: null,
      },
      chat: { messages: [], suggestedQuestions: [] },
    });
    store.removeContract("test-1");
    expect(store.contracts).toHaveLength(0);
  });

  it("updates settings", () => {
    const store = useContractStore.getState();
    store.updateSettings({ geminiApiKey: "test-key-123" });
    expect(store.settings.geminiApiKey).toBe("test-key-123");
  });

  it("adds a comparison", () => {
    const store = useContractStore.getState();
    store.addComparison({
      id: "cmp-1",
      contractIds: ["test-1", "test-2"],
      mode: "side-by-side",
      sideBySide: null,
      matrix: null,
      recommendation: "",
      createdAt: Date.now(),
    });
    expect(store.comparisons).toHaveLength(1);
  });
});

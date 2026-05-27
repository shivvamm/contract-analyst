import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Contract,
  ContractAnalysis,
  ChatMessage,
  ComparisonResult,
  AppSettings,
} from "@/types";

interface ContractStore {
  contracts: Contract[];
  comparisons: ComparisonResult[];
  activeContractId: string | null;
  settings: AppSettings;

  addContract: (contract: Contract) => void;
  removeContract: (id: string) => void;
  setActiveContract: (id: string | null) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  updateAnalysis: (contractId: string, updates: Partial<ContractAnalysis>) => void;
  addChatMessage: (contractId: string, message: ChatMessage) => void;
  setSuggestedQuestions: (contractId: string, questions: string[]) => void;
  addComparison: (comparison: ComparisonResult) => void;
  removeComparison: (id: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  reset: () => void;
}

const initialSettings: AppSettings = {
  geminiApiKey: "",
  outputLanguage: "English",
  disclaimerAcknowledged: false,
};

const storeImpl = create<ContractStore>()(
  persist(
    (set) => ({
      contracts: [],
      comparisons: [],
      activeContractId: null,
      settings: initialSettings,

      addContract: (contract) =>
        set((state) => ({
          contracts: [...state.contracts, contract],
          activeContractId: contract.id,
        })),

      removeContract: (id) =>
        set((state) => ({
          contracts: state.contracts.filter((c) => c.id !== id),
          activeContractId: state.activeContractId === id ? null : state.activeContractId,
        })),

      setActiveContract: (id) => set({ activeContractId: id }),

      updateContract: (id, updates) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      updateAnalysis: (contractId, updates) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === contractId
              ? { ...c, analysis: { ...c.analysis, ...updates } }
              : c
          ),
        })),

      addChatMessage: (contractId, message) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === contractId
              ? { ...c, chat: { ...c.chat, messages: [...c.chat.messages, message] } }
              : c
          ),
        })),

      setSuggestedQuestions: (contractId, questions) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === contractId
              ? { ...c, chat: { ...c.chat, suggestedQuestions: questions } }
              : c
          ),
        })),

      addComparison: (comparison) =>
        set((state) => ({
          comparisons: [...state.comparisons, comparison],
        })),

      removeComparison: (id) =>
        set((state) => ({
          comparisons: state.comparisons.filter((c) => c.id !== id),
        })),

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      reset: () =>
        set({
          contracts: [],
          comparisons: [],
          activeContractId: null,
          settings: initialSettings,
        }),
    }),
    {
      name: "contract-analyst-storage",
      storage: createJSONStorage(() => ({
        getItem: (key: string) => {
          try { return localStorage.getItem(key); } catch { return null; }
        },
        setItem: (key: string, value: string) => {
          try { localStorage.setItem(key, value); } catch { /* quota exceeded — silently skip */ }
        },
        removeItem: (key: string) => {
          try { localStorage.removeItem(key); } catch { /* ignore */ }
        },
      })),
      // Keep rawText so chat still works after page reload, but cap at 200k chars
      // to avoid blowing localStorage quota. Chunks are large and regenerable, so drop them.
      partialize: (state) => ({
        contracts: state.contracts.map((c) => ({
          ...c,
          rawText:
            c.rawText.length > 200_000
              ? c.rawText.slice(0, 200_000) + "\n\n[…truncated for storage]"
              : c.rawText,
          chunks: [],
        })),
        comparisons: state.comparisons,
        settings: state.settings,
        activeContractId: state.activeContractId,
      }),
    }
  )
);

// Wrap getState to return a live proxy so that state reads always reflect current store state.
// This allows test patterns like:
//   const store = useContractStore.getState();
//   store.addContract(...);
//   expect(store.contracts).toHaveLength(1); // reads live state
const originalGetState = storeImpl.getState.bind(storeImpl);

const liveProxy = new Proxy({} as ContractStore, {
  get(_target, prop: string | symbol) {
    const current = originalGetState();
    const value = (current as unknown as Record<string | symbol, unknown>)[prop];
    // Return functions bound to the store, data properties from current state
    if (typeof value === "function") {
      return value;
    }
    return value;
  },
});

const patchedGetState = (): ContractStore => liveProxy;

export const useContractStore = Object.assign(storeImpl, {
  getState: patchedGetState,
});

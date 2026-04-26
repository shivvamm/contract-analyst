# Contract Analyst Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page Next.js app that analyzes contracts of any type/length via the Gemini API, serving both experts and beginners through progressive disclosure.

**Architecture:** Multi-pass pipeline (extract → risks → compliance → summary) with streaming results. Next.js App Router handles both UI (React) and backend (API routes). Zustand + localStorage for client state persistence. Miro-inspired design system with Roobert PRO / Noto Sans typography and pastel section backgrounds.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, @google/generative-ai, pdf-parse, tesseract.js, mammoth, Zustand, jspdf, xlsx, Tailwind CSS, Vitest

**Design Spec:** `docs/superpowers/specs/2026-04-26-contract-analyst-design.md`

---

## File Structure

```
contract-analyst/
├── app/
│   ├── page.tsx                          # Main SPA — switches between 3 states
│   ├── layout.tsx                        # Root layout, fonts, providers
│   ├── globals.css                       # Tailwind + Miro design tokens
│   └── api/
│       ├── analyze/route.ts              # File parse + pipeline SSE stream
│       ├── chat/route.ts                 # Q&A with contract context
│       ├── compare/route.ts              # Side-by-side / matrix comparison
│       └── export/route.ts              # PDF / Excel generation
├── components/
│   ├── landing/
│   │   ├── HeroSection.tsx               # Hero heading + subtitle
│   │   ├── DropZone.tsx                  # Drag-and-drop file upload
│   │   ├── FileCard.tsx                  # Uploaded file queue item
│   │   ├── TextPasteTab.tsx              # Paste raw text alternative
│   │   └── ApiKeyInput.tsx              # Collapsible API key input
│   ├── analysis/
│   │   ├── AnalysisView.tsx              # Orchestrates progress → dashboard transition
│   │   ├── ProgressBar.tsx              # Percentage progress with pass labels
│   │   ├── SummaryPanel.tsx             # 3-layer expandable summary (teal)
│   │   ├── RiskPanel.tsx                # Risk cards sorted by severity (coral)
│   │   ├── KeyTermsPanel.tsx            # Grouped term grid (orange)
│   │   └── CompliancePanel.tsx          # Compliance findings list (pink)
│   ├── chat/
│   │   ├── ChatSidebar.tsx              # Collapsible right panel
│   │   └── ChatMessage.tsx              # Single chat message bubble
│   ├── comparison/
│   │   ├── ComparisonView.tsx           # Routes to SideBySide or Matrix
│   │   ├── SideBySide.tsx               # 2-contract diff columns
│   │   └── ComparisonMatrix.tsx         # Multi-contract table
│   ├── layout/
│   │   ├── ContractSidebar.tsx          # Left sidebar: contract list
│   │   └── TopBar.tsx                   # Contract name, actions, export
│   └── common/
│       ├── SeverityBadge.tsx            # High/Medium/Low pill
│       ├── StatusBadge.tsx              # Compliant/Warning/Non-compliant
│       ├── DisclaimerDialog.tsx         # First-use legal acknowledgment
│       └── ExportButtons.tsx            # PDF + Excel export triggers
├── lib/
│   ├── gemini/
│   │   ├── client.ts                    # Gemini SDK wrapper with dual-key support
│   │   ├── prompts.ts                   # All 4 pipeline pass prompts
│   │   └── chunker.ts                  # Section-aware text chunking
│   ├── parsers/
│   │   ├── pdf-parser.ts               # pdf-parse text extraction
│   │   ├── docx-parser.ts              # mammoth DOCX extraction
│   │   ├── ocr-parser.ts               # tesseract.js OCR
│   │   └── index.ts                    # Auto-detect format + route to parser
│   ├── pipeline/
│   │   └── orchestrator.ts             # 4-pass pipeline with parallel execution
│   └── export/
│       ├── pdf-generator.ts            # jspdf report builder
│       └── excel-generator.ts          # xlsx multi-sheet export
├── hooks/
│   ├── useAnalysis.ts                   # Upload + SSE streaming + store updates
│   ├── useChat.ts                       # Chat SSE streaming
│   └── useComparison.ts               # Comparison trigger + store updates
├── stores/
│   └── contract-store.ts              # Zustand + localStorage persistence
├── types/
│   └── index.ts                        # All shared TypeScript types
└── __tests__/
    ├── lib/
    │   ├── chunker.test.ts
    │   ├── parsers.test.ts
    │   └── pipeline.test.ts
    └── stores/
        └── contract-store.test.ts
```

---

## Task 1: Project Scaffolding & Design System

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.ts`
- Create: `app/globals.css`, `app/layout.tsx`
- Create: `.env.local`, `.env.example`, `.gitignore`
- Create: `public/fonts/` (font files)
- Create: `vitest.config.ts`

- [ ] **Step 1: Initialize Next.js project**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src=no --import-alias "@/*" --use-npm
```

Accept defaults. This creates the base Next.js project with App Router and Tailwind.

- [ ] **Step 2: Install all dependencies**

```bash
npm install @google/generative-ai pdf-parse tesseract.js mammoth zustand jspdf xlsx uuid
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @types/pdf-parse @types/uuid
```

- [ ] **Step 3: Create .env.example and .env.local**

`.env.example`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

`.env.local`:
```
GEMINI_API_KEY=
```

- [ ] **Step 4: Add Miro design system to globals.css**

Replace `app/globals.css` with:

```css
@import "tailwindcss";

@theme {
  /* Miro-inspired color tokens */
  --color-near-black: #1c1c1e;
  --color-surface: #ffffff;
  --color-blue-450: #5b76fe;
  --color-blue-pressed: #2a41b6;
  --color-success: #00b473;
  --color-slate: #555a6a;
  --color-placeholder: #a5a8b5;
  --color-border: #c7cad5;
  --color-ring: rgb(224, 226, 232);
  --color-input-border: #e9eaef;

  /* Pastel section backgrounds */
  --color-teal-light: #c3faf5;
  --color-teal-dark: #187574;
  --color-coral-light: #ffc6c6;
  --color-coral-dark: #600000;
  --color-orange-light: #ffe6cd;
  --color-yellow-dark: #746019;
  --color-pink-light: #fde0f0;
  --color-red-light: #fbd4d4;

  /* Radius scale */
  --radius-button: 8px;
  --radius-card: 12px;
  --radius-panel: 20px;
  --radius-container: 24px;
  --radius-large: 40px;
  --radius-pill: 50px;

  /* Font families */
  --font-display: "Roobert PRO Medium", sans-serif;
  --font-display-semibold: "Roobert PRO SemiBold", sans-serif;
  --font-body: "Noto Sans", sans-serif;
}

/* Ring shadow utility */
.ring-miro {
  box-shadow: rgb(224, 226, 232) 0px 0px 0px 1px;
}

/* OpenType features for Roobert PRO */
.font-display {
  font-family: var(--font-display);
  font-feature-settings: "blwf", "cv03", "cv04", "cv09", "cv11";
}

/* OpenType features for Noto Sans */
.font-body {
  font-family: var(--font-body);
  font-feature-settings: "liga" 0, "ss01", "ss04", "ss05";
}

/* Typography scale */
.text-hero {
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -1.68px;
  font-feature-settings: "blwf", "cv03", "cv04", "cv09", "cv11";
}

.text-section {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -1.44px;
  font-feature-settings: "blwf", "cv03", "cv04", "cv09", "cv11";
}

.text-card-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.72px;
  font-feature-settings: "blwf", "cv03", "cv04", "cv09", "cv11";
}

.text-subheading {
  font-family: var(--font-body);
  font-size: 22px;
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: -0.44px;
  font-feature-settings: "liga" 0, "ss01", "ss04", "ss05";
}

.text-feature {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.35;
  font-feature-settings: "blwf", "cv03", "cv04", "cv09", "cv11";
}

.text-body-lg {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 400;
  line-height: 1.45;
  font-feature-settings: "liga" 0, "ss01", "ss04", "ss05";
}

.text-body {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.50;
  letter-spacing: -0.16px;
  font-feature-settings: "liga" 0, "ss01", "ss04", "ss05";
}

.text-button {
  font-family: var(--font-display);
  font-size: 17.5px;
  font-weight: 700;
  line-height: 1.29;
  letter-spacing: 0.175px;
  font-feature-settings: "blwf", "cv03", "cv04", "cv09", "cv11";
}

.text-caption {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.71;
  font-feature-settings: "blwf", "cv03", "cv04", "cv09", "cv11";
}

.text-small {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.36px;
  font-feature-settings: "blwf", "cv03", "cv04", "cv09", "cv11";
}

.text-micro {
  font-family: var(--font-display);
  font-size: 10.5px;
  font-weight: 400;
  line-height: 0.90;
  text-transform: uppercase;
  font-feature-settings: "blwf", "cv03", "cv04", "cv09", "cv11";
}
```

- [ ] **Step 5: Download and configure fonts**

Download Noto Sans from Google Fonts. For Roobert PRO (commercial font), use a fallback system:

Create `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

const roobert = localFont({
  src: [
    {
      path: "../public/fonts/RoobertPRO-Medium.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/RoobertPRO-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/RoobertPRO-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-roobert",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Contract Analyst — AI-Powered Contract Analysis",
  description:
    "Analyze any contract in seconds. Extract key terms, identify risks, check compliance, and get plain-English summaries.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${notoSans.variable} ${roobert.variable}`}>
      <body className="bg-surface text-near-black font-body antialiased">
        {children}
      </body>
    </html>
  );
}
```

Note: Place Roobert PRO `.woff2` files in `public/fonts/`. If you don't have the commercial font, the fallback chain (`system-ui`, `sans-serif`) will apply. The app will still look clean — the layout and colors carry the design.

- [ ] **Step 6: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

Add to `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 7: Update .gitignore**

Append to `.gitignore`:

```
.env.local
.env
node_modules/
.next/
```

- [ ] **Step 8: Verify setup compiles**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Miro design system"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: Create all shared types**

Create `types/index.ts`:

```ts
export interface ContractChunk {
  id: string;
  text: string;
  pageNumbers: number[];
  sectionTitle: string | null;
  index: number;
}

export interface KeyTerms {
  parties: Party[];
  effectiveDates: DateTerm[];
  paymentTerms: PaymentTerm[];
  obligations: Obligation[];
  terminationConditions: string[];
  confidentialityClauses: string[];
  jurisdiction: string | null;
  governingLaw: string | null;
}

export interface Party {
  name: string;
  role: string;
}

export interface DateTerm {
  type: "effective" | "expiration" | "renewal" | "other";
  date: string;
  description: string;
}

export interface PaymentTerm {
  amount: string;
  schedule: string;
  penalties: string | null;
  description: string;
}

export interface Obligation {
  party: string;
  description: string;
  clause: string;
  pageNumber: number | null;
}

export interface Risk {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  clause: string;
  pageNumber: number | null;
  category: string;
}

export interface ComplianceFinding {
  id: string;
  status: "compliant" | "warning" | "non-compliant";
  title: string;
  description: string;
  standard: string;
  clause: string | null;
  pageNumber: number | null;
}

export interface ContractSummary {
  layer1: string;
  layer2: string[];
  layer3: SectionBreakdown[];
}

export interface SectionBreakdown {
  title: string;
  content: string;
  pageNumbers: number[];
}

export type AnalysisStatus =
  | "idle"
  | "parsing"
  | "extracting"
  | "analyzing-risks"
  | "checking-compliance"
  | "summarizing"
  | "complete"
  | "error";

export interface ContractAnalysis {
  status: AnalysisStatus;
  progress: number;
  keyTerms: KeyTerms | null;
  risks: Risk[];
  compliance: ComplianceFinding[];
  summary: ContractSummary | null;
  error: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: SourceReference[];
  timestamp: number;
}

export interface SourceReference {
  clause: string;
  pageNumber: number | null;
}

export interface Contract {
  id: string;
  fileName: string;
  fileType: "pdf" | "docx" | "image" | "text";
  uploadedAt: number;
  pageCount: number;
  rawText: string;
  chunks: ContractChunk[];
  analysis: ContractAnalysis;
  chat: {
    messages: ChatMessage[];
    suggestedQuestions: string[];
  };
}

export type ComparisonMode = "side-by-side" | "matrix";

export interface ComparisonResult {
  id: string;
  contractIds: string[];
  mode: ComparisonMode;
  sideBySide: SideBySideResult | null;
  matrix: MatrixResult | null;
  recommendation: string;
  createdAt: number;
}

export interface SideBySideResult {
  betterInA: DiffItem[];
  betterInB: DiffItem[];
  missingInA: string[];
  missingInB: string[];
  riskDifferences: RiskDiff[];
}

export interface DiffItem {
  term: string;
  valueA: string;
  valueB: string;
  explanation: string;
}

export interface RiskDiff {
  title: string;
  severityA: "high" | "medium" | "low" | "none";
  severityB: "high" | "medium" | "low" | "none";
  explanation: string;
}

export interface MatrixResult {
  dimensions: string[];
  rows: MatrixRow[];
}

export interface MatrixRow {
  dimension: string;
  values: MatrixCell[];
}

export interface MatrixCell {
  contractId: string;
  value: string;
  favorability: "good" | "neutral" | "bad";
  clauseText: string;
}

export interface AppSettings {
  geminiApiKey: string;
  outputLanguage: string;
  disclaimerAcknowledged: boolean;
}

export interface AnalyzeSSEEvent {
  type:
    | "parsing"
    | "progress"
    | "extraction"
    | "risks"
    | "compliance"
    | "summary"
    | "suggested-questions"
    | "complete"
    | "error";
  data: unknown;
}

export interface ParseResult {
  rawText: string;
  chunks: ContractChunk[];
  pageCount: number;
}

export interface ChatSSEEvent {
  type: "token" | "sources" | "done" | "error";
  data: unknown;
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add types/index.ts
git commit -m "feat: add all shared TypeScript types"
```

---

## Task 3: Zustand Store with localStorage Persistence

**Files:**
- Create: `stores/contract-store.ts`
- Test: `__tests__/stores/contract-store.test.ts`

- [ ] **Step 1: Write failing test for store**

Create `__tests__/stores/contract-store.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/stores/contract-store.test.ts
```

Expected: FAIL — module `@/stores/contract-store` not found.

- [ ] **Step 3: Implement the Zustand store**

Create `stores/contract-store.ts`:

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  updateAnalysis: (
    contractId: string,
    updates: Partial<ContractAnalysis>
  ) => void;
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

export const useContractStore = create<ContractStore>()(
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
          activeContractId:
            state.activeContractId === id ? null : state.activeContractId,
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
              ? {
                  ...c,
                  chat: { ...c.chat, messages: [...c.chat.messages, message] },
                }
              : c
          ),
        })),

      setSuggestedQuestions: (contractId, questions) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === contractId
              ? {
                  ...c,
                  chat: { ...c.chat, suggestedQuestions: questions },
                }
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
      partialize: (state) => ({
        contracts: state.contracts.map((c) => ({
          ...c,
          rawText: "",
          chunks: [],
        })),
        comparisons: state.comparisons,
        settings: state.settings,
        activeContractId: state.activeContractId,
      }),
    }
  )
);
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- __tests__/stores/contract-store.test.ts
```

Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add stores/contract-store.ts __tests__/stores/contract-store.test.ts
git commit -m "feat: add Zustand store with localStorage persistence"
```

---

## Task 4: Text Chunker

**Files:**
- Create: `lib/gemini/chunker.ts`
- Test: `__tests__/lib/chunker.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/lib/chunker.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { chunkText } from "@/lib/gemini/chunker";

describe("chunkText", () => {
  it("splits by section headings when structure detected", () => {
    const text = `ARTICLE 1: DEFINITIONS
This section defines terms.

ARTICLE 2: OBLIGATIONS
The parties shall perform obligations.

ARTICLE 3: PAYMENT
Payment is due net 30.`;

    const chunks = chunkText(text, 12000);
    expect(chunks.length).toBe(3);
    expect(chunks[0].sectionTitle).toBe("ARTICLE 1: DEFINITIONS");
    expect(chunks[1].sectionTitle).toBe("ARTICLE 2: OBLIGATIONS");
    expect(chunks[2].sectionTitle).toBe("ARTICLE 3: PAYMENT");
  });

  it("falls back to token-based chunking when no structure", () => {
    const longText = "word ".repeat(5000);
    const chunks = chunkText(longText, 1000);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeLessThanOrEqual(1200);
    }
  });

  it("preserves overlap between token-based chunks", () => {
    const longText = "word ".repeat(3000);
    const chunks = chunkText(longText, 1000, 200);
    if (chunks.length > 1) {
      const end0 = chunks[0].text.slice(-100);
      const start1 = chunks[1].text.slice(0, 100);
      expect(chunks[1].text).toContain(end0.trim().split(" ").pop());
    }
  });

  it("returns single chunk for short text", () => {
    const text = "This is a short contract.";
    const chunks = chunkText(text, 12000);
    expect(chunks.length).toBe(1);
    expect(chunks[0].text).toBe(text);
  });

  it("assigns page numbers from markers", () => {
    const text = `[PAGE 1]
First page content.

[PAGE 2]
Second page content.

[PAGE 3]
Third page content.`;

    const chunks = chunkText(text, 12000);
    expect(chunks[0].pageNumbers).toContain(1);
  });

  it("detects numbered section patterns", () => {
    const text = `Section 1. General Provisions
Some text here.

Section 2. Scope of Work
More text here.

Section 3. Compensation
Payment details.`;

    const chunks = chunkText(text, 12000);
    expect(chunks.length).toBe(3);
    expect(chunks[0].sectionTitle).toContain("Section 1");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/lib/chunker.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the chunker**

Create `lib/gemini/chunker.ts`:

```ts
import { v4 as uuid } from "uuid";
import type { ContractChunk } from "@/types";

const SECTION_PATTERNS = [
  /^(ARTICLE\s+\d+[.:]\s*.+)$/gm,
  /^(Section\s+\d+[.:]\s*.+)$/gm,
  /^(SECTION\s+\d+[.:]\s*.+)$/gm,
  /^(CLAUSE\s+\d+[.:]\s*.+)$/gm,
  /^(\d+\.\s+[A-Z][A-Z\s]+)$/gm,
  /^(\d+\.\d+\s+[A-Z].+)$/gm,
  /^(SCHEDULE\s+[A-Z0-9]+[.:]\s*.+)$/gm,
  /^(EXHIBIT\s+[A-Z0-9]+[.:]\s*.+)$/gm,
  /^(APPENDIX\s+[A-Z0-9]+[.:]\s*.+)$/gm,
];

const PAGE_MARKER = /\[PAGE\s+(\d+)\]/g;

function extractPageNumbers(text: string): number[] {
  const pages: number[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(PAGE_MARKER.source, "g");
  while ((match = regex.exec(text)) !== null) {
    pages.push(parseInt(match[1], 10));
  }
  return pages.length > 0 ? pages : [1];
}

function findSectionSplits(text: string): { title: string; start: number }[] {
  const splits: { title: string; start: number }[] = [];

  for (const pattern of SECTION_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      splits.push({ title: match[1].trim(), start: match.index });
    }
  }

  splits.sort((a, b) => a.start - b.start);

  const deduplicated: typeof splits = [];
  for (const split of splits) {
    if (
      deduplicated.length === 0 ||
      split.start - deduplicated[deduplicated.length - 1].start > 50
    ) {
      deduplicated.push(split);
    }
  }

  return deduplicated;
}

function chunkByTokenSize(
  text: string,
  maxChars: number,
  overlapChars: number
): ContractChunk[] {
  const chunks: ContractChunk[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length);

    if (end < text.length) {
      const lastSpace = text.lastIndexOf(" ", end);
      if (lastSpace > start) {
        end = lastSpace;
      }
    }

    const chunkText = text.slice(start, end).trim();
    if (chunkText.length > 0) {
      chunks.push({
        id: uuid(),
        text: chunkText,
        pageNumbers: extractPageNumbers(chunkText),
        sectionTitle: null,
        index: chunks.length,
      });
    }

    start = end - overlapChars;
    if (start <= (chunks.length > 0 ? end - maxChars + overlapChars : 0)) {
      start = end;
    }
  }

  return chunks;
}

export function chunkText(
  text: string,
  maxCharsPerChunk: number = 12000,
  overlapChars: number = 800
): ContractChunk[] {
  const sections = findSectionSplits(text);

  if (sections.length >= 2) {
    const chunks: ContractChunk[] = [];

    for (let i = 0; i < sections.length; i++) {
      const start = sections[i].start;
      const end = i + 1 < sections.length ? sections[i + 1].start : text.length;
      const sectionText = text.slice(start, end).trim();

      if (sectionText.length <= maxCharsPerChunk) {
        chunks.push({
          id: uuid(),
          text: sectionText,
          pageNumbers: extractPageNumbers(sectionText),
          sectionTitle: sections[i].title,
          index: chunks.length,
        });
      } else {
        const subChunks = chunkByTokenSize(
          sectionText,
          maxCharsPerChunk,
          overlapChars
        );
        subChunks.forEach((sub, j) => {
          sub.sectionTitle =
            j === 0
              ? sections[i].title
              : `${sections[i].title} (continued)`;
          sub.index = chunks.length + j;
        });
        chunks.push(...subChunks);
      }
    }

    const preContent = text.slice(0, sections[0].start).trim();
    if (preContent.length > 0) {
      chunks.unshift({
        id: uuid(),
        text: preContent,
        pageNumbers: extractPageNumbers(preContent),
        sectionTitle: "Preamble",
        index: 0,
      });
      chunks.forEach((c, i) => (c.index = i));
    }

    return chunks;
  }

  if (text.length <= maxCharsPerChunk) {
    return [
      {
        id: uuid(),
        text,
        pageNumbers: extractPageNumbers(text),
        sectionTitle: null,
        index: 0,
      },
    ];
  }

  return chunkByTokenSize(text, maxCharsPerChunk, overlapChars);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- __tests__/lib/chunker.test.ts
```

Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/gemini/chunker.ts __tests__/lib/chunker.test.ts
git commit -m "feat: add section-aware text chunker"
```

---

## Task 5: Document Parsers

**Files:**
- Create: `lib/parsers/pdf-parser.ts`
- Create: `lib/parsers/docx-parser.ts`
- Create: `lib/parsers/ocr-parser.ts`
- Create: `lib/parsers/index.ts`
- Test: `__tests__/lib/parsers.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/lib/parsers.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { detectFileType, parseTextInput } from "@/lib/parsers";

describe("detectFileType", () => {
  it("detects PDF files", () => {
    expect(detectFileType("contract.pdf", "application/pdf")).toBe("pdf");
  });

  it("detects DOCX files", () => {
    expect(
      detectFileType(
        "contract.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ).toBe("docx");
  });

  it("detects image files", () => {
    expect(detectFileType("scan.png", "image/png")).toBe("image");
    expect(detectFileType("scan.jpg", "image/jpeg")).toBe("image");
  });

  it("defaults to text for unknown types", () => {
    expect(detectFileType("file.txt", "text/plain")).toBe("text");
  });
});

describe("parseTextInput", () => {
  it("returns text directly with page markers", () => {
    const result = parseTextInput("Hello contract world");
    expect(result.rawText).toBe("Hello contract world");
    expect(result.pageCount).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/lib/parsers.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement PDF parser**

Create `lib/parsers/pdf-parser.ts`:

```ts
import pdfParse from "pdf-parse";

export interface PdfParseResult {
  rawText: string;
  pageCount: number;
  hasExtractableText: boolean;
}

export async function parsePdf(buffer: Buffer): Promise<PdfParseResult> {
  const data = await pdfParse(buffer);

  const pageTexts: string[] = [];
  const pages = data.text.split(/\f/);

  for (let i = 0; i < pages.length; i++) {
    const pageText = pages[i].trim();
    if (pageText.length > 0) {
      pageTexts.push(`[PAGE ${i + 1}]\n${pageText}`);
    }
  }

  const rawText = pageTexts.join("\n\n");
  const hasExtractableText = rawText.replace(/\[PAGE \d+\]/g, "").trim().length > 50;

  return {
    rawText,
    pageCount: data.numpages,
    hasExtractableText,
  };
}
```

- [ ] **Step 4: Implement DOCX parser**

Create `lib/parsers/docx-parser.ts`:

```ts
import mammoth from "mammoth";

export interface DocxParseResult {
  rawText: string;
  pageCount: number;
}

export async function parseDocx(buffer: Buffer): Promise<DocxParseResult> {
  const result = await mammoth.extractRawText({ buffer });
  const rawText = result.value;
  const estimatedPages = Math.max(1, Math.ceil(rawText.length / 3000));

  return {
    rawText: `[PAGE 1]\n${rawText}`,
    pageCount: estimatedPages,
  };
}
```

- [ ] **Step 5: Implement OCR parser**

Create `lib/parsers/ocr-parser.ts`:

```ts
import Tesseract from "tesseract.js";

export interface OcrParseResult {
  rawText: string;
  pageCount: number;
  confidence: number;
}

export async function parseImageOcr(
  buffer: Buffer,
  mimeType: string
): Promise<OcrParseResult> {
  const base64 = buffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64}`;

  const {
    data: { text, confidence },
  } = await Tesseract.recognize(dataUri, "eng");

  return {
    rawText: `[PAGE 1]\n${text.trim()}`,
    pageCount: 1,
    confidence,
  };
}

export async function ocrPdfPages(
  buffer: Buffer,
  pageCount: number
): Promise<OcrParseResult> {
  // For scanned PDFs, we convert each page to an image and OCR it.
  // In practice this requires pdf-to-image conversion (e.g. pdf-poppler or pdfjs-dist).
  // For MVP, we attempt pdf-parse first and only fall back to this for very low-text pages.
  // This function handles the case where individual page images are provided.
  const {
    data: { text, confidence },
  } = await Tesseract.recognize(buffer, "eng");

  return {
    rawText: `[PAGE 1]\n${text.trim()}`,
    pageCount: pageCount || 1,
    confidence,
  };
}
```

- [ ] **Step 6: Implement auto-detection router**

Create `lib/parsers/index.ts`:

```ts
import { parsePdf } from "./pdf-parser";
import { parseDocx } from "./docx-parser";
import { parseImageOcr } from "./ocr-parser";
import type { Contract } from "@/types";

export type FileType = Contract["fileType"];

export function detectFileType(fileName: string, mimeType: string): FileType {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".pdf") || mimeType === "application/pdf") {
    return "pdf";
  }
  if (
    lower.endsWith(".docx") ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }
  if (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    mimeType.startsWith("image/")
  ) {
    return "image";
  }

  return "text";
}

export function parseTextInput(text: string): {
  rawText: string;
  pageCount: number;
} {
  return {
    rawText: text,
    pageCount: 1,
  };
}

export async function parseFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ rawText: string; pageCount: number; ocrWarning?: string }> {
  const fileType = detectFileType(fileName, mimeType);

  switch (fileType) {
    case "pdf": {
      const pdfResult = await parsePdf(buffer);

      if (!pdfResult.hasExtractableText) {
        const ocrResult = await parseImageOcr(buffer, "application/pdf");
        return {
          rawText: ocrResult.rawText,
          pageCount: pdfResult.pageCount,
          ocrWarning:
            ocrResult.confidence < 60
              ? "Some pages had low text quality — results may be incomplete"
              : undefined,
        };
      }

      return {
        rawText: pdfResult.rawText,
        pageCount: pdfResult.pageCount,
      };
    }

    case "docx": {
      const docxResult = await parseDocx(buffer);
      return {
        rawText: docxResult.rawText,
        pageCount: docxResult.pageCount,
      };
    }

    case "image": {
      const ocrResult = await parseImageOcr(buffer, mimeType);
      return {
        rawText: ocrResult.rawText,
        pageCount: ocrResult.pageCount,
        ocrWarning:
          ocrResult.confidence < 60
            ? "Some pages had low text quality — results may be incomplete"
            : undefined,
      };
    }

    default:
      throw new Error(`Unsupported file type: ${fileName}`);
  }
}
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
npm test -- __tests__/lib/parsers.test.ts
```

Expected: All 5 tests PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/parsers/ __tests__/lib/parsers.test.ts
git commit -m "feat: add document parsers with auto-detection"
```

---

## Task 6: Gemini Client & Prompts

**Files:**
- Create: `lib/gemini/client.ts`
- Create: `lib/gemini/prompts.ts`

- [ ] **Step 1: Create Gemini client with dual-key support**

Create `lib/gemini/client.ts`:

```ts
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

let cachedClient: GoogleGenerativeAI | null = null;
let cachedKey: string | null = null;

export function getGeminiClient(userApiKey?: string): GoogleGenerativeAI {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "No Gemini API key available. Please provide your own API key."
    );
  }

  if (cachedClient && cachedKey === apiKey) {
    return cachedClient;
  }

  cachedClient = new GoogleGenerativeAI(apiKey);
  cachedKey = apiKey;
  return cachedClient;
}

export function getModel(
  userApiKey?: string,
  modelName: string = "gemini-2.0-flash"
): GenerativeModel {
  const client = getGeminiClient(userApiKey);
  return client.getGenerativeModel({ model: modelName });
}

export async function generateJSON<T>(
  prompt: string,
  userApiKey?: string
): Promise<T> {
  const model = getModel(userApiKey);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
    text.match(/\{[\s\S]*\}/) ||
    text.match(/\[[\s\S]*\]/);

  if (!jsonMatch) {
    throw new Error("Failed to parse JSON response from Gemini");
  }

  const jsonStr = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonStr) as T;
}

export async function* generateStream(
  prompt: string,
  userApiKey?: string
): AsyncGenerator<string> {
  const model = getModel(userApiKey);
  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}
```

- [ ] **Step 2: Create all pipeline prompts**

Create `lib/gemini/prompts.ts`:

```ts
import type { ContractChunk } from "@/types";

export function buildExtractionPrompt(
  chunks: ContractChunk[],
  language: string
): string {
  const text = chunks.map((c) => c.text).join("\n\n---\n\n");

  return `You are a contract analysis expert. Extract all key terms from the following contract text.

Respond in ${language}. Return ONLY valid JSON with this exact structure:
\`\`\`json
{
  "parties": [{ "name": "string", "role": "string" }],
  "effectiveDates": [{ "type": "effective|expiration|renewal|other", "date": "string", "description": "string" }],
  "paymentTerms": [{ "amount": "string", "schedule": "string", "penalties": "string or null", "description": "string" }],
  "obligations": [{ "party": "string", "description": "string", "clause": "string", "pageNumber": number or null }],
  "terminationConditions": ["string"],
  "confidentialityClauses": ["string"],
  "jurisdiction": "string or null",
  "governingLaw": "string or null"
}
\`\`\`

CONTRACT TEXT:
${text}`;
}

export function buildRiskPrompt(
  chunks: ContractChunk[],
  language: string
): string {
  const text = chunks.map((c) => c.text).join("\n\n---\n\n");

  return `You are a contract risk analyst. Analyze the following contract for risks and unfavorable terms.

Look for:
- One-sided indemnification clauses
- Unlimited liability exposure
- Auto-renewal traps
- Missing protections (no liability cap, no termination for convenience, no IP ownership clause)
- Penalty exposure and financial risk
- Ambiguous language that could be exploited

For each risk, assess severity as "high", "medium", or "low".

Respond in ${language}. Return ONLY valid JSON:
\`\`\`json
{
  "risks": [
    {
      "severity": "high|medium|low",
      "title": "Short risk title",
      "description": "Plain-English explanation of why this matters and what could go wrong",
      "clause": "The exact or paraphrased clause text",
      "pageNumber": number or null,
      "category": "liability|financial|termination|ip|confidentiality|compliance|other"
    }
  ]
}
\`\`\`

CONTRACT TEXT:
${text}`;
}

export function buildCompliancePrompt(
  chunks: ContractChunk[],
  keyTermsJson: string,
  language: string
): string {
  const text = chunks.map((c) => c.text).join("\n\n---\n\n");

  return `You are a contract compliance specialist. Check the following contract against standard compliance requirements.

Check against:
1. GDPR data handling requirements (if personal data is involved)
2. Standard contract law red flags (unconscionable terms, missing consideration, vague essential terms)
3. Industry best practices (clear dispute resolution, adequate notice periods, reasonable limitation of liability)

Previously extracted key terms for context:
${keyTermsJson}

For each finding, rate as "compliant", "warning", or "non-compliant".

Respond in ${language}. Return ONLY valid JSON:
\`\`\`json
{
  "compliance": [
    {
      "status": "compliant|warning|non-compliant",
      "title": "Short finding title",
      "description": "Explanation of the finding and its implications",
      "standard": "Which standard or best practice this relates to",
      "clause": "Relevant clause text or null",
      "pageNumber": number or null
    }
  ]
}
\`\`\`

CONTRACT TEXT:
${text}`;
}

export function buildSummaryPrompt(
  chunks: ContractChunk[],
  keyTermsJson: string,
  risksJson: string,
  language: string
): string {
  const text = chunks.map((c) => c.text).join("\n\n---\n\n");

  return `You are a contract summarization expert. Create a layered summary of the following contract.

Previously extracted data for context:
Key Terms: ${keyTermsJson}
Risks: ${risksJson}

Create three layers of summary:
- Layer 1: ONE sentence describing what this contract is about
- Layer 2: 3-5 bullet points covering the essential terms (who, what, when, how much, key obligations)
- Layer 3: Section-by-section detailed breakdown in plain English that a non-lawyer can understand

Respond in ${language}. Return ONLY valid JSON:
\`\`\`json
{
  "layer1": "One sentence summary",
  "layer2": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
  "layer3": [
    {
      "title": "Section title",
      "content": "Plain English explanation of this section",
      "pageNumbers": [1, 2]
    }
  ]
}
\`\`\`

CONTRACT TEXT:
${text}`;
}

export function buildSuggestedQuestionsPrompt(
  keyTermsJson: string,
  risksJson: string,
  language: string
): string {
  return `Based on the following contract analysis, suggest 5 follow-up questions a user might want to ask about this contract. Make them practical and specific to this contract's content.

Key Terms: ${keyTermsJson}
Risks: ${risksJson}

Respond in ${language}. Return ONLY a JSON array of strings:
\`\`\`json
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]
\`\`\``;
}

export function buildChatPrompt(
  question: string,
  contractText: string,
  analysisContext: string,
  chatHistory: string,
  language: string
): string {
  return `You are a contract analysis assistant. Answer the user's question based ONLY on the provided contract text and analysis.

RULES:
- Answer only from the provided contract text. Do not make up information.
- Cite specific sections, clauses, or page numbers when referencing the contract.
- If the contract doesn't address the question, say: "This contract doesn't appear to address that topic."
- Never give legal advice. If the question requires legal judgment, recommend consulting a qualified attorney.
- Be clear and concise. Use plain English.

Respond in ${language}.

ANALYSIS CONTEXT:
${analysisContext}

CONTRACT TEXT:
${contractText}

${chatHistory ? `CHAT HISTORY:\n${chatHistory}\n` : ""}
USER QUESTION: ${question}

Respond with your answer. At the end, include source references in this format:
[Sources: Section X (Page Y), Section Z (Page W)]`;
}

export function buildSideBySidePrompt(
  termsA: string,
  termsB: string,
  risksA: string,
  risksB: string,
  nameA: string,
  nameB: string,
  language: string
): string {
  return `You are a contract comparison expert. Compare these two contracts and identify differences.

CONTRACT A ("${nameA}"):
Key Terms: ${termsA}
Risks: ${risksA}

CONTRACT B ("${nameB}"):
Key Terms: ${termsB}
Risks: ${risksB}

Respond in ${language}. Return ONLY valid JSON:
\`\`\`json
{
  "betterInA": [{ "term": "string", "valueA": "string", "valueB": "string", "explanation": "string" }],
  "betterInB": [{ "term": "string", "valueA": "string", "valueB": "string", "explanation": "string" }],
  "missingInA": ["Terms present in B but missing from A"],
  "missingInB": ["Terms present in A but missing from B"],
  "riskDifferences": [{ "title": "string", "severityA": "high|medium|low|none", "severityB": "high|medium|low|none", "explanation": "string" }],
  "recommendation": "Overall plain-English recommendation on which contract is more favorable and why"
}
\`\`\``;
}

export function buildMatrixPrompt(
  contracts: { name: string; terms: string; risks: string }[],
  language: string
): string {
  const contractsText = contracts
    .map(
      (c, i) =>
        `CONTRACT ${i + 1} ("${c.name}"):\nKey Terms: ${c.terms}\nRisks: ${c.risks}`
    )
    .join("\n\n");

  return `You are a contract comparison expert. Create a comparison matrix for these contracts.

${contractsText}

Compare across these dimensions: Payment Terms, Liability Cap, Termination Notice Period, Auto-Renewal, Indemnification, Confidentiality Period, Dispute Resolution, Governing Law.

Respond in ${language}. Return ONLY valid JSON:
\`\`\`json
{
  "dimensions": ["Dimension names that were compared"],
  "rows": [
    {
      "dimension": "Dimension name",
      "values": [
        {
          "contractId": "Index (0-based) as string",
          "value": "The term value or 'Not specified'",
          "favorability": "good|neutral|bad",
          "clauseText": "Relevant clause excerpt"
        }
      ]
    }
  ]
}
\`\`\``;
}
```

- [ ] **Step 3: Verify files compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add lib/gemini/client.ts lib/gemini/prompts.ts
git commit -m "feat: add Gemini client and pipeline prompts"
```

---

## Task 7: Analysis Pipeline Orchestrator

**Files:**
- Create: `lib/pipeline/orchestrator.ts`
- Test: `__tests__/lib/pipeline.test.ts`

- [ ] **Step 1: Write failing test**

Create `__tests__/lib/pipeline.test.ts`:

```ts
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

    await runPipeline(mockChunks, "English", callbacks);

    expect(callbacks.onProgress).toHaveBeenCalledWith("extracting", 10);
    expect(callbacks.onExtraction).toHaveBeenCalledWith(mockKeyTerms);
    expect(callbacks.onRisks).toHaveBeenCalledWith(mockRisks.risks);
    expect(callbacks.onCompliance).toHaveBeenCalledWith(mockCompliance.compliance);
    expect(callbacks.onSummary).toHaveBeenCalledWith(mockSummary);
    expect(callbacks.onSuggestedQuestions).toHaveBeenCalledWith(mockQuestions);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/lib/pipeline.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the pipeline orchestrator**

Create `lib/pipeline/orchestrator.ts`:

```ts
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

  const [keyTerms, risksResult] = await Promise.all([
    retryable(
      () =>
        generateJSON<KeyTerms>(
          buildExtractionPrompt(chunks, language),
          userApiKey
        ),
      retries
    ),
    retryable(
      () =>
        generateJSON<{ risks: Risk[] }>(
          buildRiskPrompt(chunks, language),
          userApiKey
        ),
      retries
    ),
  ]);

  callbacks.onExtraction(keyTerms);
  callbacks.onProgress("analyzing-risks", 40);

  callbacks.onRisks(risksResult.risks);
  callbacks.onProgress("checking-compliance", 55);

  const keyTermsJson = JSON.stringify(keyTerms);
  const risksJson = JSON.stringify(risksResult.risks);

  const complianceResult = await retryable(
    () =>
      generateJSON<{ compliance: ComplianceFinding[] }>(
        buildCompliancePrompt(chunks, keyTermsJson, language),
        userApiKey
      ),
    retries
  );

  callbacks.onCompliance(complianceResult.compliance);
  callbacks.onProgress("summarizing", 75);

  const summary = await retryable(
    () =>
      generateJSON<ContractSummary>(
        buildSummaryPrompt(chunks, keyTermsJson, risksJson, language),
        userApiKey
      ),
    retries
  );

  callbacks.onSummary(summary);
  callbacks.onProgress("generating-questions", 90);

  const questions = await retryable(
    () =>
      generateJSON<string[]>(
        buildSuggestedQuestionsPrompt(keyTermsJson, risksJson, language),
        userApiKey
      ),
    retries
  );

  callbacks.onSuggestedQuestions(questions);
  callbacks.onProgress("complete", 100);
}

async function retryable<T>(
  fn: () => Promise<T>,
  maxRetries: number
): Promise<T> {
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- __tests__/lib/pipeline.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/pipeline/orchestrator.ts __tests__/lib/pipeline.test.ts
git commit -m "feat: add multi-pass analysis pipeline orchestrator"
```

---

## Task 8: Analyze API Route (SSE Streaming)

**Files:**
- Create: `app/api/analyze/route.ts`

- [ ] **Step 1: Create the analyze endpoint with SSE streaming**

Create `app/api/analyze/route.ts`:

```ts
import { NextRequest } from "next/server";
import { parseFile, parseTextInput } from "@/lib/parsers";
import { chunkText } from "@/lib/gemini/chunker";
import { runPipeline } from "@/lib/pipeline/orchestrator";

function sseEvent(type: string, data: unknown): string {
  return `data: ${JSON.stringify({ type, data })}\n\n`;
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  const userApiKey = request.headers.get("x-gemini-api-key") || undefined;
  const language = request.headers.get("x-output-language") || "English";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let rawText: string;
        let pageCount: number;
        let ocrWarning: string | undefined;

        if (contentType.includes("multipart/form-data")) {
          const formData = await request.formData();
          const file = formData.get("file") as File | null;

          if (!file) {
            controller.enqueue(
              new TextEncoder().encode(
                sseEvent("error", { message: "No file provided" })
              )
            );
            controller.close();
            return;
          }

          const buffer = Buffer.from(await file.arrayBuffer());

          controller.enqueue(
            new TextEncoder().encode(
              sseEvent("progress", { stage: "parsing", percent: 5 })
            )
          );

          const parseResult = await parseFile(buffer, file.name, file.type);
          rawText = parseResult.rawText;
          pageCount = parseResult.pageCount;
          ocrWarning = parseResult.ocrWarning;
        } else {
          const body = await request.json();
          const textResult = parseTextInput(body.text || "");
          rawText = textResult.rawText;
          pageCount = textResult.pageCount;
        }

        if (!rawText || rawText.trim().length === 0) {
          controller.enqueue(
            new TextEncoder().encode(
              sseEvent("error", {
                message:
                  "No text could be extracted. Try re-exporting the file or pasting text directly.",
              })
            )
          );
          controller.close();
          return;
        }

        const chunks = chunkText(rawText);

        controller.enqueue(
          new TextEncoder().encode(
            sseEvent("parsing", {
              rawText,
              chunks,
              pageCount,
              ocrWarning: ocrWarning || null,
            })
          )
        );

        await runPipeline(chunks, language, {
          onProgress: (stage, percent) => {
            controller.enqueue(
              new TextEncoder().encode(
                sseEvent("progress", { stage, percent })
              )
            );
          },
          onExtraction: (keyTerms) => {
            controller.enqueue(
              new TextEncoder().encode(sseEvent("extraction", keyTerms))
            );
          },
          onRisks: (risks) => {
            controller.enqueue(
              new TextEncoder().encode(sseEvent("risks", risks))
            );
          },
          onCompliance: (compliance) => {
            controller.enqueue(
              new TextEncoder().encode(sseEvent("compliance", compliance))
            );
          },
          onSummary: (summary) => {
            controller.enqueue(
              new TextEncoder().encode(sseEvent("summary", summary))
            );
          },
          onSuggestedQuestions: (questions) => {
            controller.enqueue(
              new TextEncoder().encode(
                sseEvent("suggested-questions", questions)
              )
            );
          },
        }, userApiKey);

        controller.enqueue(
          new TextEncoder().encode(sseEvent("complete", {}))
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Analysis failed";

        const isRateLimit =
          message.includes("429") ||
          message.toLowerCase().includes("rate limit") ||
          message.toLowerCase().includes("quota");

        controller.enqueue(
          new TextEncoder().encode(
            sseEvent("error", {
              message: isRateLimit
                ? "Free tier limit reached. Add your own Gemini API key to continue."
                : message,
              isRateLimit,
            })
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/analyze/route.ts
git commit -m "feat: add analyze API route with SSE streaming"
```

---

## Task 9: Chat API Route

**Files:**
- Create: `app/api/chat/route.ts`

- [ ] **Step 1: Create the chat endpoint with streaming**

Create `app/api/chat/route.ts`:

```ts
import { NextRequest } from "next/server";
import { generateStream } from "@/lib/gemini/client";
import { buildChatPrompt } from "@/lib/gemini/prompts";

function sseEvent(type: string, data: unknown): string {
  return `data: ${JSON.stringify({ type, data })}\n\n`;
}

export async function POST(request: NextRequest) {
  const userApiKey = request.headers.get("x-gemini-api-key") || undefined;
  const language = request.headers.get("x-output-language") || "English";

  const body = await request.json();
  const { question, contractText, analysisContext, chatHistory } = body;

  if (!question || !contractText) {
    return Response.json(
      { error: "Question and contract text are required" },
      { status: 400 }
    );
  }

  const prompt = buildChatPrompt(
    question,
    contractText,
    analysisContext || "",
    chatHistory || "",
    language
  );

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let fullResponse = "";

        for await (const token of generateStream(prompt, userApiKey)) {
          fullResponse += token;
          controller.enqueue(
            new TextEncoder().encode(sseEvent("token", token))
          );
        }

        const sourcesMatch = fullResponse.match(
          /\[Sources?:\s*(.*?)\]/i
        );
        if (sourcesMatch) {
          const sourcesStr = sourcesMatch[1];
          const sources = sourcesStr.split(",").map((s) => {
            const pageMatch = s.match(/Page\s+(\d+)/i);
            return {
              clause: s.trim(),
              pageNumber: pageMatch ? parseInt(pageMatch[1], 10) : null,
            };
          });
          controller.enqueue(
            new TextEncoder().encode(sseEvent("sources", sources))
          );
        }

        controller.enqueue(
          new TextEncoder().encode(sseEvent("done", {}))
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Chat failed";
        controller.enqueue(
          new TextEncoder().encode(sseEvent("error", { message }))
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/chat/route.ts
git commit -m "feat: add chat API route with streaming responses"
```

---

## Task 10: Compare API Route

**Files:**
- Create: `app/api/compare/route.ts`

- [ ] **Step 1: Create the comparison endpoint**

Create `app/api/compare/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini/client";
import {
  buildSideBySidePrompt,
  buildMatrixPrompt,
} from "@/lib/gemini/prompts";
import type { SideBySideResult, MatrixResult } from "@/types";

export async function POST(request: NextRequest) {
  const userApiKey = request.headers.get("x-gemini-api-key") || undefined;
  const language = request.headers.get("x-output-language") || "English";

  try {
    const body = await request.json();
    const { mode, contracts } = body;

    if (!contracts || contracts.length < 2) {
      return NextResponse.json(
        { error: "At least 2 contracts required for comparison" },
        { status: 400 }
      );
    }

    if (mode === "side-by-side" && contracts.length === 2) {
      const result = await generateJSON<
        SideBySideResult & { recommendation: string }
      >(
        buildSideBySidePrompt(
          JSON.stringify(contracts[0].keyTerms),
          JSON.stringify(contracts[1].keyTerms),
          JSON.stringify(contracts[0].risks),
          JSON.stringify(contracts[1].risks),
          contracts[0].name,
          contracts[1].name,
          language
        ),
        userApiKey
      );

      return NextResponse.json({
        mode: "side-by-side",
        sideBySide: {
          betterInA: result.betterInA,
          betterInB: result.betterInB,
          missingInA: result.missingInA,
          missingInB: result.missingInB,
          riskDifferences: result.riskDifferences,
        },
        recommendation: result.recommendation,
      });
    }

    const contractData = contracts.map(
      (c: { name: string; keyTerms: unknown; risks: unknown }) => ({
        name: c.name,
        terms: JSON.stringify(c.keyTerms),
        risks: JSON.stringify(c.risks),
      })
    );

    const result = await generateJSON<MatrixResult>(
      buildMatrixPrompt(contractData, language),
      userApiKey
    );

    return NextResponse.json({
      mode: "matrix",
      matrix: result,
      recommendation: "",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Comparison failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/compare/route.ts
git commit -m "feat: add compare API route for side-by-side and matrix modes"
```

---

## Task 11: Export API Route

**Files:**
- Create: `lib/export/pdf-generator.ts`
- Create: `lib/export/excel-generator.ts`
- Create: `app/api/export/route.ts`

- [ ] **Step 1: Create PDF generator**

Create `lib/export/pdf-generator.ts`:

```ts
import { jsPDF } from "jspdf";
import type {
  ContractAnalysis,
  KeyTerms,
  Risk,
  ComplianceFinding,
  ContractSummary,
} from "@/types";

export function generatePdfReport(
  fileName: string,
  analysis: ContractAnalysis,
  pageCount: number
): Buffer {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Contract Analysis Report", 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`File: ${fileName}`, 20, y);
  y += 5;
  doc.text(`Pages: ${pageCount}`, 20, y);
  y += 5;
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, y);
  y += 15;

  if (analysis.summary) {
    y = addSummarySection(doc, analysis.summary, y);
  }

  if (analysis.keyTerms) {
    y = addKeyTermsSection(doc, analysis.keyTerms, y);
  }

  if (analysis.risks.length > 0) {
    y = addRisksSection(doc, analysis.risks, y);
  }

  if (analysis.compliance.length > 0) {
    y = addComplianceSection(doc, analysis.compliance, y);
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const disclaimer =
    "This is an AI-powered analysis tool, not legal advice. Consult a qualified attorney for legal decisions.";
  const pageCountTotal = doc.getNumberOfPages();
  for (let i = 1; i <= pageCountTotal; i++) {
    doc.setPage(i);
    doc.text(disclaimer, 20, 285);
    doc.text(`Page ${i} of ${pageCountTotal}`, 170, 285);
  }

  return Buffer.from(doc.output("arraybuffer"));
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 270) {
    doc.addPage();
    return 20;
  }
  return y;
}

function addSummarySection(
  doc: jsPDF,
  summary: ContractSummary,
  y: number
): number {
  y = checkPageBreak(doc, y, 40);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 20, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(summary.layer1, 170);
  doc.text(lines, 20, y);
  y += lines.length * 6 + 5;

  doc.setFontSize(11);
  for (const bullet of summary.layer2) {
    y = checkPageBreak(doc, y, 10);
    const bulletLines = doc.splitTextToSize(`• ${bullet}`, 165);
    doc.text(bulletLines, 25, y);
    y += bulletLines.length * 5 + 3;
  }

  y += 10;
  return y;
}

function addKeyTermsSection(
  doc: jsPDF,
  terms: KeyTerms,
  y: number
): number {
  y = checkPageBreak(doc, y, 30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Key Terms", 20, y);
  y += 10;

  doc.setFontSize(10);

  if (terms.parties.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Parties:", 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    for (const party of terms.parties) {
      y = checkPageBreak(doc, y, 6);
      doc.text(`• ${party.name} (${party.role})`, 25, y);
      y += 6;
    }
    y += 4;
  }

  if (terms.jurisdiction) {
    y = checkPageBreak(doc, y, 6);
    doc.setFont("helvetica", "bold");
    doc.text("Jurisdiction:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(terms.jurisdiction, 55, y);
    y += 8;
  }

  if (terms.governingLaw) {
    y = checkPageBreak(doc, y, 6);
    doc.setFont("helvetica", "bold");
    doc.text("Governing Law:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(terms.governingLaw, 60, y);
    y += 8;
  }

  y += 10;
  return y;
}

function addRisksSection(doc: jsPDF, risks: Risk[], y: number): number {
  y = checkPageBreak(doc, y, 30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Risk Analysis", 20, y);
  y += 10;

  const sorted = [...risks].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  for (const risk of sorted) {
    y = checkPageBreak(doc, y, 25);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    const severityLabel = `[${risk.severity.toUpperCase()}]`;
    doc.text(`${severityLabel} ${risk.title}`, 20, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(risk.description, 165);
    doc.text(descLines, 25, y);
    y += descLines.length * 5 + 8;
  }

  return y;
}

function addComplianceSection(
  doc: jsPDF,
  findings: ComplianceFinding[],
  y: number
): number {
  y = checkPageBreak(doc, y, 30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Compliance Findings", 20, y);
  y += 10;

  for (const finding of findings) {
    y = checkPageBreak(doc, y, 25);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    const statusLabel = `[${finding.status.toUpperCase()}]`;
    doc.text(`${statusLabel} ${finding.title}`, 20, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(finding.description, 165);
    doc.text(descLines, 25, y);
    y += descLines.length * 5 + 8;
  }

  return y;
}
```

- [ ] **Step 2: Create Excel generator**

Create `lib/export/excel-generator.ts`:

```ts
import * as XLSX from "xlsx";
import type { ContractAnalysis } from "@/types";

export function generateExcelReport(
  fileName: string,
  analysis: ContractAnalysis
): Buffer {
  const wb = XLSX.utils.book_new();

  if (analysis.keyTerms) {
    const termsData: Record<string, string>[] = [];

    for (const party of analysis.keyTerms.parties) {
      termsData.push({
        Category: "Party",
        Name: party.name,
        Detail: party.role,
        Clause: "",
        Page: "",
      });
    }
    for (const date of analysis.keyTerms.effectiveDates) {
      termsData.push({
        Category: "Date",
        Name: date.type,
        Detail: `${date.date} — ${date.description}`,
        Clause: "",
        Page: "",
      });
    }
    for (const payment of analysis.keyTerms.paymentTerms) {
      termsData.push({
        Category: "Payment",
        Name: payment.amount,
        Detail: `${payment.schedule}${payment.penalties ? ` (Penalty: ${payment.penalties})` : ""}`,
        Clause: payment.description,
        Page: "",
      });
    }
    for (const obligation of analysis.keyTerms.obligations) {
      termsData.push({
        Category: "Obligation",
        Name: obligation.party,
        Detail: obligation.description,
        Clause: obligation.clause,
        Page: obligation.pageNumber?.toString() || "",
      });
    }

    if (analysis.keyTerms.jurisdiction) {
      termsData.push({
        Category: "Jurisdiction",
        Name: analysis.keyTerms.jurisdiction,
        Detail: "",
        Clause: "",
        Page: "",
      });
    }
    if (analysis.keyTerms.governingLaw) {
      termsData.push({
        Category: "Governing Law",
        Name: analysis.keyTerms.governingLaw,
        Detail: "",
        Clause: "",
        Page: "",
      });
    }

    const termsSheet = XLSX.utils.json_to_sheet(termsData);
    XLSX.utils.book_append_sheet(wb, termsSheet, "Key Terms");
  }

  if (analysis.risks.length > 0) {
    const risksData = analysis.risks.map((r) => ({
      Severity: r.severity.toUpperCase(),
      Title: r.title,
      Description: r.description,
      Category: r.category,
      Clause: r.clause,
      Page: r.pageNumber?.toString() || "",
    }));
    const risksSheet = XLSX.utils.json_to_sheet(risksData);
    XLSX.utils.book_append_sheet(wb, risksSheet, "Risks");
  }

  if (analysis.compliance.length > 0) {
    const complianceData = analysis.compliance.map((c) => ({
      Status: c.status.toUpperCase(),
      Title: c.title,
      Description: c.description,
      Standard: c.standard,
      Clause: c.clause || "",
      Page: c.pageNumber?.toString() || "",
    }));
    const complianceSheet = XLSX.utils.json_to_sheet(complianceData);
    XLSX.utils.book_append_sheet(wb, complianceSheet, "Compliance");
  }

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return Buffer.from(buf);
}

export function generateCsvReport(
  fileName: string,
  analysis: ContractAnalysis
): Buffer {
  const rows: Record<string, string>[] = [];

  for (const risk of analysis.risks) {
    rows.push({
      Type: "Risk",
      Severity: risk.severity,
      Title: risk.title,
      Description: risk.description,
      Clause: risk.clause,
      Page: risk.pageNumber?.toString() || "",
    });
  }

  for (const finding of analysis.compliance) {
    rows.push({
      Type: "Compliance",
      Severity: finding.status,
      Title: finding.title,
      Description: finding.description,
      Clause: finding.clause || "",
      Page: finding.pageNumber?.toString() || "",
    });
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Analysis");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "csv" });
  return Buffer.from(buf);
}
```

- [ ] **Step 3: Create the export API route**

Create `app/api/export/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { generatePdfReport } from "@/lib/export/pdf-generator";
import { generateExcelReport, generateCsvReport } from "@/lib/export/excel-generator";
import type { ContractAnalysis } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { format, fileName, analysis, pageCount } = body;

    if (!analysis || !format) {
      return NextResponse.json(
        { error: "Format and analysis data required" },
        { status: 400 }
      );
    }

    const typedAnalysis = analysis as ContractAnalysis;

    switch (format) {
      case "pdf": {
        const pdfBuffer = generatePdfReport(
          fileName || "contract",
          typedAnalysis,
          pageCount || 0
        );
        return new Response(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${fileName || "report"}-analysis.pdf"`,
          },
        });
      }

      case "xlsx": {
        const xlsxBuffer = generateExcelReport(
          fileName || "contract",
          typedAnalysis
        );
        return new Response(xlsxBuffer, {
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${fileName || "report"}-analysis.xlsx"`,
          },
        });
      }

      case "csv": {
        const csvBuffer = generateCsvReport(
          fileName || "contract",
          typedAnalysis
        );
        return new Response(csvBuffer, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${fileName || "report"}-analysis.csv"`,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: `Unsupported format: ${format}` },
          { status: 400 }
        );
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 4: Verify all files compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add lib/export/ app/api/export/route.ts
git commit -m "feat: add export generators and API route for PDF/Excel/CSV"
```

---

## Task 12: Client-Side Hooks

**Files:**
- Create: `hooks/useAnalysis.ts`
- Create: `hooks/useChat.ts`
- Create: `hooks/useComparison.ts`

- [ ] **Step 1: Create analysis hook**

Create `hooks/useAnalysis.ts`:

```ts
"use client";

import { useCallback } from "react";
import { v4 as uuid } from "uuid";
import { useContractStore } from "@/stores/contract-store";
import { detectFileType } from "@/lib/parsers";
import type { Contract, AnalyzeSSEEvent } from "@/types";

export function useAnalysis() {
  const { addContract, updateContract, updateAnalysis, setSuggestedQuestions, settings } =
    useContractStore();

  const analyzeFile = useCallback(
    async (file: File) => {
      const contractId = uuid();
      const fileType = detectFileType(file.name, file.type);

      const contract: Contract = {
        id: contractId,
        fileName: file.name,
        fileType,
        uploadedAt: Date.now(),
        pageCount: 0,
        rawText: "",
        chunks: [],
        analysis: {
          status: "parsing",
          progress: 0,
          keyTerms: null,
          risks: [],
          compliance: [],
          summary: null,
          error: null,
        },
        chat: { messages: [], suggestedQuestions: [] },
      };

      addContract(contract);

      const formData = new FormData();
      formData.append("file", file);

      const headers: Record<string, string> = {
        "x-output-language": settings.outputLanguage,
      };
      if (settings.geminiApiKey) {
        headers["x-gemini-api-key"] = settings.geminiApiKey;
      }

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers,
          body: formData,
        });

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6);
            const event: AnalyzeSSEEvent = JSON.parse(json);

            switch (event.type) {
              case "parsing": {
                const d = event.data as {
                  rawText: string;
                  chunks: Contract["chunks"];
                  pageCount: number;
                  ocrWarning: string | null;
                };
                updateContract(contractId, {
                  rawText: d.rawText,
                  chunks: d.chunks,
                  pageCount: d.pageCount,
                });
                break;
              }
              case "progress": {
                const d = event.data as { stage: string; percent: number };
                updateAnalysis(contractId, {
                  status: d.stage as Contract["analysis"]["status"],
                  progress: d.percent,
                });
                break;
              }
              case "extraction": {
                updateAnalysis(contractId, {
                  keyTerms: event.data as Contract["analysis"]["keyTerms"],
                });
                break;
              }
              case "risks": {
                updateAnalysis(contractId, {
                  risks: event.data as Contract["analysis"]["risks"],
                });
                break;
              }
              case "compliance": {
                updateAnalysis(contractId, {
                  compliance:
                    event.data as Contract["analysis"]["compliance"],
                });
                break;
              }
              case "summary": {
                updateAnalysis(contractId, {
                  summary: event.data as Contract["analysis"]["summary"],
                });
                break;
              }
              case "suggested-questions": {
                setSuggestedQuestions(
                  contractId,
                  event.data as string[]
                );
                break;
              }
              case "complete": {
                updateAnalysis(contractId, {
                  status: "complete",
                  progress: 100,
                });
                break;
              }
              case "error": {
                const d = event.data as { message: string };
                updateAnalysis(contractId, {
                  status: "error",
                  error: d.message,
                });
                break;
              }
            }
          }
        }
      } catch (err) {
        updateAnalysis(contractId, {
          status: "error",
          error:
            err instanceof Error ? err.message : "Analysis failed",
        });
      }

      return contractId;
    },
    [addContract, updateContract, updateAnalysis, setSuggestedQuestions, settings]
  );

  const analyzeText = useCallback(
    async (text: string) => {
      const contractId = uuid();

      const contract: Contract = {
        id: contractId,
        fileName: "Pasted Text",
        fileType: "text",
        uploadedAt: Date.now(),
        pageCount: 1,
        rawText: text,
        chunks: [],
        analysis: {
          status: "parsing",
          progress: 0,
          keyTerms: null,
          risks: [],
          compliance: [],
          summary: null,
          error: null,
        },
        chat: { messages: [], suggestedQuestions: [] },
      };

      addContract(contract);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-output-language": settings.outputLanguage,
      };
      if (settings.geminiApiKey) {
        headers["x-gemini-api-key"] = settings.geminiApiKey;
      }

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers,
          body: JSON.stringify({ text }),
        });

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6);
            const event: AnalyzeSSEEvent = JSON.parse(json);

            switch (event.type) {
              case "parsing": {
                const d = event.data as {
                  rawText: string;
                  chunks: Contract["chunks"];
                  pageCount: number;
                };
                updateContract(contractId, {
                  rawText: d.rawText,
                  chunks: d.chunks,
                  pageCount: d.pageCount,
                });
                break;
              }
              case "progress": {
                const d = event.data as { stage: string; percent: number };
                updateAnalysis(contractId, {
                  status: d.stage as Contract["analysis"]["status"],
                  progress: d.percent,
                });
                break;
              }
              case "extraction":
                updateAnalysis(contractId, {
                  keyTerms: event.data as Contract["analysis"]["keyTerms"],
                });
                break;
              case "risks":
                updateAnalysis(contractId, {
                  risks: event.data as Contract["analysis"]["risks"],
                });
                break;
              case "compliance":
                updateAnalysis(contractId, {
                  compliance: event.data as Contract["analysis"]["compliance"],
                });
                break;
              case "summary":
                updateAnalysis(contractId, {
                  summary: event.data as Contract["analysis"]["summary"],
                });
                break;
              case "suggested-questions":
                setSuggestedQuestions(contractId, event.data as string[]);
                break;
              case "complete":
                updateAnalysis(contractId, { status: "complete", progress: 100 });
                break;
              case "error": {
                const d = event.data as { message: string };
                updateAnalysis(contractId, { status: "error", error: d.message });
                break;
              }
            }
          }
        }
      } catch (err) {
        updateAnalysis(contractId, {
          status: "error",
          error: err instanceof Error ? err.message : "Analysis failed",
        });
      }

      return contractId;
    },
    [addContract, updateContract, updateAnalysis, setSuggestedQuestions, settings]
  );

  return { analyzeFile, analyzeText };
}
```

- [ ] **Step 2: Create chat hook**

Create `hooks/useChat.ts`:

```ts
"use client";

import { useCallback, useState } from "react";
import { v4 as uuid } from "uuid";
import { useContractStore } from "@/stores/contract-store";
import type { ChatMessage, ChatSSEEvent } from "@/types";

export function useChat() {
  const { contracts, activeContractId, addChatMessage, settings } =
    useContractStore();
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(
    async (question: string) => {
      if (!activeContractId) return;

      const contract = contracts.find((c) => c.id === activeContractId);
      if (!contract) return;

      const userMessage: ChatMessage = {
        id: uuid(),
        role: "user",
        content: question,
        sources: [],
        timestamp: Date.now(),
      };

      addChatMessage(activeContractId, userMessage);

      const assistantMessageId = uuid();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        sources: [],
        timestamp: Date.now(),
      };

      addChatMessage(activeContractId, assistantMessage);
      setIsStreaming(true);

      const chatHistory = contract.chat.messages
        .slice(-10)
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      const analysisContext = JSON.stringify({
        keyTerms: contract.analysis.keyTerms,
        risks: contract.analysis.risks,
        compliance: contract.analysis.compliance,
        summary: contract.analysis.summary,
      });

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-output-language": settings.outputLanguage,
      };
      if (settings.geminiApiKey) {
        headers["x-gemini-api-key"] = settings.geminiApiKey;
      }

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers,
          body: JSON.stringify({
            question,
            contractText: contract.rawText,
            analysisContext,
            chatHistory,
          }),
        });

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const event: ChatSSEEvent = JSON.parse(line.slice(6));

            switch (event.type) {
              case "token": {
                fullContent += event.data as string;
                const store = useContractStore.getState();
                const currentContract = store.contracts.find(
                  (c) => c.id === activeContractId
                );
                if (currentContract) {
                  const messages = currentContract.chat.messages.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: fullContent }
                      : m
                  );
                  store.updateContract(activeContractId, {
                    chat: { ...currentContract.chat, messages },
                  });
                }
                break;
              }
              case "sources": {
                const store = useContractStore.getState();
                const currentContract = store.contracts.find(
                  (c) => c.id === activeContractId
                );
                if (currentContract) {
                  const sources = event.data as ChatMessage["sources"];
                  const messages = currentContract.chat.messages.map((m) =>
                    m.id === assistantMessageId ? { ...m, sources } : m
                  );
                  store.updateContract(activeContractId, {
                    chat: { ...currentContract.chat, messages },
                  });
                }
                break;
              }
              case "error": {
                const d = event.data as { message: string };
                const store = useContractStore.getState();
                const currentContract = store.contracts.find(
                  (c) => c.id === activeContractId
                );
                if (currentContract) {
                  const messages = currentContract.chat.messages.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: `Error: ${d.message}` }
                      : m
                  );
                  store.updateContract(activeContractId, {
                    chat: { ...currentContract.chat, messages },
                  });
                }
                break;
              }
            }
          }
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Chat failed";
        const store = useContractStore.getState();
        const currentContract = store.contracts.find(
          (c) => c.id === activeContractId
        );
        if (currentContract) {
          const messages = currentContract.chat.messages.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: `Error: ${errorMsg}` }
              : m
          );
          store.updateContract(activeContractId, {
            chat: { ...currentContract.chat, messages },
          });
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [activeContractId, contracts, addChatMessage, settings]
  );

  return { sendMessage, isStreaming };
}
```

- [ ] **Step 3: Create comparison hook**

Create `hooks/useComparison.ts`:

```ts
"use client";

import { useCallback, useState } from "react";
import { v4 as uuid } from "uuid";
import { useContractStore } from "@/stores/contract-store";
import type { ComparisonMode, ComparisonResult } from "@/types";

export function useComparison() {
  const { contracts, addComparison, settings } = useContractStore();
  const [isComparing, setIsComparing] = useState(false);

  const compare = useCallback(
    async (contractIds: string[], mode: ComparisonMode) => {
      setIsComparing(true);

      const selectedContracts = contractIds
        .map((id) => contracts.find((c) => c.id === id))
        .filter(Boolean);

      if (selectedContracts.length < 2) {
        setIsComparing(false);
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-output-language": settings.outputLanguage,
      };
      if (settings.geminiApiKey) {
        headers["x-gemini-api-key"] = settings.geminiApiKey;
      }

      try {
        const response = await fetch("/api/compare", {
          method: "POST",
          headers,
          body: JSON.stringify({
            mode,
            contracts: selectedContracts.map((c) => ({
              name: c!.fileName,
              keyTerms: c!.analysis.keyTerms,
              risks: c!.analysis.risks,
            })),
          }),
        });

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        const comparison: ComparisonResult = {
          id: uuid(),
          contractIds,
          mode: result.mode,
          sideBySide: result.sideBySide || null,
          matrix: result.matrix || null,
          recommendation: result.recommendation || "",
          createdAt: Date.now(),
        };

        addComparison(comparison);
        return comparison.id;
      } catch (err) {
        console.error("Comparison failed:", err);
        throw err;
      } finally {
        setIsComparing(false);
      }
    },
    [contracts, addComparison, settings]
  );

  return { compare, isComparing };
}
```

- [ ] **Step 4: Verify hooks compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add hooks/
git commit -m "feat: add client-side hooks for analysis, chat, and comparison"
```

---

## Task 13: Common UI Components

**Files:**
- Create: `components/common/SeverityBadge.tsx`
- Create: `components/common/StatusBadge.tsx`
- Create: `components/common/DisclaimerDialog.tsx`
- Create: `components/common/ExportButtons.tsx`

- [ ] **Step 1: Create SeverityBadge**

Create `components/common/SeverityBadge.tsx`:

```tsx
interface SeverityBadgeProps {
  severity: "high" | "medium" | "low";
}

const styles = {
  high: "bg-coral-light text-coral-dark",
  medium: "bg-orange-light text-yellow-dark",
  low: "bg-teal-light text-teal-dark",
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-pill)] text-small font-semibold ${styles[severity]}`}
    >
      {severity.toUpperCase()}
    </span>
  );
}
```

- [ ] **Step 2: Create StatusBadge**

Create `components/common/StatusBadge.tsx`:

```tsx
interface StatusBadgeProps {
  status: "compliant" | "warning" | "non-compliant";
}

const styles = {
  compliant: "bg-[#d4f5e9] text-[#006644]",
  warning: "bg-orange-light text-yellow-dark",
  "non-compliant": "bg-coral-light text-coral-dark",
};

const icons = {
  compliant: "✓",
  warning: "⚠",
  "non-compliant": "✗",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-pill)] text-small font-semibold ${styles[status]}`}
    >
      <span>{icons[status]}</span>
      {status.replace("-", " ").toUpperCase()}
    </span>
  );
}
```

- [ ] **Step 3: Create DisclaimerDialog**

Create `components/common/DisclaimerDialog.tsx`:

```tsx
"use client";

import { useContractStore } from "@/stores/contract-store";

export function DisclaimerDialog() {
  const { settings, updateSettings } = useContractStore();

  if (settings.disclaimerAcknowledged) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-surface rounded-[var(--radius-container)] ring-miro p-8 max-w-lg mx-4">
        <h2 className="text-card-title text-near-black mb-4">
          Important Notice
        </h2>
        <p className="text-body text-slate mb-4">
          This is an AI-powered contract analysis tool. It is designed to assist
          with understanding contracts but does{" "}
          <strong>not constitute legal advice</strong>.
        </p>
        <p className="text-body text-slate mb-6">
          Always consult a qualified attorney before making legal decisions based
          on any analysis provided by this tool.
        </p>
        <button
          onClick={() => updateSettings({ disclaimerAcknowledged: true })}
          className="w-full bg-blue-450 text-white rounded-[var(--radius-button)] py-3 px-6 text-button hover:bg-blue-pressed transition-colors"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create ExportButtons**

Create `components/common/ExportButtons.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useContractStore } from "@/stores/contract-store";

interface ExportButtonsProps {
  contractId: string;
}

export function ExportButtons({ contractId }: ExportButtonsProps) {
  const { contracts } = useContractStore();
  const [exporting, setExporting] = useState<string | null>(null);

  const contract = contracts.find((c) => c.id === contractId);
  if (!contract || contract.analysis.status !== "complete") return null;

  const handleExport = async (format: "pdf" | "xlsx" | "csv") => {
    setExporting(format);

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          fileName: contract.fileName,
          analysis: contract.analysis,
          pageCount: contract.pageCount,
        }),
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const ext = format === "xlsx" ? "xlsx" : format;
      a.download = `${contract.fileName}-analysis.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport("pdf")}
        disabled={!!exporting}
        className="border border-border rounded-[var(--radius-button)] px-3 py-1.5 text-caption text-near-black hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {exporting === "pdf" ? "Exporting..." : "PDF"}
      </button>
      <button
        onClick={() => handleExport("xlsx")}
        disabled={!!exporting}
        className="border border-border rounded-[var(--radius-button)] px-3 py-1.5 text-caption text-near-black hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {exporting === "xlsx" ? "Exporting..." : "Excel"}
      </button>
      <button
        onClick={() => handleExport("csv")}
        disabled={!!exporting}
        className="border border-border rounded-[var(--radius-button)] px-3 py-1.5 text-caption text-near-black hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {exporting === "csv" ? "Exporting..." : "CSV"}
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/common/
git commit -m "feat: add common UI components (badges, disclaimer, export)"
```

---

## Task 14: Landing Page Components

**Files:**
- Create: `components/landing/HeroSection.tsx`
- Create: `components/landing/DropZone.tsx`
- Create: `components/landing/FileCard.tsx`
- Create: `components/landing/TextPasteTab.tsx`
- Create: `components/landing/ApiKeyInput.tsx`

- [ ] **Step 1: Create HeroSection**

Create `components/landing/HeroSection.tsx`:

```tsx
export function HeroSection() {
  return (
    <div className="text-center mb-12">
      <h1 className="text-hero text-near-black mb-4">
        Analyze any contract in seconds
      </h1>
      <p className="text-subheading text-slate max-w-2xl mx-auto">
        Upload a contract and get instant insights — key terms, risks,
        compliance checks, and plain-English summaries. Powered by AI,
        built for everyone.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create DropZone**

Create `components/landing/DropZone.tsx`:

```tsx
"use client";

import { useCallback, useState } from "react";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
}

export function DropZone({ onFiles }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFiles(files);
    },
    [onFiles]
  );

  const handleClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.docx,.doc,.png,.jpg,.jpeg,.txt";
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) onFiles(files);
    };
    input.click();
  }, [onFiles]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        relative cursor-pointer rounded-[var(--radius-container)] border-2 border-dashed
        transition-all duration-200 p-12 text-center
        ${
          isDragging
            ? "border-blue-450 bg-blue-450/5"
            : "border-border hover:border-blue-450/50 hover:bg-gray-50/50"
        }
      `}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-450/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-450"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <div>
          <p className="text-feature text-near-black">
            Drop your contracts here
          </p>
          <p className="text-body text-slate mt-1">
            or click to browse — PDF, DOCX, images, or text files
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create FileCard**

Create `components/landing/FileCard.tsx`:

```tsx
import type { Contract } from "@/types";

interface FileCardProps {
  fileName: string;
  fileType: Contract["fileType"];
  status: Contract["analysis"]["status"];
  progress: number;
  onRemove: () => void;
}

const typeIcons: Record<string, string> = {
  pdf: "PDF",
  docx: "DOC",
  image: "IMG",
  text: "TXT",
};

export function FileCard({
  fileName,
  fileType,
  status,
  progress,
  onRemove,
}: FileCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-[var(--radius-card)] ring-miro bg-surface">
      <div className="w-10 h-10 rounded-[var(--radius-button)] bg-blue-450/10 flex items-center justify-center text-small text-blue-450 font-semibold">
        {typeIcons[fileType] || "FILE"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium text-near-black truncate">
          {fileName}
        </p>
        {status !== "idle" && status !== "complete" && status !== "error" && (
          <div className="mt-1">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-450 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        {status === "complete" && (
          <p className="text-small text-success">Analysis complete</p>
        )}
        {status === "error" && (
          <p className="text-small text-coral-dark">Analysis failed</p>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="text-placeholder hover:text-near-black transition-colors p-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Create TextPasteTab**

Create `components/landing/TextPasteTab.tsx`:

```tsx
"use client";

import { useState } from "react";

interface TextPasteTabProps {
  onSubmit: (text: string) => void;
}

export function TextPasteTab({ onSubmit }: TextPasteTabProps) {
  const [text, setText] = useState("");

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your contract text here..."
        className="w-full h-48 p-4 rounded-[var(--radius-button)] border border-input-border bg-surface text-body text-near-black placeholder:text-placeholder resize-none focus:outline-none focus:border-blue-450 transition-colors"
      />
      <button
        onClick={() => {
          if (text.trim()) onSubmit(text.trim());
        }}
        disabled={!text.trim()}
        className="bg-blue-450 text-white rounded-[var(--radius-button)] py-3 px-6 text-button hover:bg-blue-pressed transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Analyze Text
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Create ApiKeyInput**

Create `components/landing/ApiKeyInput.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useContractStore } from "@/stores/contract-store";

export function ApiKeyInput() {
  const { settings, updateSettings } = useContractStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-caption text-slate hover:text-near-black transition-colors flex items-center gap-1"
      >
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {settings.geminiApiKey
          ? "API key configured"
          : "Using free tier — add your own Gemini key for unlimited analysis"}
      </button>

      {isOpen && (
        <div className="mt-3 flex gap-2">
          <input
            type="password"
            value={settings.geminiApiKey}
            onChange={(e) => updateSettings({ geminiApiKey: e.target.value })}
            placeholder="Enter your Gemini API key"
            className="flex-1 px-4 py-2 rounded-[var(--radius-button)] border border-input-border bg-surface text-body text-near-black placeholder:text-placeholder focus:outline-none focus:border-blue-450 transition-colors"
          />
          <select
            value={settings.outputLanguage}
            onChange={(e) =>
              updateSettings({ outputLanguage: e.target.value })
            }
            className="px-4 py-2 rounded-[var(--radius-button)] border border-input-border bg-surface text-body text-near-black focus:outline-none focus:border-blue-450 transition-colors"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Hindi">Hindi</option>
            <option value="Chinese">Chinese</option>
            <option value="Japanese">Japanese</option>
            <option value="Arabic">Arabic</option>
            <option value="Portuguese">Portuguese</option>
          </select>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/landing/
git commit -m "feat: add landing page components (hero, dropzone, file card, text paste, API key)"
```

---

## Task 15: Analysis Dashboard Components

**Files:**
- Create: `components/analysis/ProgressBar.tsx`
- Create: `components/analysis/SummaryPanel.tsx`
- Create: `components/analysis/RiskPanel.tsx`
- Create: `components/analysis/KeyTermsPanel.tsx`
- Create: `components/analysis/CompliancePanel.tsx`
- Create: `components/analysis/AnalysisView.tsx`

- [ ] **Step 1: Create ProgressBar**

Create `components/analysis/ProgressBar.tsx`:

```tsx
import type { AnalysisStatus } from "@/types";

interface ProgressBarProps {
  progress: number;
  status: AnalysisStatus;
}

const statusLabels: Record<string, string> = {
  parsing: "Parsing document...",
  extracting: "Extracting key terms...",
  "analyzing-risks": "Analyzing risks...",
  "checking-compliance": "Checking compliance...",
  summarizing: "Generating summary...",
  "generating-questions": "Preparing chat...",
  complete: "Analysis complete",
  error: "Analysis failed",
};

export function ProgressBar({ progress, status }: ProgressBarProps) {
  if (status === "idle" || status === "complete") return null;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <p className="text-feature text-near-black">
          {statusLabels[status] || "Processing..."}
        </p>
        <p className="text-caption text-slate">{Math.round(progress)}%</p>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-450 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create SummaryPanel**

Create `components/analysis/SummaryPanel.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { ContractSummary } from "@/types";

interface SummaryPanelProps {
  summary: ContractSummary;
}

export function SummaryPanel({ summary }: SummaryPanelProps) {
  const [expandedLevel, setExpandedLevel] = useState<1 | 2 | 3>(1);

  return (
    <div className="rounded-[var(--radius-card)] bg-teal-light p-6 ring-miro">
      <h3 className="text-card-title text-near-black mb-4">Summary</h3>

      <p className="text-body-lg text-near-black">{summary.layer1}</p>

      {expandedLevel >= 2 && (
        <ul className="mt-4 space-y-2">
          {summary.layer2.map((bullet, i) => (
            <li key={i} className="text-body text-near-black flex gap-2">
              <span className="text-teal-dark mt-0.5">&bull;</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      {expandedLevel >= 3 && (
        <div className="mt-6 space-y-4">
          {summary.layer3.map((section, i) => (
            <div key={i}>
              <h4 className="text-feature text-near-black">
                {section.title}
              </h4>
              <p className="text-body text-slate mt-1">{section.content}</p>
              {section.pageNumbers.length > 0 && (
                <p className="text-small text-teal-dark mt-1">
                  Pages: {section.pageNumbers.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {expandedLevel < 3 && (
          <button
            onClick={() =>
              setExpandedLevel((l) => Math.min(l + 1, 3) as 1 | 2 | 3)
            }
            className="text-caption text-blue-450 hover:text-blue-pressed transition-colors"
          >
            {expandedLevel === 1 ? "Show key points" : "Show detailed breakdown"}
          </button>
        )}
        {expandedLevel > 1 && (
          <button
            onClick={() => setExpandedLevel(1)}
            className="text-caption text-slate hover:text-near-black transition-colors"
          >
            Collapse
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create RiskPanel**

Create `components/analysis/RiskPanel.tsx`:

```tsx
"use client";

import { useState } from "react";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import type { Risk } from "@/types";

interface RiskPanelProps {
  risks: Risk[];
}

export function RiskPanel({ risks }: RiskPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...risks].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="rounded-[var(--radius-card)] bg-coral-light p-6 ring-miro">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-card-title text-near-black">Risks</h3>
        <span className="text-caption text-slate">
          {risks.filter((r) => r.severity === "high").length} high,{" "}
          {risks.filter((r) => r.severity === "medium").length} medium,{" "}
          {risks.filter((r) => r.severity === "low").length} low
        </span>
      </div>

      <div className="space-y-3">
        {sorted.map((risk) => (
          <div
            key={risk.id}
            className="bg-surface/80 rounded-[var(--radius-button)] p-4 cursor-pointer hover:bg-surface transition-colors"
            onClick={() =>
              setExpandedId(expandedId === risk.id ? null : risk.id)
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <SeverityBadge severity={risk.severity} />
                  <span className="text-small text-slate">{risk.category}</span>
                </div>
                <p className="text-body font-medium text-near-black">
                  {risk.title}
                </p>
              </div>
              <svg
                className={`w-4 h-4 text-slate transition-transform ${expandedId === risk.id ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {expandedId === risk.id && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-body text-slate">{risk.description}</p>
                {risk.clause && (
                  <p className="text-small text-near-black mt-2 p-2 bg-gray-50 rounded">
                    &ldquo;{risk.clause}&rdquo;
                  </p>
                )}
                {risk.pageNumber && (
                  <p className="text-small text-slate mt-1">
                    Page {risk.pageNumber}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create KeyTermsPanel**

Create `components/analysis/KeyTermsPanel.tsx`:

```tsx
import type { KeyTerms } from "@/types";

interface KeyTermsPanelProps {
  keyTerms: KeyTerms;
}

export function KeyTermsPanel({ keyTerms }: KeyTermsPanelProps) {
  return (
    <div className="rounded-[var(--radius-card)] bg-orange-light p-6 ring-miro">
      <h3 className="text-card-title text-near-black mb-4">Key Terms</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {keyTerms.parties.length > 0 && (
          <div>
            <h4 className="text-feature text-near-black mb-2">Parties</h4>
            <div className="space-y-1">
              {keyTerms.parties.map((party, i) => (
                <p key={i} className="text-body text-slate">
                  <span className="font-medium text-near-black">{party.name}</span>{" "}
                  &mdash; {party.role}
                </p>
              ))}
            </div>
          </div>
        )}

        {keyTerms.effectiveDates.length > 0 && (
          <div>
            <h4 className="text-feature text-near-black mb-2">Key Dates</h4>
            <div className="space-y-1">
              {keyTerms.effectiveDates.map((date, i) => (
                <p key={i} className="text-body text-slate">
                  <span className="font-medium text-near-black capitalize">
                    {date.type}:
                  </span>{" "}
                  {date.date} &mdash; {date.description}
                </p>
              ))}
            </div>
          </div>
        )}

        {keyTerms.paymentTerms.length > 0 && (
          <div>
            <h4 className="text-feature text-near-black mb-2">Payment</h4>
            <div className="space-y-1">
              {keyTerms.paymentTerms.map((term, i) => (
                <p key={i} className="text-body text-slate">
                  <span className="font-medium text-near-black">
                    {term.amount}
                  </span>{" "}
                  &mdash; {term.schedule}
                  {term.penalties && (
                    <span className="text-coral-dark">
                      {" "}(Penalty: {term.penalties})
                    </span>
                  )}
                </p>
              ))}
            </div>
          </div>
        )}

        {keyTerms.terminationConditions.length > 0 && (
          <div>
            <h4 className="text-feature text-near-black mb-2">
              Termination
            </h4>
            <ul className="space-y-1">
              {keyTerms.terminationConditions.map((cond, i) => (
                <li key={i} className="text-body text-slate">
                  &bull; {cond}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(keyTerms.jurisdiction || keyTerms.governingLaw) && (
          <div>
            <h4 className="text-feature text-near-black mb-2">Legal</h4>
            {keyTerms.jurisdiction && (
              <p className="text-body text-slate">
                <span className="font-medium text-near-black">Jurisdiction:</span>{" "}
                {keyTerms.jurisdiction}
              </p>
            )}
            {keyTerms.governingLaw && (
              <p className="text-body text-slate">
                <span className="font-medium text-near-black">
                  Governing Law:
                </span>{" "}
                {keyTerms.governingLaw}
              </p>
            )}
          </div>
        )}

        {keyTerms.confidentialityClauses.length > 0 && (
          <div>
            <h4 className="text-feature text-near-black mb-2">
              Confidentiality
            </h4>
            <ul className="space-y-1">
              {keyTerms.confidentialityClauses.map((clause, i) => (
                <li key={i} className="text-body text-slate">
                  &bull; {clause}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create CompliancePanel**

Create `components/analysis/CompliancePanel.tsx`:

```tsx
import { StatusBadge } from "@/components/common/StatusBadge";
import type { ComplianceFinding } from "@/types";

interface CompliancePanelProps {
  findings: ComplianceFinding[];
}

export function CompliancePanel({ findings }: CompliancePanelProps) {
  const statusOrder = { "non-compliant": 0, warning: 1, compliant: 2 };
  const sorted = [...findings].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  return (
    <div className="rounded-[var(--radius-card)] bg-pink-light p-6 ring-miro">
      <h3 className="text-card-title text-near-black mb-4">Compliance</h3>

      <div className="space-y-3">
        {sorted.map((finding) => (
          <div
            key={finding.id}
            className="bg-surface/80 rounded-[var(--radius-button)] p-4"
          >
            <div className="flex items-start gap-3">
              <StatusBadge status={finding.status} />
              <div className="flex-1">
                <p className="text-body font-medium text-near-black">
                  {finding.title}
                </p>
                <p className="text-body text-slate mt-1">
                  {finding.description}
                </p>
                <p className="text-small text-slate mt-2">
                  Standard: {finding.standard}
                  {finding.pageNumber && ` — Page ${finding.pageNumber}`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create AnalysisView orchestrator**

Create `components/analysis/AnalysisView.tsx`:

```tsx
"use client";

import { ProgressBar } from "./ProgressBar";
import { SummaryPanel } from "./SummaryPanel";
import { RiskPanel } from "./RiskPanel";
import { KeyTermsPanel } from "./KeyTermsPanel";
import { CompliancePanel } from "./CompliancePanel";
import type { Contract } from "@/types";

interface AnalysisViewProps {
  contract: Contract;
}

export function AnalysisView({ contract }: AnalysisViewProps) {
  const { analysis } = contract;

  if (analysis.status === "error") {
    return (
      <div className="rounded-[var(--radius-card)] bg-coral-light p-6 ring-miro">
        <h3 className="text-card-title text-near-black mb-2">
          Analysis Failed
        </h3>
        <p className="text-body text-slate">{analysis.error}</p>
        {analysis.error?.includes("Free tier limit") && (
          <p className="text-body text-blue-450 mt-2">
            Add your own Gemini API key in the settings to continue.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProgressBar progress={analysis.progress} status={analysis.status} />

      {analysis.summary && <SummaryPanel summary={analysis.summary} />}

      {analysis.risks.length > 0 && <RiskPanel risks={analysis.risks} />}

      {analysis.keyTerms && <KeyTermsPanel keyTerms={analysis.keyTerms} />}

      {analysis.compliance.length > 0 && (
        <CompliancePanel findings={analysis.compliance} />
      )}
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add components/analysis/
git commit -m "feat: add analysis dashboard components (progress, summary, risks, terms, compliance)"
```

---

## Task 16: Chat Sidebar Component

**Files:**
- Create: `components/chat/ChatMessage.tsx`
- Create: `components/chat/ChatSidebar.tsx`

- [ ] **Step 1: Create ChatMessage**

Create `components/chat/ChatMessage.tsx`:

```tsx
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-[var(--radius-card)] p-3 ${
          isUser
            ? "bg-blue-450 text-white"
            : "bg-gray-50 text-near-black ring-miro"
        }`}
      >
        <p className="text-body whitespace-pre-wrap">{message.content}</p>
        {message.sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/30">
            <p className="text-small opacity-70">
              Sources: {message.sources.map((s) => s.clause).join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ChatSidebar**

Create `components/chat/ChatSidebar.tsx`:

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useContractStore } from "@/stores/contract-store";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "./ChatMessage";

interface ChatSidebarProps {
  contractId: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({ contractId, isOpen, onToggle }: ChatSidebarProps) {
  const { contracts } = useContractStore();
  const { sendMessage, isStreaming } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contract = contracts.find((c) => c.id === contractId);
  if (!contract) return null;

  const { messages, suggestedQuestions } = contract.chat;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 bottom-4 w-14 h-14 rounded-full bg-blue-450 text-white shadow-lg hover:bg-blue-pressed transition-colors flex items-center justify-center z-40"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-surface border-l border-border shadow-xl z-40 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-feature text-near-black">Chat with Contract</h3>
        <button
          onClick={onToggle}
          className="text-slate hover:text-near-black transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && suggestedQuestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-caption text-slate">Suggested questions:</p>
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(q);
                  sendMessage(q);
                }}
                className="block w-full text-left p-2 rounded-[var(--radius-button)] border border-border text-body text-near-black hover:bg-gray-50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about this contract..."
            disabled={isStreaming}
            className="flex-1 px-4 py-2 rounded-[var(--radius-button)] border border-input-border bg-surface text-body text-near-black placeholder:text-placeholder focus:outline-none focus:border-blue-450 transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="bg-blue-450 text-white rounded-[var(--radius-button)] px-4 py-2 hover:bg-blue-pressed transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/chat/
git commit -m "feat: add chat sidebar with streaming messages"
```

---

## Task 17: Layout & Comparison Components

**Files:**
- Create: `components/layout/ContractSidebar.tsx`
- Create: `components/layout/TopBar.tsx`
- Create: `components/comparison/ComparisonView.tsx`
- Create: `components/comparison/SideBySide.tsx`
- Create: `components/comparison/ComparisonMatrix.tsx`

- [ ] **Step 1: Create ContractSidebar**

Create `components/layout/ContractSidebar.tsx`:

```tsx
"use client";

import { useContractStore } from "@/stores/contract-store";

interface ContractSidebarProps {
  selectedForCompare: string[];
  onToggleCompareSelect: (id: string) => void;
  isCompareMode: boolean;
}

export function ContractSidebar({
  selectedForCompare,
  onToggleCompareSelect,
  isCompareMode,
}: ContractSidebarProps) {
  const { contracts, activeContractId, setActiveContract } =
    useContractStore();

  if (contracts.length === 0) return null;

  return (
    <div className="w-64 border-r border-border bg-surface p-4 overflow-y-auto">
      <h3 className="text-feature text-near-black mb-3">Contracts</h3>

      <div className="space-y-2">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className={`flex items-center gap-2 p-2 rounded-[var(--radius-button)] cursor-pointer transition-colors ${
              activeContractId === contract.id && !isCompareMode
                ? "bg-blue-450/10 border border-blue-450/30"
                : "hover:bg-gray-50"
            }`}
            onClick={() => {
              if (isCompareMode) {
                onToggleCompareSelect(contract.id);
              } else {
                setActiveContract(contract.id);
              }
            }}
          >
            {isCompareMode && (
              <input
                type="checkbox"
                checked={selectedForCompare.includes(contract.id)}
                onChange={() => onToggleCompareSelect(contract.id)}
                className="rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-body font-medium text-near-black truncate">
                {contract.fileName}
              </p>
              <p className="text-small text-slate">
                {contract.pageCount} pages &bull;{" "}
                {contract.analysis.status === "complete"
                  ? "Analyzed"
                  : contract.analysis.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create TopBar**

Create `components/layout/TopBar.tsx`:

```tsx
"use client";

import { ExportButtons } from "@/components/common/ExportButtons";
import type { Contract } from "@/types";

interface TopBarProps {
  contract: Contract;
  onCompare: () => void;
  onToggleChat: () => void;
  onBack: () => void;
}

export function TopBar({ contract, onCompare, onToggleChat, onBack }: TopBarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-slate hover:text-near-black transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-feature text-near-black">{contract.fileName}</h2>
          <p className="text-small text-slate">
            {contract.pageCount} pages &bull;{" "}
            {new Date(contract.uploadedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ExportButtons contractId={contract.id} />
        <button
          onClick={onCompare}
          className="border border-border rounded-[var(--radius-button)] px-3 py-1.5 text-caption text-near-black hover:bg-gray-50 transition-colors"
        >
          Compare
        </button>
        <button
          onClick={onToggleChat}
          className="bg-blue-450 text-white rounded-[var(--radius-button)] px-3 py-1.5 text-caption hover:bg-blue-pressed transition-colors"
        >
          Chat
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create SideBySide comparison**

Create `components/comparison/SideBySide.tsx`:

```tsx
import { SeverityBadge } from "@/components/common/SeverityBadge";
import type { SideBySideResult } from "@/types";

interface SideBySideProps {
  result: SideBySideResult;
  nameA: string;
  nameB: string;
  recommendation: string;
}

export function SideBySide({ result, nameA, nameB, recommendation }: SideBySideProps) {
  return (
    <div className="space-y-6">
      {recommendation && (
        <div className="rounded-[var(--radius-card)] bg-teal-light p-4 ring-miro">
          <h4 className="text-feature text-near-black mb-2">Recommendation</h4>
          <p className="text-body text-slate">{recommendation}</p>
        </div>
      )}

      {result.betterInA.length > 0 && (
        <div>
          <h4 className="text-feature text-near-black mb-3">
            Better in {nameA}
          </h4>
          <div className="space-y-2">
            {result.betterInA.map((item, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 p-3 rounded-[var(--radius-button)] ring-miro">
                <div className="bg-teal-light/50 p-2 rounded">
                  <p className="text-small text-teal-dark font-medium">{nameA}</p>
                  <p className="text-body text-near-black">{item.valueA}</p>
                </div>
                <div className="bg-coral-light/50 p-2 rounded">
                  <p className="text-small text-coral-dark font-medium">{nameB}</p>
                  <p className="text-body text-near-black">{item.valueB}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.betterInB.length > 0 && (
        <div>
          <h4 className="text-feature text-near-black mb-3">
            Better in {nameB}
          </h4>
          <div className="space-y-2">
            {result.betterInB.map((item, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 p-3 rounded-[var(--radius-button)] ring-miro">
                <div className="bg-coral-light/50 p-2 rounded">
                  <p className="text-small text-coral-dark font-medium">{nameA}</p>
                  <p className="text-body text-near-black">{item.valueA}</p>
                </div>
                <div className="bg-teal-light/50 p-2 rounded">
                  <p className="text-small text-teal-dark font-medium">{nameB}</p>
                  <p className="text-body text-near-black">{item.valueB}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.riskDifferences.length > 0 && (
        <div>
          <h4 className="text-feature text-near-black mb-3">Risk Differences</h4>
          <div className="space-y-2">
            {result.riskDifferences.map((diff, i) => (
              <div key={i} className="p-3 rounded-[var(--radius-button)] ring-miro">
                <p className="text-body font-medium text-near-black mb-2">{diff.title}</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-small text-slate">{nameA}:</span>
                    {diff.severityA !== "none" ? (
                      <SeverityBadge severity={diff.severityA as "high" | "medium" | "low"} />
                    ) : (
                      <span className="text-small text-success">None</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-small text-slate">{nameB}:</span>
                    {diff.severityB !== "none" ? (
                      <SeverityBadge severity={diff.severityB as "high" | "medium" | "low"} />
                    ) : (
                      <span className="text-small text-success">None</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create ComparisonMatrix**

Create `components/comparison/ComparisonMatrix.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { MatrixResult } from "@/types";

interface ComparisonMatrixProps {
  result: MatrixResult;
  contractNames: string[];
}

const favorabilityColors = {
  good: "bg-teal-light text-teal-dark",
  neutral: "bg-gray-50 text-near-black",
  bad: "bg-coral-light text-coral-dark",
};

export function ComparisonMatrix({ result, contractNames }: ComparisonMatrixProps) {
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-3 text-feature text-near-black border-b border-border">
              Dimension
            </th>
            {contractNames.map((name, i) => (
              <th
                key={i}
                className="text-left p-3 text-feature text-near-black border-b border-border"
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border">
              <td className="p-3 text-body font-medium text-near-black">
                {row.dimension}
              </td>
              {row.values.map((cell, ci) => {
                const cellKey = `${ri}-${ci}`;
                return (
                  <td
                    key={ci}
                    className={`p-3 cursor-pointer transition-colors ${favorabilityColors[cell.favorability]}`}
                    onClick={() =>
                      setExpandedCell(
                        expandedCell === cellKey ? null : cellKey
                      )
                    }
                  >
                    <p className="text-body">{cell.value}</p>
                    {expandedCell === cellKey && cell.clauseText && (
                      <p className="text-small mt-1 opacity-75">
                        &ldquo;{cell.clauseText}&rdquo;
                      </p>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 5: Create ComparisonView**

Create `components/comparison/ComparisonView.tsx`:

```tsx
"use client";

import { useContractStore } from "@/stores/contract-store";
import { SideBySide } from "./SideBySide";
import { ComparisonMatrix } from "./ComparisonMatrix";
import type { ComparisonResult } from "@/types";

interface ComparisonViewProps {
  comparison: ComparisonResult;
  onBack: () => void;
}

export function ComparisonView({ comparison, onBack }: ComparisonViewProps) {
  const { contracts } = useContractStore();
  const contractNames = comparison.contractIds
    .map((id) => contracts.find((c) => c.id === id)?.fileName || "Unknown")

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-slate hover:text-near-black transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-card-title text-near-black">
          Contract Comparison
        </h2>
      </div>

      {comparison.mode === "side-by-side" && comparison.sideBySide && (
        <SideBySide
          result={comparison.sideBySide}
          nameA={contractNames[0]}
          nameB={contractNames[1]}
          recommendation={comparison.recommendation}
        />
      )}

      {comparison.mode === "matrix" && comparison.matrix && (
        <ComparisonMatrix
          result={comparison.matrix}
          contractNames={contractNames}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/layout/ components/comparison/
git commit -m "feat: add layout and comparison components"
```

---

## Task 18: Main Page Assembly

**Files:**
- Create: `app/page.tsx`

- [ ] **Step 1: Wire everything together in the main page**

Replace `app/page.tsx` with:

```tsx
"use client";

import { useState, useCallback } from "react";
import { useContractStore } from "@/stores/contract-store";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useComparison } from "@/hooks/useComparison";
import { HeroSection } from "@/components/landing/HeroSection";
import { DropZone } from "@/components/landing/DropZone";
import { FileCard } from "@/components/landing/FileCard";
import { TextPasteTab } from "@/components/landing/TextPasteTab";
import { ApiKeyInput } from "@/components/landing/ApiKeyInput";
import { AnalysisView } from "@/components/analysis/AnalysisView";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ContractSidebar } from "@/components/layout/ContractSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ComparisonView } from "@/components/comparison/ComparisonView";
import { DisclaimerDialog } from "@/components/common/DisclaimerDialog";

type AppView = "landing" | "analysis" | "comparison";

export default function Home() {
  const {
    contracts,
    activeContractId,
    comparisons,
    setActiveContract,
    removeContract,
  } = useContractStore();
  const { analyzeFile, analyzeText } = useAnalysis();
  const { compare, isComparing } = useComparison();

  const [view, setView] = useState<AppView>("landing");
  const [uploadTab, setUploadTab] = useState<"file" | "text">("file");
  const [chatOpen, setChatOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [activeComparisonId, setActiveComparisonId] = useState<string | null>(
    null
  );

  const handleFiles = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        await analyzeFile(file);
      }
      setView("analysis");
    },
    [analyzeFile]
  );

  const handleTextSubmit = useCallback(
    async (text: string) => {
      await analyzeText(text);
      setView("analysis");
    },
    [analyzeText]
  );

  const handleToggleCompareSelect = useCallback((id: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleRunComparison = useCallback(async () => {
    if (selectedForCompare.length < 2) return;

    const mode =
      selectedForCompare.length === 2 ? "side-by-side" : "matrix";

    const comparisonId = await compare(selectedForCompare, mode);
    if (comparisonId) {
      setActiveComparisonId(comparisonId);
      setView("comparison");
      setCompareMode(false);
      setSelectedForCompare([]);
    }
  }, [selectedForCompare, compare]);

  const activeContract = contracts.find((c) => c.id === activeContractId);
  const activeComparison = comparisons.find(
    (c) => c.id === activeComparisonId
  );

  return (
    <div className="min-h-screen bg-surface">
      <DisclaimerDialog />

      {view === "landing" && (
        <div className="max-w-3xl mx-auto px-4 py-20">
          <HeroSection />

          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setUploadTab("file")}
                className={`px-4 py-2 rounded-[var(--radius-button)] text-caption transition-colors ${
                  uploadTab === "file"
                    ? "bg-blue-450 text-white"
                    : "border border-border text-near-black hover:bg-gray-50"
                }`}
              >
                Upload Files
              </button>
              <button
                onClick={() => setUploadTab("text")}
                className={`px-4 py-2 rounded-[var(--radius-button)] text-caption transition-colors ${
                  uploadTab === "text"
                    ? "bg-blue-450 text-white"
                    : "border border-border text-near-black hover:bg-gray-50"
                }`}
              >
                Paste Text
              </button>
            </div>

            {uploadTab === "file" ? (
              <DropZone onFiles={handleFiles} />
            ) : (
              <TextPasteTab onSubmit={handleTextSubmit} />
            )}
          </div>

          {contracts.length > 0 && (
            <div className="space-y-2 mb-6">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  onClick={() => {
                    setActiveContract(contract.id);
                    setView("analysis");
                  }}
                  className="cursor-pointer"
                >
                  <FileCard
                    fileName={contract.fileName}
                    fileType={contract.fileType}
                    status={contract.analysis.status}
                    progress={contract.analysis.progress}
                    onRemove={() => removeContract(contract.id)}
                  />
                </div>
              ))}
            </div>
          )}

          <ApiKeyInput />

          <footer className="mt-12 text-center">
            <p className="text-small text-slate">
              This is an AI-powered analysis tool, not legal advice. Consult a
              qualified attorney for legal decisions.
            </p>
          </footer>
        </div>
      )}

      {view === "analysis" && (
        <div className="flex h-screen">
          {contracts.length > 1 && (
            <ContractSidebar
              selectedForCompare={selectedForCompare}
              onToggleCompareSelect={handleToggleCompareSelect}
              isCompareMode={compareMode}
            />
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            {activeContract && (
              <>
                <TopBar
                  contract={activeContract}
                  onCompare={() => {
                    if (contracts.length >= 2) {
                      setCompareMode(!compareMode);
                    }
                  }}
                  onToggleChat={() => setChatOpen(!chatOpen)}
                  onBack={() => setView("landing")}
                />

                <div
                  className={`flex-1 overflow-y-auto p-6 ${chatOpen ? "mr-96" : ""}`}
                >
                  {compareMode ? (
                    <div className="max-w-2xl mx-auto text-center py-12">
                      <h3 className="text-card-title text-near-black mb-4">
                        Select contracts to compare
                      </h3>
                      <p className="text-body text-slate mb-6">
                        Check 2 or more contracts in the sidebar, then click
                        compare.
                      </p>
                      <button
                        onClick={handleRunComparison}
                        disabled={
                          selectedForCompare.length < 2 || isComparing
                        }
                        className="bg-blue-450 text-white rounded-[var(--radius-button)] py-3 px-8 text-button hover:bg-blue-pressed transition-colors disabled:opacity-50"
                      >
                        {isComparing
                          ? "Comparing..."
                          : `Compare ${selectedForCompare.length} Contracts`}
                      </button>
                    </div>
                  ) : (
                    <div className="max-w-4xl mx-auto">
                      <AnalysisView contract={activeContract} />
                    </div>
                  )}
                </div>

                {activeContract.analysis.status === "complete" && (
                  <ChatSidebar
                    contractId={activeContract.id}
                    isOpen={chatOpen}
                    onToggle={() => setChatOpen(!chatOpen)}
                  />
                )}
              </>
            )}

            {!activeContract && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-body text-slate">
                  Select a contract or upload a new one.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === "comparison" && activeComparison && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <ComparisonView
            comparison={activeComparison}
            onBack={() => setView("analysis")}
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify the app builds**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Start dev server and verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- Hero section renders with correct typography
- Drop zone accepts drag-and-drop
- Tab switching between file upload and text paste works
- API key input expands/collapses
- Legal disclaimer dialog shows on first visit

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble main page with all three application states"
```

---

## Task 19: End-to-End Verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test full flow in browser**

Test the golden path:
1. Open `http://localhost:3000`
2. Acknowledge the legal disclaimer
3. Add a Gemini API key (or use the shared free tier)
4. Upload a sample PDF contract
5. Watch the progress bar advance through each pipeline pass
6. Verify all 4 analysis panels render (summary, risks, key terms, compliance)
7. Open the chat sidebar and ask a follow-up question
8. Verify streaming response appears
9. Export as PDF and Excel — verify files download
10. Upload a second contract
11. Select both contracts in the sidebar and run a comparison
12. Verify comparison renders

Test edge cases:
1. Upload an empty file — verify error message
2. Paste very short text — verify it still analyzes
3. Try the app without an API key — verify rate limit error is user-friendly
4. Refresh the page — verify localStorage persists analysis results

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete contract analyst v1"
```

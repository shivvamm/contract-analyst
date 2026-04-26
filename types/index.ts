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

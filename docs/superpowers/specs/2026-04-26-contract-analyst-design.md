# Contract Analyst — Design Specification

## Overview

A single-page Next.js application that analyzes contracts of any type and length using the Gemini API. Serves both expert contract analysts and complete beginners through progressive disclosure — simple summaries expand into deep technical analysis. Handles single contracts, bulk uploads, and contract comparisons.

## Tech Stack

- **Framework:** Next.js 14+ (App Router) — single app for frontend + backend API routes
- **AI:** Google Gemini API (`@google/generative-ai`)
- **Parsing:** `pdf-parse` (PDF text), `tesseract.js` (OCR), `mammoth` (DOCX)
- **State:** Zustand with localStorage persistence
- **Styling:** Tailwind CSS with Miro-inspired design system tokens
- **Export:** `jspdf` (PDF reports), `xlsx` (Excel/CSV)
- **Language:** TypeScript throughout

## Application Structure

```
contract-analyst/
├── app/
│   ├── page.tsx                    # Main SPA
│   ├── layout.tsx                  # Root layout, fonts, global providers
│   ├── globals.css                 # Miro design system tokens
│   └── api/
│       ├── analyze/route.ts        # Multi-pass pipeline orchestration
│       ├── chat/route.ts           # Follow-up Q&A endpoint
│       ├── compare/route.ts        # Contract comparison endpoint
│       └── export/route.ts         # PDF/CSV export generation
├── components/                     # UI components
├── lib/
│   ├── gemini/                     # Gemini API client, prompts, chunking
│   ├── parsers/                    # PDF, DOCX, image/OCR text extraction
│   ├── pipeline/                   # Analysis pipeline orchestration
│   └── export/                     # PDF/CSV report generation
├── stores/                         # Zustand stores
└── types/                          # TypeScript types
```

---

## Document Parsing Layer

### Format Support

| Format | Parser | Approach |
|--------|--------|----------|
| PDF (text-based) | `pdf-parse` | Extract text directly, preserve page boundaries |
| PDF (scanned/image) | `tesseract.js` | OCR each page to text |
| DOCX | `mammoth` | Convert to plain text, preserve structure |
| Images (JPG/PNG) | `tesseract.js` | OCR to text |
| Plain text (paste) | None | Use directly |

### Auto-Detection

PDFs are checked for extractable text. If a page yields little/no text, it falls back to OCR for that page automatically. Users never choose a parsing mode.

### Chunking Strategy

1. Split by section headings (clauses, articles, numbered sections) when structure is detected
2. Fall back to token-based chunks (3000 tokens per chunk, 200 token overlap) when no clear structure
3. Each chunk retains metadata: page numbers, section title if detected

For very large contracts, chunks are processed in batches to respect Gemini rate limits. The pipeline tracks progress and streams results as batches complete.

---

## Multi-Pass Analysis Pipeline

Four specialized passes, each with a focused Gemini prompt:

### Pass 1: Key Terms Extraction
- Parties involved (names, roles)
- Effective dates, expiration, renewal terms
- Payment terms (amounts, schedules, penalties)
- Obligations per party
- Termination conditions
- Confidentiality/NDA clauses
- Jurisdiction and governing law
- Runs per-chunk, then a merge pass to deduplicate and resolve conflicts

### Pass 2: Risk Analysis
- Unfavorable clauses (one-sided indemnification, unlimited liability, auto-renewal traps)
- Missing protections (no liability cap, no termination for convenience, no IP ownership)
- Penalty exposure and financial risk
- Each risk receives a severity level (high / medium / low) and plain-English explanation
- References specific clause/page where risk was found

### Pass 3: Compliance Check (depends on Pass 1)
- GDPR data handling requirements (when contract involves personal data)
- Standard contract law red flags (unconscionable terms, missing consideration)
- Industry-common best practices
- Each finding flagged as compliant / warning / non-compliant with explanation
- Built-in rule set, not user-configurable

### Pass 4: Summary Generation (depends on Pass 1 + 2)
- Layer 1: One-sentence description of what this contract is
- Layer 2: 3-5 bullet executive summary
- Layer 3: Section-by-section detailed breakdown in plain English
- Progressive disclosure: beginners see Layer 1+2, experts expand to Layer 3

### Pipeline Execution Order

```
Upload → Parse & Chunk
                ↓
        ┌───────┴───────┐
        ↓               ↓
   Pass 1: Extract   Pass 2: Risks    (parallel)
        ↓               ↓
        └───────┬───────┘
                ↓
         Pass 3: Compliance           (needs Pass 1)
                ↓
         Pass 4: Summary              (needs Pass 1 + 2)
                ↓
         Results complete → Chat enabled
```

Results stream to the frontend as each pass completes. Progress bar advances per pass (25% each).

---

## Chat / Q&A Feature

### Architecture
- Full extracted text + all pipeline results stored in Zustand
- Each question sent to backend with: the question + contract text + analysis results as context
- Gemini answers grounded strictly in the contract text
- Every answer includes source references (clause/section/page number)

### Prompt Constraints
- Answer only from the provided contract
- Cite specific sections
- Say "this contract doesn't address that" when information isn't present
- Never give legal advice — always recommend consulting a lawyer

### Context Management
- For contracts exceeding Gemini's context window: question matched against chunk summaries to find most relevant chunks, only those sent as context
- Chat history persists in localStorage

### UX
- Collapsible right sidebar panel
- Streaming responses (word by word)
- Suggested starter questions based on analysis findings
- Full chat history preserved per contract

---

## Contract Comparison Feature

### Mode A: Side-by-Side (2 contracts)
- User selects 2 analyzed contracts from their session
- Gemini receives both contracts' extracted terms and risk data
- Output:
  - Terms better in Contract A vs B (and vice versa)
  - Terms missing from one but present in the other
  - Risk severity differences
  - Plain-English recommendation on which is more favorable
- Displayed as two columns with highlighted differences

### Mode B: Comparison Matrix (3+ contracts)
- User selects multiple analyzed contracts
- Generated table across key dimensions:
  - Payment terms, liability cap, termination notice, auto-renewal, risk score, etc.
- Each cell color-coded by favorability (green/yellow/red using Miro pastels)
- Cells expandable to show full clause text
- Sortable by any column

### Implementation
- Comparison uses already-extracted pipeline results from Zustand store — no re-analysis
- Only the comparison/diff prompt goes to Gemini, making it fast and cheap

---

## Export Feature

### PDF Report (jspdf)
- Branded header with app logo and generation date
- Sections: executive summary, key terms table, risk analysis with severity badges, compliance findings, detailed breakdown
- For comparisons: includes side-by-side diff or matrix table
- Page numbers, table of contents for long reports

### Excel/CSV Export (xlsx)
- Multiple sheets: Key Terms, Risks, Compliance, Comparison Matrix (if applicable)
- CSV option for single-sheet simple export

### UX
- Export buttons in analysis toolbar
- User picks format
- Server-side generation, file downloads to browser

---

## UI Layout & Design

### Design System: Miro-Inspired

**Typography:**
- Display: Roobert PRO Medium with OpenType variants (`cv03`, `cv04`, `cv09`, `cv11`), negative letter-spacing
- Body: Noto Sans with stylistic sets (`ss01`, `ss04`, `ss05`)

**Colors:**
- Text: Near black `#1c1c1e`
- Surface: White `#ffffff`
- Interactive: Blue 450 `#5b76fe`
- Success: `#00b473`
- Border: `#c7cad5`
- Ring shadow: `rgb(224,226,232) 0px 0px 0px 1px`

**Pastel Section Backgrounds:**
- Summary: Teal `#c3faf5`
- Risks: Coral `#ffc6c6`
- Compliance: Pink `#fde0f0`
- Key Terms: Orange `#ffe6cd`

**Component Standards:**
- Cards: 12px radius, ring shadow
- Buttons: 8px radius, outlined for secondary, Blue 450 fill for primary
- Severity badges: High = `#600000` on `#ffc6c6`, Medium = `#746019` on `#ffe6cd`, Low = `#187574` on `#c3faf5`
- Max 2 pastel accents per section

### Three Application States

**State 1: Landing / Upload**
- White canvas, centered content
- Hero heading in Roobert PRO Medium: "Analyze any contract in seconds"
- Large drop zone (24px radius, dashed border) for drag-and-drop or click
- Multi-file support with queued file cards
- Text paste tab as alternative
- Collapsible API key input section
- Language selector for output language

**State 2: Analysis in Progress**
- Split view: upload queue (left), active analysis (right)
- Percentage progress bar advancing per pipeline pass
- Pass labels stream in as each starts
- Results populate progressively below progress bar
- Pastel backgrounds for each section as results arrive

**State 3: Analysis Complete (Dashboard)**
- Top bar: contract name, page count, date, export buttons, compare button
- Summary card (teal) — expandable layers (1 → 2 → 3)
- Risk panel (coral) — cards sorted by severity, expandable
- Key terms panel (orange) — structured grid grouped by category
- Compliance panel (pink) — findings with status badges
- Chat sidebar (collapsible right) — Blue 450 send button, streaming, suggested questions
- Left sidebar: all contracts in session, click to switch, multi-select for comparison

**Responsive:** Stacks vertically on mobile, panels become tabs on tablet. Breakpoints per Miro system: 425px, 576px, 768px, 896px, 1024px, 1200px, 1280px, 1366px, 1700px, 1920px.

---

## Client-Side State & Persistence

### Zustand Store Shape

```
Store:
├── contracts[]
│   ├── id (uuid)
│   ├── fileName
│   ├── fileType
│   ├── uploadedAt
│   ├── rawText
│   ├── chunks[]
│   ├── analysis
│   │   ├── status (idle | extracting | analyzing-risks | checking-compliance | summarizing | complete | error)
│   │   ├── progress (0-100)
│   │   ├── keyTerms{}
│   │   ├── risks[]
│   │   ├── compliance[]
│   │   └── summary{ layer1, layer2, layer3 }
│   └── chat
│       ├── messages[]
│       └── suggestedQuestions[]
├── comparisons[]
│   ├── id
│   ├── contractIds[]
│   ├── mode (side-by-side | matrix)
│   └── result{}
├── settings
│   ├── geminiApiKey (optional, user-provided)
│   ├── outputLanguage
│   └── theme (future)
└── activeContractId
```

### Persistence Rules
- **Persisted to localStorage:** Analysis results, chat history, comparisons, settings
- **Not persisted:** rawText and chunks (too large, re-parseable from file)
- **Not persisted:** Raw uploaded files (browser storage limits)
- Re-upload required for chat after page refresh if raw text was cleared

---

## Error Handling & Edge Cases

### API Errors
- Rate limit → "Free tier limit reached. Add your own API key to continue."
- Timeout per chunk → automatic retry (up to 2), then skip with note: "Pages X-Y could not be analyzed"
- Network failure mid-pipeline → partial results preserved. If the file is still in browser memory, "Resume analysis" button continues from last completed pass. If the page was refreshed, user re-uploads and the app skips already-completed passes using cached analysis results.

### Parsing Errors
- Corrupted file → "This file couldn't be read. Try re-exporting it or pasting the text directly."
- Low OCR quality → confidence warning: "Some pages had low text quality — results may be incomplete"
- Empty/no text → caught before pipeline, user notified immediately

### Large Files
- 500+ pages → warning before processing with proceed/cancel option
- localStorage nearing limit → oldest analyses auto-archived with notification

### Chat Edge Cases
- Question not in contract → "This contract doesn't appear to address that topic"
- Long chat history → older messages summarized, recent kept in full

### Legal Disclaimer
- Persistent footer: "This is an AI-powered analysis tool, not legal advice. Consult a qualified attorney for legal decisions."
- First-use acknowledgment dialog

---

## API Key Management

### Dual Mode
- **Shared free tier:** App uses a backend-proxied API key. Limits match Gemini's free tier. When limits hit, user prompted to add their own key.
- **User-provided key:** Stored in browser localStorage only, sent per-request to backend, never logged or persisted server-side.

### Backend Proxy
- All Gemini calls go through Next.js API routes
- Shared key stored as server-side environment variable
- User-provided key passed via request header, used for that request only
- Enables rate limiting and usage tracking for the shared key

---

## Language Support

### Launch
- English UI
- Contracts in any language — Gemini handles analysis natively
- Analysis output language configurable (Gemini returns insights in the user's chosen language)

### Future
- Multi-language UI via Next.js i18n and translation files

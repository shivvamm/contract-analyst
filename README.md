<div align="center">

# Contract Analyst

**AI-powered contract analysis — extract risks, check compliance, and understand any contract in seconds.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Gemini_2.0-Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/shivvamm/contract-analyst/pulls)

Upload any contract — PDF, DOCX, scanned image, or plain text — and get a structured breakdown of key terms, risks, compliance gaps, and a plain-English summary. Ask follow-up questions, compare multiple contracts, and export polished reports. All in the browser, no sign-up required.

<br />

🔍 **Smart Analysis** · 💬 **Interactive Q&A** · ⚖️ **Compare Contracts** · 📊 **Export Reports**

</div>

---

## Features

### 📄 Multi-Format Document Parsing

Upload PDFs, DOCX files, images (JPG/PNG), or paste raw text. The parser auto-detects format and falls back to OCR (Tesseract.js) for scanned documents with low text quality.

### 🔍 4-Pass Analysis Pipeline

Contracts are analyzed through four sequential passes streamed in real-time via SSE:

1. **Key Terms Extraction** — parties, dates, payment terms, obligations, confidentiality, jurisdiction
2. **Risk Identification** — unfavorable clauses rated by severity (high / medium / low)
3. **Compliance Check** — GDPR, contract law best practices, industry standards
4. **Summary Generation** — 3-layer progressive disclosure: one-liner → bullet points → detailed breakdown

### 💬 AI Chat with Source Citations

Ask follow-up questions about any contract. Responses stream token-by-token with automatic clause and page references. Chat history persists across sessions.

### ⚖️ Contract Comparison

- **2 contracts** → side-by-side diff showing which terms favor which party, missing protections, and a plain-English recommendation
- **3+ contracts** → matrix view with color-coded favorability (green/yellow/red), expandable clause text, and sortable columns

### 📊 Export Reports

- **PDF** — branded report with table of contents, sections, and page numbers
- **Excel** — multi-sheet workbook (Key Terms, Risks, Compliance, Comparison Matrix)
- **CSV** — single-sheet export for quick spreadsheet use

### 💾 Local Persistence

All analysis is stored in browser localStorage. Return to previously analyzed contracts anytime — no account needed.

---

## Quick Start

**Prerequisites:** Node.js 18+ and npm (or pnpm/yarn)

```bash
# 1. Clone the repo
git clone https://github.com/shivvamm/contract-analyst.git
cd contract-analyst

# 2. Install dependencies
npm install

# 3. Set your Gemini API key
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and upload your first contract.

> **No API key?** You can paste your Gemini API key directly in the UI — it's sent per-request and never stored on the server.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | [Google Gemini API key](https://ai.google.dev/) |
| `LLM_PROVIDER` | No | `gemini` | LLM backend: `gemini` or `groq` |
| `GROQ_API_KEY` | No | — | Required when `LLM_PROVIDER=groq` |

---

## Architecture

```
Upload → Parse (PDF/DOCX/OCR/Text) → Chunk → 4-Pass LLM Analysis (SSE) → Display → Chat / Compare / Export
```

The app is a single-page Next.js application with four API routes that handle server-side processing. All state lives client-side in a Zustand store backed by localStorage. The LLM provider is abstracted behind a common interface, making it straightforward to swap between Gemini and Groq.

```
app/
├── page.tsx                  # SPA entry — landing, analysis, comparison views
├── api/
│   ├── analyze/route.ts      # Document parse + 4-pass analysis (SSE)
│   ├── chat/route.ts         # Q&A with streaming + citations (SSE)
│   ├── compare/route.ts      # Side-by-side or matrix comparison
│   └── export/route.ts       # PDF / Excel / CSV generation
components/
├── analysis/                 # Analysis result panels
├── chat/                     # Chat sidebar and messages
├── comparison/               # Side-by-side and matrix views
├── landing/                  # Upload zone, hero, API key input
├── layout/                   # Top bar, contract sidebar
└── common/                   # Badges, disclaimer, export buttons
lib/
├── gemini/                   # Gemini client + prompt templates
├── groq/                     # Groq client
├── llm/                      # Provider abstraction layer
├── parsers/                  # PDF, DOCX, OCR, text parsers
├── pipeline/                 # Analysis orchestrator (retries, callbacks)
└── export/                   # Report generators
hooks/                        # useAnalysis, useChat, useComparison
stores/                       # Zustand store with localStorage persistence
types/                        # TypeScript interfaces
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) · React 19 · TypeScript 5 |
| **Styling** | Tailwind CSS 4 · Miro-inspired design system |
| **State** | Zustand 5 with localStorage middleware |
| **AI / LLM** | Google Gemini 2.0 Flash · Groq (alternative) |
| **Parsing** | pdf-parse · Tesseract.js 7 (OCR) · Mammoth (DOCX) |
| **Export** | jsPDF · SheetJS (xlsx) |
| **Testing** | Vitest · Testing Library · jsdom |

---

## API Reference

| Method | Endpoint | Description | Response |
|---|---|---|---|
| `POST` | `/api/analyze` | Parse and analyze a contract | SSE stream |
| `POST` | `/api/chat` | Ask a question about a contract | SSE stream |
| `POST` | `/api/compare` | Compare 2+ contracts | JSON |
| `POST` | `/api/export` | Generate a PDF/Excel/CSV report | File download |

**Common headers:**

| Header | Description |
|---|---|
| `x-gemini-api-key` | User-provided API key (optional — overrides server key) |
| `x-output-language` | Output language for analysis (e.g. `en`, `es`, `de`) |

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Run production server
npm run lint         # Run ESLint
npm test             # Run tests (Vitest)
npm run test:watch   # Run tests in watch mode
```

---

## Deployment

The app deploys anywhere Next.js runs. The fastest path:

**Vercel (recommended)**
1. Push to GitHub
2. Import in [Vercel](https://vercel.com/new)
3. Add `GEMINI_API_KEY` to environment variables
4. Deploy

**Self-hosted**
```bash
npm run build
npm run start
```

---

## Contributing

Contributions are welcome! Whether it's a bug fix, new feature, or documentation improvement — all PRs are appreciated.

### Getting Started

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/my-feature`
3. **Make** your changes and add tests where applicable
4. **Run** the test suite: `npm test`
5. **Run** the linter: `npm run lint`
6. **Submit** a pull request

### Guidelines

- Follow existing code patterns and TypeScript strict mode
- Keep PRs focused — one feature or fix per PR
- Add tests for new functionality
- Use descriptive commit messages

### Reporting Issues

Found a bug or have a feature request? [Open an issue](https://github.com/shivvamm/contract-analyst/issues) with as much detail as possible.

---

## Community

If Contract Analyst is useful to you, consider giving the repo a star — it helps others discover the project.

[![Star History](https://img.shields.io/github/stars/shivvamm/contract-analyst?style=social)](https://github.com/shivvamm/contract-analyst)

- [Issues](https://github.com/shivvamm/contract-analyst/issues) — bug reports and feature requests
- [Pull Requests](https://github.com/shivvamm/contract-analyst/pulls) — contributions and code review
- [Discussions](https://github.com/shivvamm/contract-analyst/discussions) — questions, ideas, and general conversation

---

## Acknowledgments

Built with [Next.js](https://nextjs.org/), powered by [Google Gemini](https://ai.google.dev/), with OCR by [Tesseract.js](https://tesseract.projectnaptha.com/), document parsing by [pdf-parse](https://www.npmjs.com/package/pdf-parse) and [Mammoth](https://www.npmjs.com/package/mammoth), and exports via [jsPDF](https://github.com/parallax/jsPDF) and [SheetJS](https://sheetjs.com/).

---

## License

MIT

---

<div align="center">
<sub>Made with ❤️ for anyone who's ever stared at a 40-page contract and thought "what does this actually mean?"</sub>
</div>

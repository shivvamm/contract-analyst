import React from "react";

/* ─── Flow Step ─── */
function FlowStep({
  number,
  title,
  description,
  color,
}: {
  number: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 flex-1 min-w-[140px]">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-surface text-button"
        style={{ backgroundColor: color }}
      >
        {number}
      </div>
      <h4 className="text-caption text-near-black font-medium">{title}</h4>
      <p className="text-small text-slate leading-relaxed max-w-[180px]">{description}</p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="hidden sm:flex items-center pt-0 mt-[-28px]">
      <svg width="32" height="12" viewBox="0 0 32 12" fill="none" className="text-border">
        <path d="M0 6h28m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ─── How It Works ─── */
export function HowItWorks() {
  return (
    <section className="w-full max-w-4xl mx-auto">
      <h2 className="text-card-title text-near-black text-center mb-10">How it works</h2>
      <div className="flex flex-wrap sm:flex-nowrap items-start justify-center gap-4 sm:gap-2">
        <FlowStep number="1" title="Upload" description="Drop a PDF, DOCX, image, or paste contract text directly" color="#5b76fe" />
        <FlowArrow />
        <FlowStep number="2" title="Analyze" description="AI extracts key terms, flags risks, and checks compliance" color="#187574" />
        <FlowArrow />
        <FlowStep number="3" title="Review" description="Browse layered summaries, risks, and obligations at a glance" color="#746019" />
        <FlowArrow />
        <FlowStep number="4" title="Act" description="Chat with your contract, compare versions, or export reports" color="#9b1a6a" />
      </div>
    </section>
  );
}

/* ─── Mockup Card ─── */
function MockupCard({
  title,
  bg,
  titleColor,
  children,
}: {
  title: string;
  bg: string;
  titleColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ring-miro rounded-[var(--radius-card)] p-4 space-y-3 select-none" style={{ backgroundColor: bg }}>
      <h4 className="text-caption font-medium" style={{ color: titleColor }}>{title}</h4>
      {children}
    </div>
  );
}

function MockupLine({ w, color }: { w: string; color: string }) {
  return <div className="h-2 rounded-full" style={{ width: w, backgroundColor: color, opacity: 0.35 }} />;
}

function MockupBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span className="inline-flex px-2 py-0.5 rounded-[var(--radius-pill)] text-[10px] font-medium" style={{ backgroundColor: bg, color }}>
      {label}
    </span>
  );
}

/* ─── Analysis Preview ─── */
export function AnalysisPreview() {
  return (
    <section className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-card-title text-near-black mb-3">What you get</h2>
        <p className="text-body text-slate max-w-lg mx-auto">
          Every contract is broken down into four clear panels &mdash; no legal jargon, just actionable insight.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Summary mockup */}
        <MockupCard title="Summary" bg="#c3faf5" titleColor="#187574">
          <div className="flex items-center gap-1 mb-2">
            {["L1", "L2", "L3"].map((l, i) => (
              <span
                key={l}
                className="px-2 py-0.5 rounded-[var(--radius-pill)] text-[10px]"
                style={{
                  backgroundColor: i === 0 ? "#187574" : "transparent",
                  color: i === 0 ? "#fff" : "#187574",
                }}
              >
                {l}
              </span>
            ))}
          </div>
          <div className="bg-white/60 rounded-[var(--radius-button)] p-3 space-y-2">
            <MockupLine w="100%" color="#187574" />
            <MockupLine w="85%" color="#187574" />
            <MockupLine w="60%" color="#187574" />
          </div>
          <p className="text-small text-teal-dark mt-1">3 layers of detail &mdash; from one sentence to full breakdown</p>
        </MockupCard>

        {/* Risks mockup */}
        <MockupCard title="Risks" bg="#ffc6c6" titleColor="#600000">
          <div className="space-y-2">
            <div className="bg-white/60 rounded-[var(--radius-button)] p-2.5 flex items-start justify-between gap-2">
              <div className="space-y-1.5 flex-1">
                <MockupLine w="70%" color="#600000" />
                <MockupLine w="90%" color="#600000" />
              </div>
              <MockupBadge label="High" bg="rgba(96,0,0,0.12)" color="#600000" />
            </div>
            <div className="bg-white/60 rounded-[var(--radius-button)] p-2.5 flex items-start justify-between gap-2">
              <div className="space-y-1.5 flex-1">
                <MockupLine w="55%" color="#746019" />
                <MockupLine w="75%" color="#746019" />
              </div>
              <MockupBadge label="Medium" bg="rgba(116,96,25,0.12)" color="#746019" />
            </div>
            <div className="bg-white/60 rounded-[var(--radius-button)] p-2.5 flex items-start justify-between gap-2">
              <div className="space-y-1.5 flex-1">
                <MockupLine w="60%" color="#187574" />
                <MockupLine w="80%" color="#187574" />
              </div>
              <MockupBadge label="Low" bg="rgba(24,117,116,0.12)" color="#187574" />
            </div>
          </div>
        </MockupCard>

        {/* Key Terms mockup */}
        <MockupCard title="Key Terms" bg="#ffe6cd" titleColor="#746019">
          <div className="grid grid-cols-2 gap-2">
            {["Parties", "Key Dates", "Payment", "Termination", "Jurisdiction", "Confidentiality"].map((label) => (
              <div key={label} className="bg-white/60 rounded-[var(--radius-button)] p-2.5">
                <p className="text-[9px] uppercase tracking-wider font-medium mb-1.5" style={{ color: "#746019" }}>{label}</p>
                <div className="space-y-1">
                  <MockupLine w="80%" color="#746019" />
                  <MockupLine w="55%" color="#746019" />
                </div>
              </div>
            ))}
          </div>
        </MockupCard>

        {/* Compliance mockup */}
        <MockupCard title="Compliance" bg="#fde0f0" titleColor="#9b1a6a">
          <div className="space-y-2">
            <div className="bg-white/60 rounded-[var(--radius-button)] p-2.5 flex items-start justify-between gap-2">
              <div className="space-y-1.5 flex-1">
                <MockupLine w="65%" color="#166534" />
                <MockupLine w="85%" color="#166534" />
              </div>
              <MockupBadge label="Compliant" bg="rgba(22,101,52,0.1)" color="#166534" />
            </div>
            <div className="bg-white/60 rounded-[var(--radius-button)] p-2.5 flex items-start justify-between gap-2">
              <div className="space-y-1.5 flex-1">
                <MockupLine w="72%" color="#746019" />
                <MockupLine w="50%" color="#746019" />
              </div>
              <MockupBadge label="Warning" bg="rgba(116,96,25,0.12)" color="#746019" />
            </div>
            <div className="bg-white/60 rounded-[var(--radius-button)] p-2.5 flex items-start justify-between gap-2">
              <div className="space-y-1.5 flex-1">
                <MockupLine w="60%" color="#600000" />
                <MockupLine w="78%" color="#600000" />
              </div>
              <MockupBadge label="Non-Compliant" bg="rgba(96,0,0,0.12)" color="#600000" />
            </div>
          </div>
        </MockupCard>
      </div>
    </section>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-surface ring-miro rounded-[var(--radius-card)] p-5 space-y-3 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-[var(--radius-button)] bg-blue-450/8 flex items-center justify-center text-blue-450">
        {icon}
      </div>
      <h4 className="text-caption text-near-black font-medium">{title}</h4>
      <p className="text-small text-slate leading-relaxed">{description}</p>
    </div>
  );
}

/* ─── Features Grid ─── */
export function FeaturesGrid() {
  return (
    <section className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-card-title text-near-black mb-3">Everything you need</h2>
        <p className="text-body text-slate max-w-lg mx-auto">
          Built for legal teams, founders, and anyone who reads contracts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FeatureCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
          title="Multi-format upload"
          description="PDF, DOCX, PNG, JPG, or plain text. Drag and drop or paste directly — we handle the parsing."
        />
        <FeatureCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          title="OCR for scanned docs"
          description="Scanned PDFs and images are automatically processed with Tesseract OCR to extract text."
        />
        <FeatureCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
          title="Risk analysis"
          description="Spots one-sided clauses, liability exposure, auto-renewal traps, and missing protections."
        />
        <FeatureCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          }
          title="Compliance check"
          description="Screens against GDPR, contract law standards, and industry best practices automatically."
        />
        <FeatureCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          }
          title="AI chat"
          description="Ask follow-up questions about your contract — answers are grounded in the actual document text."
        />
        <FeatureCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          }
          title="Contract comparison"
          description="Side-by-side diff for 2 contracts or a matrix view for 3+. See who gets the better deal."
        />
        <FeatureCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          }
          title="Export reports"
          description="Download your analysis as a PDF report, Excel spreadsheet, or CSV for your records."
        />
        <FeatureCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
            </svg>
          }
          title="Multi-language"
          description="Get analysis output in English, Spanish, French, German, Portuguese, Chinese, Japanese, and more."
        />
        <FeatureCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          }
          title="Bring your own key"
          description="Use your own Gemini API key for unlimited analysis, or use the built-in free tier to get started."
        />
      </div>
    </section>
  );
}

/* ─── Chat Preview ─── */
export function ChatPreview() {
  return (
    <section className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-4">
          <h2 className="text-card-title text-near-black">Ask your contract anything</h2>
          <p className="text-body text-slate">
            Once analyzed, open the chat sidebar to ask follow-up questions.
            Every answer cites specific clauses and page numbers from your document.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "What are the termination penalties?",
              "Is there a non-compete clause?",
              "What happens if payment is late?",
            ].map((q) => (
              <span key={q} className="inline-flex px-3 py-1.5 rounded-[var(--radius-pill)] bg-blue-450/8 border border-blue-450/15 text-small text-blue-450">
                {q}
              </span>
            ))}
          </div>
        </div>

        {/* Chat mockup */}
        <div className="bg-surface ring-miro rounded-[var(--radius-card)] p-4 space-y-3 select-none">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <svg className="w-4 h-4 text-blue-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <span className="text-caption text-near-black font-medium">Contract Chat</span>
          </div>

          {/* User message */}
          <div className="flex justify-end">
            <div className="bg-blue-450 text-surface text-small rounded-[var(--radius-button)] rounded-br-sm px-3 py-2 max-w-[75%]">
              Can I terminate this contract early?
            </div>
          </div>

          {/* Assistant message */}
          <div className="flex justify-start">
            <div className="bg-bg-muted text-small text-near-black rounded-[var(--radius-button)] rounded-bl-sm px-3 py-2 max-w-[85%] space-y-1.5">
              <p>Yes. Section 8.2 allows either party to terminate with 30 days written notice. However, early termination triggers a penalty of 15% of remaining contract value.</p>
              <p className="text-[10px] text-placeholder">Section 8.2 (Page 4), Section 12.1 (Page 7)</p>
            </div>
          </div>

          {/* Input mockup */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 h-8 rounded-[var(--radius-button)] border border-border bg-bg-muted flex items-center px-3">
              <span className="text-small text-placeholder">Ask about this contract...</span>
            </div>
            <div className="w-8 h-8 rounded-[var(--radius-button)] bg-blue-450 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Compare Preview ─── */
export function ComparePreview() {
  return (
    <section className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Comparison mockup */}
        <div className="bg-surface ring-miro rounded-[var(--radius-card)] p-4 space-y-3 select-none order-2 md:order-1">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-caption text-near-black font-medium">Comparison</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-blue-450 text-surface text-[10px]">Side by Side</span>
              <span className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-bg-muted text-slate text-[10px]">Matrix</span>
            </div>
          </div>

          {/* Diff rows */}
          <div className="space-y-2">
            {[
              { term: "Liability Cap", a: "$500,000", b: "Unlimited", aBetter: true },
              { term: "Notice Period", a: "30 days", b: "90 days", aBetter: false },
              { term: "Auto-Renewal", a: "Yes", b: "No", aBetter: false },
            ].map((row) => (
              <div key={row.term} className="grid grid-cols-[1fr_1fr_1fr] gap-2 text-[11px] items-center">
                <span className="text-slate font-medium">{row.term}</span>
                <span className={`px-2 py-1 rounded-[4px] text-center ${row.aBetter ? "bg-teal-light text-teal-dark" : "bg-bg-muted text-near-black"}`}>
                  {row.a}
                </span>
                <span className={`px-2 py-1 rounded-[4px] text-center ${!row.aBetter ? "bg-teal-light text-teal-dark" : "bg-bg-muted text-near-black"}`}>
                  {row.b}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex items-start gap-2">
              <svg className="w-3.5 h-3.5 text-blue-450 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <p className="text-[11px] text-slate">Contract A has a lower liability cap but shorter notice period. Contract B avoids auto-renewal...</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 order-1 md:order-2">
          <h2 className="text-card-title text-near-black">Compare contracts side by side</h2>
          <p className="text-body text-slate">
            Select two contracts for a side-by-side diff, or three or more for a matrix comparison
            across payment terms, liability, termination, and more.
          </p>
          <ul className="space-y-2">
            {[
              "See which terms favor which party",
              "Spot missing clauses at a glance",
              "Get an AI-generated recommendation",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-small text-near-black">
                <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

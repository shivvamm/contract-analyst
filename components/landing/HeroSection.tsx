import React from "react";

export function HeroSection() {
  return (
    <div className="text-center mb-10">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-pill)] bg-blue-450/8 border border-blue-450/20 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        <span className="text-small text-blue-450">Powered by Gemini 2.0 Flash</span>
      </div>
      <h1 className="text-hero text-near-black mb-4">
        Analyze any contract
        <br />
        <span className="text-blue-450">in seconds</span>
      </h1>
      <p className="text-subheading text-slate max-w-xl mx-auto">
        Upload a PDF, DOCX, or paste text to get instant AI-powered risk analysis,
        key terms extraction, and compliance checks.
      </p>
    </div>
  );
}

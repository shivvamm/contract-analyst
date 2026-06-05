"use client";

import React, { useState, useEffect } from "react";
import { useContractStore } from "@/stores/contract-store";

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Chinese",
  "Japanese",
  "Korean",
];

type DraftVerified = "idle" | "verifying" | "valid" | "invalid";

async function verifyGeminiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch("/api/verify-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function ApiKeyInput() {
  const { settings, updateSettings, setApiSettingsOpen } = useContractStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Draft state — only committed to store on Save
  const [draftKey, setDraftKey] = useState("");
  const [draftLanguage, setDraftLanguage] = useState(settings.outputLanguage);
  const [draftVerified, setDraftVerified] = useState<DraftVerified>("idle");
  const [isVerifying, setIsVerifying] = useState(false);

  // Sync draft to latest saved values when panel opens
  const handleOpen = () => {
    setDraftKey(settings.geminiApiKey);
    setDraftLanguage(settings.outputLanguage);
    // Reflect saved verification state in draft
    setDraftVerified(
      settings.geminiKeyVerified === true ? "valid" :
      settings.geminiKeyVerified === false ? "invalid" : "idle"
    );
    setIsOpen(true);
    setApiSettingsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setApiSettingsOpen(false);
    // Discard unsaved draft
    setDraftKey(settings.geminiApiKey);
    setDraftLanguage(settings.outputLanguage);
    setDraftVerified("idle");
  };

  const handleDraftKeyChange = (value: string) => {
    setDraftKey(value);
    setDraftVerified("idle"); // reset verification on any change
  };

  const handleVerify = async () => {
    if (!draftKey.trim()) return;
    setIsVerifying(true);
    setDraftVerified("idle");
    const valid = await verifyGeminiKey(draftKey.trim());
    setDraftVerified(valid ? "valid" : "invalid");
    setIsVerifying(false);
  };

  const handleSave = () => {
    updateSettings({
      geminiApiKey: draftKey.trim(),
      geminiKeyVerified: draftKey.trim() ? (draftVerified === "valid") : null,
      outputLanguage: draftLanguage,
    });
    setIsOpen(false);
    setApiSettingsOpen(false);
  };

  // Save is allowed if:
  // - key is empty (clearing = valid, uses env key)
  // - OR key is non-empty AND verified as valid
  const canSave = !draftKey.trim() || draftVerified === "valid";

  // Show green dot on the collapsed button if the saved key is verified
  const savedIsVerified = settings.geminiKeyVerified === true && !!settings.geminiApiKey;

  return (
    <div className="w-full max-w-lg mx-auto">
      <button
        onClick={() => isOpen ? handleClose() : handleOpen()}
        className="flex items-center gap-2 text-caption text-slate hover:text-near-black transition-colors w-full justify-center"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
        <span>Settings &amp; API Key</span>
        {savedIsVerified && (
          <span className="w-1.5 h-1.5 rounded-full bg-success" title="API key verified" />
        )}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-3 bg-surface ring-miro rounded-[var(--radius-card)] p-4 space-y-4">

          {/* API Key field */}
          <div>
            <label className="block text-caption text-near-black mb-1.5 font-medium">
              Gemini API Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? "text" : "password"}
                  value={draftKey}
                  onChange={(e) => handleDraftKeyChange(e.target.value)}
                  placeholder="AIza…"
                  className="w-full rounded-[var(--radius-button)] border border-input-border bg-bg px-3 py-2 pr-10 text-body text-near-black placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-blue-450 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-placeholder hover:text-slate transition-colors"
                  aria-label={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Verify button — only shown when key is non-empty */}
              {draftKey.trim() && (
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="flex-shrink-0 px-3 py-2 rounded-[var(--radius-button)] border border-input-border text-caption text-slate hover:border-blue-450 hover:text-blue-450 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : "Verify"}
                </button>
              )}
            </div>

            {/* Verification status */}
            {draftVerified === "valid" && (
              <p className="flex items-center gap-1.5 text-small text-success mt-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                API key is valid
              </p>
            )}
            {draftVerified === "invalid" && (
              <p className="flex items-center gap-1.5 text-small text-coral-dark mt-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Invalid key — check it and try again
              </p>
            )}
            {draftVerified === "idle" && draftKey.trim() && (
              <p className="text-small text-placeholder mt-1">Verify your key before saving</p>
            )}
            {!draftKey.trim() && (
              <p className="text-small text-placeholder mt-1">
                Get your free key at{" "}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-450 hover:underline">
                  aistudio.google.com
                </a>
                {" "}— or leave empty to use the default.
              </p>
            )}
          </div>

          {/* Language */}
          <div>
            <label className="block text-caption text-near-black mb-1.5 font-medium">
              Output Language
            </label>
            <select
              value={draftLanguage}
              onChange={(e) => setDraftLanguage(e.target.value)}
              className="w-full rounded-[var(--radius-button)] border border-input-border bg-bg px-3 py-2 text-body text-near-black focus:outline-none focus:ring-2 focus:ring-blue-450 focus:border-transparent"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="text-caption text-slate hover:text-near-black transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="px-5 py-2 bg-blue-450 text-surface text-caption rounded-[var(--radius-button)] hover:bg-blue-pressed transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={!canSave ? "Verify your API key before saving" : undefined}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";
import type { KeyTerms } from "@/types";

interface KeyTermsPanelProps {
  keyTerms: KeyTerms;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface/70 rounded-[var(--radius-button)] p-3">
      <h4 className="text-small text-yellow-dark font-medium uppercase tracking-wide mb-2">{title}</h4>
      {children}
    </div>
  );
}

export function KeyTermsPanel({ keyTerms }: KeyTermsPanelProps) {
  return (
    <div className="bg-orange-light ring-miro rounded-[var(--radius-card)] p-5 space-y-4">
      <h3 className="text-feature text-yellow-dark">Key Terms</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Parties */}
        <Section title="Parties">
          {keyTerms.parties.length === 0 ? (
            <p className="text-small text-slate">None identified</p>
          ) : (
            <ul className="space-y-1">
              {keyTerms.parties.map((p, i) => (
                <li key={i} className="text-small text-near-black">
                  <span className="text-placeholder">{p.role}:</span> {p.name}
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Key Dates */}
        <Section title="Key Dates">
          {keyTerms.effectiveDates.length === 0 ? (
            <p className="text-small text-slate">None identified</p>
          ) : (
            <ul className="space-y-1">
              {keyTerms.effectiveDates.map((d, i) => (
                <li key={i} className="text-small text-near-black">
                  <span className="text-placeholder capitalize">{d.type}:</span> {d.date}
                  {d.description && <span className="text-placeholder"> — {d.description}</span>}
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Payment */}
        <Section title="Payment Terms">
          {keyTerms.paymentTerms.length === 0 ? (
            <p className="text-small text-slate">None identified</p>
          ) : (
            <ul className="space-y-1">
              {keyTerms.paymentTerms.map((p, i) => (
                <li key={i} className="text-small text-near-black">
                  {p.amount && <span className="font-medium">{p.amount} </span>}
                  {p.schedule && <span className="text-placeholder">{p.schedule}</span>}
                  {p.penalties && <span className="text-coral-dark"> · {p.penalties}</span>}
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Termination */}
        <Section title="Termination">
          {keyTerms.terminationConditions.length === 0 ? (
            <p className="text-small text-slate">None identified</p>
          ) : (
            <ul className="space-y-1">
              {keyTerms.terminationConditions.map((t, i) => (
                <li key={i} className="flex items-start gap-1.5 text-small text-near-black">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-yellow-dark flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Legal */}
        <Section title="Legal">
          <div className="space-y-1 text-small text-near-black">
            {keyTerms.jurisdiction && (
              <p><span className="text-placeholder">Jurisdiction:</span> {keyTerms.jurisdiction}</p>
            )}
            {keyTerms.governingLaw && (
              <p><span className="text-placeholder">Governing Law:</span> {keyTerms.governingLaw}</p>
            )}
            {!keyTerms.jurisdiction && !keyTerms.governingLaw && (
              <p className="text-slate">None identified</p>
            )}
          </div>
        </Section>

        {/* Confidentiality */}
        <Section title="Confidentiality">
          {keyTerms.confidentialityClauses.length === 0 ? (
            <p className="text-small text-slate">None identified</p>
          ) : (
            <ul className="space-y-1">
              {keyTerms.confidentialityClauses.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5 text-small text-near-black">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-yellow-dark flex-shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

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
    addComplianceSection(doc, analysis.compliance, y);
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const disclaimer =
    "This is an AI-powered analysis tool, not legal advice. Consult a qualified attorney for legal decisions.";
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.text(disclaimer, 20, 285);
    doc.text(`Page ${i} of ${totalPages}`, 170, 285);
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

function addSummarySection(doc: jsPDF, summary: ContractSummary, y: number): number {
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

function addKeyTermsSection(doc: jsPDF, terms: KeyTerms, y: number): number {
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
    doc.text(`[${risk.severity.toUpperCase()}] ${risk.title}`, 20, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(risk.description, 165);
    doc.text(descLines, 25, y);
    y += descLines.length * 5 + 8;
  }

  return y;
}

function addComplianceSection(doc: jsPDF, findings: ComplianceFinding[], y: number): number {
  y = checkPageBreak(doc, y, 30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Compliance Findings", 20, y);
  y += 10;

  for (const finding of findings) {
    y = checkPageBreak(doc, y, 25);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`[${finding.status.toUpperCase()}] ${finding.title}`, 20, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(finding.description, 165);
    doc.text(descLines, 25, y);
    y += descLines.length * 5 + 8;
  }

  return y;
}

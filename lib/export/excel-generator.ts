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
      termsData.push({ Category: "Party", Name: party.name, Detail: party.role, Clause: "", Page: "" });
    }
    for (const date of analysis.keyTerms.effectiveDates) {
      termsData.push({ Category: "Date", Name: date.type, Detail: `${date.date} — ${date.description}`, Clause: "", Page: "" });
    }
    for (const payment of analysis.keyTerms.paymentTerms) {
      termsData.push({
        Category: "Payment", Name: payment.amount,
        Detail: `${payment.schedule}${payment.penalties ? ` (Penalty: ${payment.penalties})` : ""}`,
        Clause: payment.description, Page: "",
      });
    }
    for (const obligation of analysis.keyTerms.obligations) {
      termsData.push({
        Category: "Obligation", Name: obligation.party,
        Detail: obligation.description, Clause: obligation.clause,
        Page: obligation.pageNumber?.toString() || "",
      });
    }
    if (analysis.keyTerms.jurisdiction) {
      termsData.push({ Category: "Jurisdiction", Name: analysis.keyTerms.jurisdiction, Detail: "", Clause: "", Page: "" });
    }
    if (analysis.keyTerms.governingLaw) {
      termsData.push({ Category: "Governing Law", Name: analysis.keyTerms.governingLaw, Detail: "", Clause: "", Page: "" });
    }

    const termsSheet = XLSX.utils.json_to_sheet(termsData);
    XLSX.utils.book_append_sheet(wb, termsSheet, "Key Terms");
  }

  if (analysis.risks.length > 0) {
    const risksData = analysis.risks.map((r) => ({
      Severity: r.severity.toUpperCase(), Title: r.title, Description: r.description,
      Category: r.category, Clause: r.clause, Page: r.pageNumber?.toString() || "",
    }));
    const risksSheet = XLSX.utils.json_to_sheet(risksData);
    XLSX.utils.book_append_sheet(wb, risksSheet, "Risks");
  }

  if (analysis.compliance.length > 0) {
    const complianceData = analysis.compliance.map((c) => ({
      Status: c.status.toUpperCase(), Title: c.title, Description: c.description,
      Standard: c.standard, Clause: c.clause || "", Page: c.pageNumber?.toString() || "",
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
      Type: "Risk", Severity: risk.severity, Title: risk.title,
      Description: risk.description, Clause: risk.clause, Page: risk.pageNumber?.toString() || "",
    });
  }
  for (const finding of analysis.compliance) {
    rows.push({
      Type: "Compliance", Severity: finding.status, Title: finding.title,
      Description: finding.description, Clause: finding.clause || "", Page: finding.pageNumber?.toString() || "",
    });
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Analysis");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "csv" });
  return Buffer.from(buf);
}

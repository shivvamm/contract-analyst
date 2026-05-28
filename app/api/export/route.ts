import { NextRequest, NextResponse } from "next/server";
import { generatePdfReport } from "@/lib/export/pdf-generator";
import { generateExcelReport, generateCsvReport } from "@/lib/export/excel-generator";
import type { ContractAnalysis } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { format, analysis, pageCount } = body;
    const fileName = String(body.fileName ?? "report").replace(/[^a-zA-Z0-9._\- ]/g, "_");

    if (!analysis || !format) {
      return NextResponse.json({ error: "Format and analysis data required" }, { status: 400 });
    }

    const typedAnalysis: ContractAnalysis = {
      ...(analysis as ContractAnalysis),
      risks: Array.isArray(analysis.risks) ? analysis.risks : [],
      compliance: Array.isArray(analysis.compliance) ? analysis.compliance : [],
      summary: analysis.summary ?? null,
      keyTerms: analysis.keyTerms ?? null,
      error: analysis.error ?? null,
    };

    switch (format) {
      case "pdf": {
        const pdfBuffer = generatePdfReport(fileName || "contract", typedAnalysis, pageCount || 0);
        return new Response(new Uint8Array(pdfBuffer), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${fileName || "report"}-analysis.pdf"`,
          },
        });
      }
      case "xlsx": {
        const xlsxBuffer = generateExcelReport(fileName || "contract", typedAnalysis);
        return new Response(new Uint8Array(xlsxBuffer), {
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${fileName || "report"}-analysis.xlsx"`,
          },
        });
      }
      case "csv": {
        const csvBuffer = generateCsvReport(fileName || "contract", typedAnalysis);
        return new Response(new Uint8Array(csvBuffer), {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${fileName || "report"}-analysis.csv"`,
          },
        });
      }
      default:
        return NextResponse.json({ error: `Unsupported format: ${format}` }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

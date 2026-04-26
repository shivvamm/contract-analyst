import { describe, it, expect } from "vitest";
import { detectFileType, parseTextInput } from "@/lib/parsers";

describe("detectFileType", () => {
  it("detects PDF files", () => {
    expect(detectFileType("contract.pdf", "application/pdf")).toBe("pdf");
  });

  it("detects DOCX files", () => {
    expect(
      detectFileType(
        "contract.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ).toBe("docx");
  });

  it("detects image files", () => {
    expect(detectFileType("scan.png", "image/png")).toBe("image");
    expect(detectFileType("scan.jpg", "image/jpeg")).toBe("image");
  });

  it("defaults to text for unknown types", () => {
    expect(detectFileType("file.txt", "text/plain")).toBe("text");
  });
});

describe("parseTextInput", () => {
  it("returns text directly with page count", () => {
    const result = parseTextInput("Hello contract world");
    expect(result.rawText).toBe("Hello contract world");
    expect(result.pageCount).toBe(1);
  });
});

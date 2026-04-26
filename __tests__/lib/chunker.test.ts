import { describe, it, expect } from "vitest";
import { chunkText } from "@/lib/gemini/chunker";

describe("chunkText", () => {
  it("splits by section headings when structure detected", () => {
    const text = `ARTICLE 1: DEFINITIONS
This section defines terms.

ARTICLE 2: OBLIGATIONS
The parties shall perform obligations.

ARTICLE 3: PAYMENT
Payment is due net 30.`;

    const chunks = chunkText(text, 12000);
    expect(chunks.length).toBe(3);
    expect(chunks[0].sectionTitle).toBe("ARTICLE 1: DEFINITIONS");
    expect(chunks[1].sectionTitle).toBe("ARTICLE 2: OBLIGATIONS");
    expect(chunks[2].sectionTitle).toBe("ARTICLE 3: PAYMENT");
  });

  it("falls back to token-based chunking when no structure", () => {
    const longText = "word ".repeat(5000);
    const chunks = chunkText(longText, 1000);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeLessThanOrEqual(1200);
    }
  });

  it("preserves overlap between token-based chunks", () => {
    const longText = "word ".repeat(3000);
    const chunks = chunkText(longText, 1000, 200);
    if (chunks.length > 1) {
      const end0 = chunks[0].text.slice(-100);
      const start1 = chunks[1].text.slice(0, 100);
      expect(chunks[1].text).toContain(end0.trim().split(" ").pop());
    }
  });

  it("returns single chunk for short text", () => {
    const text = "This is a short contract.";
    const chunks = chunkText(text, 12000);
    expect(chunks.length).toBe(1);
    expect(chunks[0].text).toBe(text);
  });

  it("assigns page numbers from markers", () => {
    const text = `[PAGE 1]
First page content.

[PAGE 2]
Second page content.

[PAGE 3]
Third page content.`;

    const chunks = chunkText(text, 12000);
    expect(chunks[0].pageNumbers).toContain(1);
  });

  it("detects numbered section patterns", () => {
    const text = `Section 1. General Provisions
Some text here.

Section 2. Scope of Work
More text here.

Section 3. Compensation
Payment details.`;

    const chunks = chunkText(text, 12000);
    expect(chunks.length).toBe(3);
    expect(chunks[0].sectionTitle).toContain("Section 1");
  });
});

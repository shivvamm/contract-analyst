import type { ContractChunk } from "@/types";

function uuid(): string {
  return crypto.randomUUID();
}

const SECTION_PATTERNS = [
  /^(ARTICLE\s+\d+[.:]\s*.+)$/gm,
  /^(Section\s+\d+[.:]\s*.+)$/gm,
  /^(SECTION\s+\d+[.:]\s*.+)$/gm,
  /^(CLAUSE\s+\d+[.:]\s*.+)$/gm,
  /^(\d+\.\s+[A-Z][A-Z\s]+)$/gm,
  /^(\d+\.\d+\s+[A-Z].+)$/gm,
  /^(SCHEDULE\s+[A-Z0-9]+[.:]\s*.+)$/gm,
  /^(EXHIBIT\s+[A-Z0-9]+[.:]\s*.+)$/gm,
  /^(APPENDIX\s+[A-Z0-9]+[.:]\s*.+)$/gm,
];

const PAGE_MARKER = /\[PAGE\s+(\d+)\]/g;

function extractPageNumbers(text: string): number[] {
  const pages: number[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(PAGE_MARKER.source, "g");
  while ((match = regex.exec(text)) !== null) {
    pages.push(parseInt(match[1], 10));
  }
  return pages.length > 0 ? pages : [1];
}

function findSectionSplits(text: string): { title: string; start: number }[] {
  const splits: { title: string; start: number }[] = [];

  for (const pattern of SECTION_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      splits.push({ title: match[1].trim(), start: match.index });
    }
  }

  splits.sort((a, b) => a.start - b.start);

  const seen = new Set<number>();
  const deduplicated: typeof splits = [];
  for (const split of splits) {
    if (!seen.has(split.start)) {
      seen.add(split.start);
      deduplicated.push(split);
    }
  }

  return deduplicated;
}

function chunkByTokenSize(
  text: string,
  maxChars: number,
  overlapChars: number
): ContractChunk[] {
  const chunks: ContractChunk[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length);

    if (end < text.length) {
      const lastSpace = text.lastIndexOf(" ", end);
      if (lastSpace > start) {
        end = lastSpace;
      }
    }

    const chunkText = text.slice(start, end).trim();
    if (chunkText.length > 0) {
      chunks.push({
        id: uuid(),
        text: chunkText,
        pageNumbers: extractPageNumbers(chunkText),
        sectionTitle: null,
        index: chunks.length,
      });
    }

    if (end >= text.length) {
      break;
    }
    const next = end - overlapChars;
    start = next > start ? next : end;
  }

  return chunks;
}

export function chunkText(
  text: string,
  maxCharsPerChunk: number = 12000,
  overlapChars: number = 800
): ContractChunk[] {
  const sections = findSectionSplits(text);

  if (sections.length >= 2) {
    const chunks: ContractChunk[] = [];

    for (let i = 0; i < sections.length; i++) {
      const start = sections[i].start;
      const end = i + 1 < sections.length ? sections[i + 1].start : text.length;
      const sectionText = text.slice(start, end).trim();

      if (sectionText.length <= maxCharsPerChunk) {
        chunks.push({
          id: uuid(),
          text: sectionText,
          pageNumbers: extractPageNumbers(sectionText),
          sectionTitle: sections[i].title,
          index: chunks.length,
        });
      } else {
        const subChunks = chunkByTokenSize(sectionText, maxCharsPerChunk, overlapChars);
        subChunks.forEach((sub, j) => {
          sub.sectionTitle = j === 0 ? sections[i].title : `${sections[i].title} (continued)`;
          sub.index = chunks.length + j;
        });
        chunks.push(...subChunks);
      }
    }

    const preContent = text.slice(0, sections[0].start).trim();
    if (preContent.length > 0) {
      chunks.unshift({
        id: uuid(),
        text: preContent,
        pageNumbers: extractPageNumbers(preContent),
        sectionTitle: "Preamble",
        index: 0,
      });
      chunks.forEach((c, i) => (c.index = i));
    }

    return chunks;
  }

  if (text.length <= maxCharsPerChunk) {
    return [
      {
        id: uuid(),
        text,
        pageNumbers: extractPageNumbers(text),
        sectionTitle: null,
        index: 0,
      },
    ];
  }

  return chunkByTokenSize(text, maxCharsPerChunk, overlapChars);
}

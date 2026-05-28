export function extractJSON(text: string): string {
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (fenced) {
    try {
      JSON.parse(fenced[1]);
      return fenced[1];
    } catch { /* fall through */ }
  }

  const trimmed = text.trim();
  try {
    JSON.parse(trimmed);
    return trimmed;
  } catch { /* fall through */ }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch !== "{" && ch !== "[") continue;
    const closer = ch === "{" ? "}" : "]";
    const lastClose = text.lastIndexOf(closer);
    if (lastClose <= i) continue;
    const candidate = text.slice(i, lastClose + 1);
    try {
      JSON.parse(candidate);
      return candidate;
    } catch { /* try next opening bracket */ }
  }

  throw new Error("No valid JSON found in response");
}

import type { ContractChunk } from "@/types";

export function buildExtractionPrompt(chunks: ContractChunk[], language: string): string {
  const text = chunks.map((c) => c.text).join("\n\n---\n\n");
  return `You are a contract analysis expert. Extract all key terms from the following contract text.

Respond in ${language}. Return ONLY valid JSON with this exact structure:
\`\`\`json
{
  "parties": [{ "name": "string", "role": "string" }],
  "effectiveDates": [{ "type": "effective|expiration|renewal|other", "date": "string", "description": "string" }],
  "paymentTerms": [{ "amount": "string", "schedule": "string", "penalties": "string or null", "description": "string" }],
  "obligations": [{ "party": "string", "description": "string", "clause": "string", "pageNumber": number or null }],
  "terminationConditions": ["string"],
  "confidentialityClauses": ["string"],
  "jurisdiction": "string or null",
  "governingLaw": "string or null"
}
\`\`\`

CONTRACT TEXT:
${text}`;
}

export function buildRiskPrompt(chunks: ContractChunk[], language: string): string {
  const text = chunks.map((c) => c.text).join("\n\n---\n\n");
  return `You are a contract risk analyst. Analyze the following contract for risks and unfavorable terms.

Look for:
- One-sided indemnification clauses
- Unlimited liability exposure
- Auto-renewal traps
- Missing protections (no liability cap, no termination for convenience, no IP ownership clause)
- Penalty exposure and financial risk
- Ambiguous language that could be exploited

For each risk, assess severity as "high", "medium", or "low".

Respond in ${language}. Return ONLY valid JSON:
\`\`\`json
{
  "risks": [
    {
      "severity": "high|medium|low",
      "title": "Short risk title",
      "description": "Plain-English explanation of why this matters and what could go wrong",
      "clause": "The exact or paraphrased clause text",
      "pageNumber": number or null,
      "category": "liability|financial|termination|ip|confidentiality|compliance|other"
    }
  ]
}
\`\`\`

CONTRACT TEXT:
${text}`;
}

export function buildCompliancePrompt(chunks: ContractChunk[], keyTermsJson: string, language: string): string {
  const text = chunks.map((c) => c.text).join("\n\n---\n\n");
  return `You are a contract compliance specialist. Check the following contract against standard compliance requirements.

Check against:
1. GDPR data handling requirements (if personal data is involved)
2. Standard contract law red flags (unconscionable terms, missing consideration, vague essential terms)
3. Industry best practices (clear dispute resolution, adequate notice periods, reasonable limitation of liability)

Previously extracted key terms for context:
${keyTermsJson}

For each finding, rate as "compliant", "warning", or "non-compliant".

Respond in ${language}. Return ONLY valid JSON:
\`\`\`json
{
  "compliance": [
    {
      "status": "compliant|warning|non-compliant",
      "title": "Short finding title",
      "description": "Explanation of the finding and its implications",
      "standard": "Which standard or best practice this relates to",
      "clause": "Relevant clause text or null",
      "pageNumber": number or null
    }
  ]
}
\`\`\`

CONTRACT TEXT:
${text}`;
}

export function buildSummaryPrompt(chunks: ContractChunk[], keyTermsJson: string, risksJson: string, language: string): string {
  const text = chunks.map((c) => c.text).join("\n\n---\n\n");
  return `You are a contract summarization expert. Create a layered summary of the following contract.

Previously extracted data for context:
Key Terms: ${keyTermsJson}
Risks: ${risksJson}

Create three layers of summary:
- Layer 1: ONE sentence describing what this contract is about
- Layer 2: 3-5 bullet points covering the essential terms (who, what, when, how much, key obligations)
- Layer 3: Section-by-section detailed breakdown in plain English that a non-lawyer can understand

Respond in ${language}. Return ONLY valid JSON:
\`\`\`json
{
  "layer1": "One sentence summary",
  "layer2": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
  "layer3": [
    {
      "title": "Section title",
      "content": "Plain English explanation of this section",
      "pageNumbers": [1, 2]
    }
  ]
}
\`\`\`

CONTRACT TEXT:
${text}`;
}

export function buildSuggestedQuestionsPrompt(keyTermsJson: string, risksJson: string, language: string): string {
  return `Based on the following contract analysis, suggest 5 follow-up questions a user might want to ask about this contract. Make them practical and specific to this contract's content.

Key Terms: ${keyTermsJson}
Risks: ${risksJson}

Respond in ${language}. Return ONLY a JSON array of strings:
\`\`\`json
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]
\`\`\``;
}

export function buildChatPrompt(question: string, contractText: string, analysisContext: string, chatHistory: string, language: string): string {
  return `You are a contract analysis assistant. Answer the user's question based ONLY on the provided contract text and analysis.

RULES:
- Answer only from the provided contract text. Do not make up information.
- Cite specific sections, clauses, or page numbers when referencing the contract.
- If the contract doesn't address the question, say: "This contract doesn't appear to address that topic."
- Never give legal advice. If the question requires legal judgment, recommend consulting a qualified attorney.
- Be clear and concise. Use plain English.

Respond in ${language}.

ANALYSIS CONTEXT:
${analysisContext}

CONTRACT TEXT:
${contractText}

${chatHistory ? `CHAT HISTORY:\n${chatHistory}\n` : ""}
USER QUESTION: ${question}

Respond with your answer. At the end, include source references in this format:
[Sources: Section X (Page Y), Section Z (Page W)]`;
}

export function buildSideBySidePrompt(termsA: string, termsB: string, risksA: string, risksB: string, nameA: string, nameB: string, language: string): string {
  return `You are a contract comparison expert. Compare these two contracts and identify differences.

CONTRACT A ("${nameA}"):
Key Terms: ${termsA}
Risks: ${risksA}

CONTRACT B ("${nameB}"):
Key Terms: ${termsB}
Risks: ${risksB}

Respond in ${language}. Return ONLY valid JSON:
\`\`\`json
{
  "betterInA": [{ "term": "string", "valueA": "string", "valueB": "string", "explanation": "string" }],
  "betterInB": [{ "term": "string", "valueA": "string", "valueB": "string", "explanation": "string" }],
  "missingInA": ["Terms present in B but missing from A"],
  "missingInB": ["Terms present in A but missing from B"],
  "riskDifferences": [{ "title": "string", "severityA": "high|medium|low|none", "severityB": "high|medium|low|none", "explanation": "string" }],
  "recommendation": "Overall plain-English recommendation on which contract is more favorable and why"
}
\`\`\``;
}

export function buildMatrixPrompt(contracts: { name: string; terms: string; risks: string }[], language: string): string {
  const contractsText = contracts.map((c, i) => `CONTRACT ${i + 1} ("${c.name}"):\nKey Terms: ${c.terms}\nRisks: ${c.risks}`).join("\n\n");
  return `You are a contract comparison expert. Create a comparison matrix for these contracts.

${contractsText}

Compare across these dimensions: Payment Terms, Liability Cap, Termination Notice Period, Auto-Renewal, Indemnification, Confidentiality Period, Dispute Resolution, Governing Law.

Respond in ${language}. Return ONLY valid JSON:
\`\`\`json
{
  "dimensions": ["Dimension names that were compared"],
  "rows": [
    {
      "dimension": "Dimension name",
      "values": [
        {
          "contractId": "Index (0-based) as string",
          "value": "The term value or 'Not specified'",
          "favorability": "good|neutral|bad",
          "clauseText": "Relevant clause excerpt"
        }
      ]
    }
  ]
}
\`\`\``;
}

import type { MappingRule } from "../types";

export function categorize(
  description: string,
  rules: MappingRule[],
): { category: string; confidence: number } {
  const lowerDesc = description.toLowerCase();

  // Find all matching rules
  const matches = rules.filter((r) =>
    lowerDesc.includes(r.keyword.toLowerCase()),
  );

  if (matches.length === 0) {
    return { category: "Uncategorized", confidence: 0 };
  }

  // Score each category by sum of matching keyword lengths
  const scores: Record<string, number> = {};
  for (const match of matches) {
    const cat = match.category;
    scores[cat] = (scores[cat] || 0) + match.keyword.length;
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [winningCategory, winningScore] = entries[0];
  const confidence = Math.round((winningScore / totalScore) * 100);

  return { category: winningCategory, confidence };
}

export function recategorizeAll(
  transactions: Array<{
    id: string;
    description: string;
    isManualOverride: boolean;
    category: string;
    confidence: number;
  }>,
  rules: MappingRule[],
) {
  return transactions.map((tx) => {
    if (tx.isManualOverride) return tx;
    const result = categorize(tx.description, rules);
    return { ...tx, category: result.category, confidence: result.confidence };
  });
}

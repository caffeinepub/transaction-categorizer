import type { MappingRule, Transaction } from "../types";
import { categorize } from "./categorize";

export function parseTransactionCSV(
  text: string,
  rules: MappingRule[],
): Transaction[] {
  const lines = text.trim().split(/\r?\n/);
  // skip header row
  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const parts = splitCSVLine(line);
      const date = parts[0]?.trim() ?? "";
      const description = parts[1]?.trim() ?? "";
      const amount = Number.parseFloat(parts[2]?.trim() ?? "0") || 0;
      const id = crypto.randomUUID();
      const { category, confidence } = categorize(description, rules);
      return {
        id,
        date,
        description,
        amount,
        category,
        confidence,
        isManualOverride: false,
      };
    });
}

export function parseMappingCSV(text: string): MappingRule[] {
  const lines = text.trim().split(/\r?\n/);
  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const parts = splitCSVLine(line);
      return {
        id: crypto.randomUUID(),
        keyword: parts[0]?.trim() ?? "",
        category: parts[1]?.trim() ?? "",
      };
    })
    .filter((r) => r.keyword && r.category);
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export function exportTransactionsCSV(transactions: Transaction[]): void {
  const header = "Date,Description,Amount,Category,Confidence\n";
  const rows = transactions
    .map((tx) => {
      const conf = tx.isManualOverride
        ? "Manual"
        : tx.confidence === 0
          ? "—"
          : `${tx.confidence}%`;
      return `${escapeCSV(tx.date)},${escapeCSV(tx.description)},${tx.amount},${escapeCSV(tx.category)},${conf}`;
    })
    .join("\n");
  const csv = header + rows;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "categorized-transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCSV(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

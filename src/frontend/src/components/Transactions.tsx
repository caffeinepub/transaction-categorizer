import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { recategorizeAll } from "../lib/categorize";
import { parseMappingCSV, parseTransactionCSV } from "../lib/csvUtils";
import type { MappingRule, Transaction } from "../types";

interface Props {
  transactions: Transaction[];
  rules: MappingRule[];
  onTransactionsChange: (txs: Transaction[]) => void;
  onRulesChange: (rules: MappingRule[]) => void;
}

function ConfidenceBadge({ tx }: { tx: Transaction }) {
  if (tx.isManualOverride) {
    return (
      <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-muted-foreground">
        Manual
      </span>
    );
  }
  if (tx.confidence === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      Auto ({tx.confidence}%)
    </span>
  );
}

export default function Transactions({
  transactions,
  rules,
  onTransactionsChange,
  onRulesChange,
}: Props) {
  const txFileRef = useRef<HTMLInputElement>(null);
  const mapFileRef = useRef<HTMLInputElement>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const allCategories = Array.from(
    new Set([
      ...rules.map((r) => r.category),
      ...transactions.map((t) => t.category),
      "Uncategorized",
    ]),
  ).sort();

  const handleTxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseTransactionCSV(text, rules);
      onTransactionsChange(parsed);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseMappingCSV(text);
      onRulesChange(parsed);
      const updated = recategorizeAll(transactions, parsed);
      onTransactionsChange(updated as Transaction[]);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCategoryChange = (txId: string, newCategory: string) => {
    const updated = transactions.map((tx) =>
      tx.id === txId
        ? {
            ...tx,
            category: newCategory,
            isManualOverride: true,
            confidence: 0,
          }
        : tx,
    );
    onTransactionsChange(updated);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-5" data-ocid="transactions.section">
      {/* Upload actions */}
      <div className="flex flex-wrap gap-3">
        <input
          ref={txFileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleTxUpload}
          data-ocid="transactions.upload_button"
        />
        <Button
          variant="outline"
          onClick={() => txFileRef.current?.click()}
          className="gap-2 border-border text-foreground hover:bg-accent"
          data-ocid="transactions.csv_upload_button"
        >
          <Upload className="h-4 w-4" />
          Upload Transactions CSV
        </Button>

        <input
          ref={mapFileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleMapUpload}
        />
        <Button
          variant="outline"
          onClick={() => mapFileRef.current?.click()}
          className="gap-2 border-border text-foreground hover:bg-accent"
          data-ocid="transactions.mapping_upload_button"
        >
          <FileText className="h-4 w-4" />
          Upload Mapping Rules CSV
        </Button>
      </div>

      {/* CSV format hints */}
      <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Transactions CSV format:</strong>{" "}
        date, description, amount (header row required) &nbsp;|&nbsp;
        <strong className="text-foreground">Mapping CSV format:</strong>{" "}
        keyword, category (header row required)
      </div>

      {/* Transactions table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">
            Transactions
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({transactions.length})
            </span>
          </h3>
        </div>
        {transactions.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-3 py-16 text-center"
            data-ocid="transactions.empty_state"
          >
            <Upload className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              No transactions loaded
            </p>
            <p className="text-xs text-muted-foreground">
              Upload a CSV file to get started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Date
                  </th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Description
                  </th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Amount
                  </th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Category
                  </th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr
                    key={tx.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/20"
                    data-ocid={`transactions.item.${i + 1}`}
                  >
                    <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                      {tx.date}
                    </td>
                    <td className="max-w-[240px] truncate px-5 py-3 font-medium text-foreground">
                      {tx.description}
                    </td>
                    <td
                      className={`whitespace-nowrap px-5 py-3 text-right font-semibold ${
                        tx.amount >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {tx.amount >= 0 ? "+" : ""}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(tx.amount)}
                    </td>
                    <td className="px-5 py-3">
                      {editingCategory === tx.id ? (
                        <Select
                          defaultValue={tx.category}
                          onValueChange={(val) =>
                            handleCategoryChange(tx.id, val)
                          }
                          onOpenChange={(open) => {
                            if (!open) setEditingCategory(null);
                          }}
                        >
                          <SelectTrigger
                            className="h-7 w-[160px] text-xs"
                            data-ocid={`transactions.select.${i + 1}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {allCategories.map((cat) => (
                              <SelectItem
                                key={cat}
                                value={cat}
                                className="text-xs"
                              >
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingCategory(tx.id)}
                          className="rounded px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                          data-ocid={`transactions.edit_button.${i + 1}`}
                        >
                          {tx.category}
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <ConfidenceBadge tx={tx} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

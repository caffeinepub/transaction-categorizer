import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { MappingRule } from "../types";

interface Props {
  rules: MappingRule[];
  onRulesChange: (rules: MappingRule[]) => void;
}

interface EditState {
  keyword: string;
  category: string;
}

export default function MappingManager({ rules, onRulesChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({
    keyword: "",
    category: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newRule, setNewRule] = useState<EditState>({
    keyword: "",
    category: "",
  });

  const startEdit = (rule: MappingRule) => {
    setEditingId(rule.id);
    setEditState({ keyword: rule.keyword, category: rule.category });
    setIsAdding(false);
  };

  const saveEdit = () => {
    if (!editingId) return;
    onRulesChange(
      rules.map((r) =>
        r.id === editingId
          ? {
              ...r,
              keyword: editState.keyword.trim(),
              category: editState.category.trim(),
            }
          : r,
      ),
    );
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const deleteRule = (id: string) => {
    onRulesChange(rules.filter((r) => r.id !== id));
  };

  const addRule = () => {
    if (!newRule.keyword.trim() || !newRule.category.trim()) return;
    onRulesChange([
      ...rules,
      {
        id: crypto.randomUUID(),
        keyword: newRule.keyword.trim(),
        category: newRule.category.trim(),
      },
    ]);
    setNewRule({ keyword: "", category: "" });
    setIsAdding(false);
  };

  return (
    <div className="space-y-5" data-ocid="mapping.section">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rules.length} rule{rules.length !== 1 ? "s" : ""} defined. Changes
          immediately re-categorize all transactions.
        </p>
        <Button
          size="sm"
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
          }}
          className="gap-2"
          data-ocid="mapping.open_modal_button"
        >
          <Plus className="h-4 w-4" />
          Add Rule
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Keyword
              </th>
              <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Category
              </th>
              <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Add row */}
            {isAdding && (
              <tr className="border-b border-border bg-primary/5">
                <td className="px-4 py-2">
                  <Input
                    autoFocus
                    value={newRule.keyword}
                    onChange={(e) =>
                      setNewRule((p) => ({ ...p, keyword: e.target.value }))
                    }
                    placeholder="e.g. netflix"
                    className="h-7 text-xs"
                    data-ocid="mapping.input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addRule();
                      if (e.key === "Escape") setIsAdding(false);
                    }}
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={newRule.category}
                    onChange={(e) =>
                      setNewRule((p) => ({ ...p, category: e.target.value }))
                    }
                    placeholder="e.g. Entertainment"
                    className="h-7 text-xs"
                    data-ocid="mapping.textarea"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addRule();
                      if (e.key === "Escape") setIsAdding(false);
                    }}
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={addRule}
                      data-ocid="mapping.confirm_button"
                    >
                      <Check className="h-3.5 w-3.5 text-success" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => setIsAdding(false)}
                      data-ocid="mapping.cancel_button"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </td>
              </tr>
            )}
            {rules.length === 0 && !isAdding && (
              <tr>
                <td
                  colSpan={3}
                  className="px-5 py-12 text-center text-sm text-muted-foreground"
                  data-ocid="mapping.empty_state"
                >
                  No mapping rules defined. Click "Add Rule" to get started.
                </td>
              </tr>
            )}
            {rules.map((rule, i) => (
              <tr
                key={rule.id}
                className="border-b border-border/60 last:border-0 hover:bg-muted/20"
                data-ocid={`mapping.item.${i + 1}`}
              >
                {editingId === rule.id ? (
                  <>
                    <td className="px-4 py-2">
                      <Input
                        autoFocus
                        value={editState.keyword}
                        onChange={(e) =>
                          setEditState((p) => ({
                            ...p,
                            keyword: e.target.value,
                          }))
                        }
                        className="h-7 text-xs"
                        data-ocid={`mapping.input.${i + 1}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={editState.category}
                        onChange={(e) =>
                          setEditState((p) => ({
                            ...p,
                            category: e.target.value,
                          }))
                        }
                        className="h-7 text-xs"
                        data-ocid={`mapping.textarea.${i + 1}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={saveEdit}
                          data-ocid={`mapping.save_button.${i + 1}`}
                        >
                          <Check className="h-3.5 w-3.5 text-success" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={cancelEdit}
                          data-ocid={`mapping.cancel_button.${i + 1}`}
                        >
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-5 py-3 font-mono text-xs font-medium text-foreground">
                      {rule.keyword}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {rule.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 hover:bg-primary/10"
                          onClick={() => startEdit(rule)}
                          data-ocid={`mapping.edit_button.${i + 1}`}
                        >
                          <Pencil className="h-3.5 w-3.5 text-primary" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 hover:bg-destructive/10"
                          onClick={() => deleteRule(rule.id)}
                          data-ocid={`mapping.delete_button.${i + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

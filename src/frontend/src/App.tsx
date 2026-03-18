import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/sonner";
import {
  BarChart3,
  Download,
  FileText,
  LayoutDashboard,
  ListOrdered,
  Tags,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Dashboard from "./components/Dashboard";
import MappingManager from "./components/MappingManager";
import Transactions from "./components/Transactions";
import { recategorizeAll } from "./lib/categorize";
import {
  exportTransactionsCSV,
  parseMappingCSV,
  parseTransactionCSV,
} from "./lib/csvUtils";
import { SAMPLE_RULES, buildSampleTransactions } from "./lib/sampleData";
import type { ActiveTab, MappingRule, Transaction } from "./types";

const TABS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: <ListOrdered className="h-4 w-4" />,
  },
  {
    id: "mapping",
    label: "Mapping Manager",
    icon: <Tags className="h-4 w-4" />,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [rules, setRules] = useState<MappingRule[]>(SAMPLE_RULES);
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    buildSampleTransactions(),
  );
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const txFileRef = useRef<HTMLInputElement>(null);
  const mapFileRef = useRef<HTMLInputElement>(null);

  const handleRulesChange = (newRules: MappingRule[]) => {
    setRules(newRules);
    setTransactions((prev) => recategorizeAll(prev, newRules) as Transaction[]);
  };

  const handleTxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseTransactionCSV(text, rules);
      setTransactions(parsed);
      toast.success(`Loaded ${parsed.length} transactions`);
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
      setRules(parsed);
      setTransactions((prev) => recategorizeAll(prev, parsed) as Transaction[]);
      toast.success(`Loaded ${parsed.length} mapping rules`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExport = () => {
    exportTransactionsCSV(transactions);
    toast.success("Exported categorized transactions");
  };

  const categorizedCount = transactions.filter(
    (t) => t.category !== "Uncategorized",
  ).length;

  const categorizationPct =
    transactions.length > 0
      ? Math.round((categorizedCount / transactions.length) * 100)
      : 0;

  // Unique categories for filter checkboxes
  const uniqueCategories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  return (
    <div className="flex min-h-screen">
      <Toaster />

      {/* ── Sidebar ── */}
      <aside
        className="hidden w-64 shrink-0 flex-col bg-navy lg:flex"
        style={{ minHeight: "100vh" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">
              FinTrack
            </p>
            <p className="text-[10px] text-white/40 leading-tight">
              Transaction Categorizer
            </p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="px-3 pt-4 pb-2">
          <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Navigation
          </p>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              data-ocid={`app.${tab.id}.tab`}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all mb-0.5 ${
                activeTab === tab.id
                  ? "bg-primary/20 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              <span className={activeTab === tab.id ? "text-primary" : ""}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-4 my-2 border-t border-white/10" />

        {/* Filters — only shown on dashboard tab */}
        {activeTab === "dashboard" && (
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            <p className="px-2 mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
              Filters
            </p>

            {/* Date Range */}
            <div className="mb-4 rounded-lg bg-white/5 p-3">
              <p className="mb-2 text-xs font-semibold text-white/60">
                Date Range
              </p>
              <div className="space-y-2">
                <div>
                  <label
                    htmlFor="date-from"
                    className="block text-[10px] text-white/40 mb-1"
                  >
                    From
                  </label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        from: e.target.value,
                      }))
                    }
                    id="date-from"
                    data-ocid="filter.date_from.input"
                    className="w-full rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="date-to"
                    className="block text-[10px] text-white/40 mb-1"
                  >
                    To
                  </label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, to: e.target.value }))
                    }
                    data-ocid="filter.date_to.input"
                    className="w-full rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                {(dateRange.from || dateRange.to) && (
                  <button
                    type="button"
                    onClick={() => setDateRange({ from: "", to: "" })}
                    className="text-[10px] text-white/40 hover:text-white/70 transition-colors"
                  >
                    Clear dates
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            {uniqueCategories.length > 0 && (
              <div className="rounded-lg bg-white/5 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-white/60">
                    Categories
                  </p>
                  {selectedCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategories([])}
                      className="text-[10px] text-white/40 hover:text-white/70 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1.5">
                  {uniqueCategories.map((cat) => (
                    <div key={cat} className="flex items-center gap-2">
                      <Checkbox
                        id={`cat-${cat}`}
                        checked={selectedCategories.includes(cat)}
                        onCheckedChange={() => toggleCategory(cat)}
                        className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3.5 w-3.5"
                        data-ocid="filter.category.checkbox"
                      />
                      <Label
                        htmlFor={`cat-${cat}`}
                        className="text-xs text-white/60 cursor-pointer hover:text-white/90 transition-colors"
                      >
                        {cat}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Spacer when not on dashboard */}
        {activeTab !== "dashboard" && <div className="flex-1" />}

        {/* Quick Actions */}
        <div className="px-3 pb-3">
          <div className="mx-4 mb-3 border-t border-white/10" />
          <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Quick Actions
          </p>
          <input
            ref={txFileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleTxUpload}
          />
          <button
            type="button"
            onClick={() => txFileRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-white/80 transition-all mb-0.5"
            data-ocid="sidebar.upload_button"
          >
            <Upload className="h-4 w-4 text-primary/70" />
            Upload CSV
          </button>
          <input
            ref={mapFileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleMapUpload}
          />
          <button
            type="button"
            onClick={() => mapFileRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-white/80 transition-all mb-0.5"
            data-ocid="sidebar.mapping_upload_button"
          >
            <FileText className="h-4 w-4 text-primary/70" />
            Mapping Rules
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-white/80 transition-all"
            data-ocid="sidebar.export_button"
          >
            <Download className="h-4 w-4 text-primary/70" />
            Export Data
          </button>
        </div>

        {/* Stats badge */}
        <div className="mx-3 mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-white">
              {transactions.length} transactions
            </p>
            <TrendingUp className="h-3.5 w-3.5 text-success" />
          </div>
          <Progress value={categorizationPct} className="h-1.5 bg-white/10" />
          <p className="mt-1.5 text-[10px] text-white/40">
            {categorizedCount} categorized · {categorizationPct}%
          </p>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex flex-1 flex-col">
        {/* Top bar — mobile only */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">FinTrack</span>
          </div>
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                data-ocid={`app.${tab.id}.tab.mobile`}
                className={`rounded-md p-2 transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
              </button>
            ))}
          </nav>
        </header>

        {/* Page header */}
        <div className="border-b border-border bg-card px-8 py-5">
          {activeTab === "dashboard" && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Financial Dashboard
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Your spending overview · All data processed locally
                </p>
              </div>
              {(dateRange.from ||
                dateRange.to ||
                selectedCategories.length > 0) && (
                <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-xs font-medium text-primary">
                    Filters active
                  </span>
                </div>
              )}
            </div>
          )}
          {activeTab === "transactions" && (
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Transactions
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Upload and manage your transaction data
              </p>
            </div>
          )}
          {activeTab === "mapping" && (
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Mapping Manager
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Define keyword → category rules for automatic categorization
              </p>
            </div>
          )}
        </div>

        {/* Tab content */}
        <main className="flex-1 overflow-auto bg-background p-8">
          {activeTab === "dashboard" && (
            <Dashboard
              transactions={transactions}
              rules={rules}
              dateRange={dateRange}
              selectedCategories={selectedCategories}
            />
          )}
          {activeTab === "transactions" && (
            <Transactions
              transactions={transactions}
              rules={rules}
              onTransactionsChange={setTransactions}
              onRulesChange={handleRulesChange}
            />
          )}
          {activeTab === "mapping" && (
            <MappingManager rules={rules} onRulesChange={handleRulesChange} />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card px-8 py-3 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}

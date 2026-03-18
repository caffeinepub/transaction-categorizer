import { DollarSign, Percent, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { MappingRule, Transaction } from "../types";

const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#F97316",
  "#EC4899",
  "#84CC16",
  "#14B8A6",
];

interface DateRange {
  from: string;
  to: string;
}

interface Props {
  transactions: Transaction[];
  rules: MappingRule[];
  dateRange: DateRange;
  selectedCategories: string[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function Dashboard({
  transactions,
  dateRange,
  selectedCategories,
}: Props) {
  // Apply filters
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (dateRange.from && t.date < dateRange.from) return false;
      if (dateRange.to && t.date > dateRange.to) return false;
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(t.category)
      )
        return false;
      return true;
    });
  }, [transactions, dateRange, selectedCategories]);

  const totalIncome = filtered
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome + totalExpenses;
  const categorized = filtered.filter(
    (t) => t.category !== "Uncategorized",
  ).length;
  const categorizationRate =
    filtered.length > 0 ? Math.round((categorized / filtered.length) * 100) : 0;

  // Category aggregation
  const categoryMap = useMemo(() => {
    const map: Record<
      string,
      { category: string; count: number; total: number }
    > = {};
    for (const tx of filtered) {
      if (!map[tx.category])
        map[tx.category] = { category: tx.category, count: 0, total: 0 };
      map[tx.category].count++;
      map[tx.category].total += tx.amount;
    }
    return map;
  }, [filtered]);

  const allCategories = Object.values(categoryMap);

  // Pie chart: expenses by category
  const pieData = allCategories
    .filter((c) => c.total < 0)
    .map((c) => ({ name: c.category, value: Math.abs(c.total) }))
    .sort((a, b) => b.value - a.value);

  // Monthly spending bar chart
  const monthlyData = useMemo(() => {
    const map: Record<
      string,
      { month: string; income: number; expenses: number }
    > = {};
    for (const tx of filtered) {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = `${MONTH_NAMES[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
      if (!map[key]) map[key] = { month: label, income: 0, expenses: 0 };
      if (tx.amount > 0) map[key].income += tx.amount;
      else map[key].expenses += Math.abs(tx.amount);
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [filtered]);

  const kpis = [
    {
      label: "Total Income",
      value: `+${formatCurrency(totalIncome)}`,
      sub: `${filtered.filter((t) => t.amount > 0).length} transactions`,
      accent: "border-l-4 border-l-emerald-500",
      valueColor: "text-emerald-600",
      icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
      bg: "bg-emerald-50/50",
    },
    {
      label: "Total Expenses",
      value: `-${formatCurrency(totalExpenses)}`,
      sub: `${filtered.filter((t) => t.amount < 0).length} transactions`,
      accent: "border-l-4 border-l-red-500",
      valueColor: "text-red-600",
      icon: <TrendingDown className="h-5 w-5 text-red-500" />,
      bg: "bg-red-50/50",
    },
    {
      label: "Net Balance",
      value: `${netBalance >= 0 ? "+" : "-"}${formatCurrency(netBalance)}`,
      sub: netBalance >= 0 ? "Positive cashflow" : "Negative cashflow",
      accent:
        netBalance >= 0
          ? "border-l-4 border-l-blue-500"
          : "border-l-4 border-l-orange-500",
      valueColor: netBalance >= 0 ? "text-blue-600" : "text-orange-600",
      icon: (
        <DollarSign
          className={`h-5 w-5 ${netBalance >= 0 ? "text-blue-500" : "text-orange-500"}`}
        />
      ),
      bg: netBalance >= 0 ? "bg-blue-50/50" : "bg-orange-50/50",
    },
    {
      label: "Categorized",
      value: `${categorizationRate}%`,
      sub: `${categorized} of ${filtered.length} matched`,
      accent: "border-l-4 border-l-violet-500",
      valueColor:
        categorizationRate >= 80 ? "text-violet-600" : "text-amber-600",
      icon: <Percent className="h-5 w-5 text-violet-500" />,
      bg: "bg-violet-50/50",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in" data-ocid="dashboard.section">
      {/* KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`rounded-lg border border-border bg-card shadow-kpi ${kpi.accent} overflow-hidden`}
            data-ocid={`dashboard.card.${i + 1}`}
          >
            <div className={`p-5 ${kpi.bg}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {kpi.label}
                  </p>
                  <p
                    className={`mt-2 text-2xl font-bold tracking-tight ${kpi.valueColor}`}
                  >
                    {kpi.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {kpi.sub}
                  </p>
                </div>
                <div className="rounded-full bg-white p-2 shadow-xs">
                  {kpi.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hero: Donut Pie Chart */}
      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Expense Breakdown
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Spending distribution by category
            </p>
          </div>
          {pieData.length > 0 && (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
              -{formatCurrency(totalExpenses)} total
            </span>
          )}
        </div>
        {pieData.length > 0 ? (
          <div className="flex flex-col items-center p-6 md:flex-row">
            <div className="w-full md:w-1/2" style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={115}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <RechartTooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Expenses",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="w-full md:w-1/2 md:pl-4">
              <div className="space-y-2">
                {pieData.map((entry, i) => {
                  const pct =
                    totalExpenses !== 0
                      ? Math.round(
                          (entry.value / Math.abs(totalExpenses)) * 100,
                        )
                      : 0;
                  return (
                    <div key={entry.name} className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 flex-shrink-0 rounded-full"
                        style={{
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <div className="flex flex-1 items-center justify-between min-w-0">
                        <span className="truncate text-sm font-medium text-foreground">
                          {entry.name}
                        </span>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-muted-foreground">
                            {pct}%
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(entry.value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex h-64 items-center justify-center text-sm text-muted-foreground"
            data-ocid="dashboard.pie_chart.empty_state"
          >
            No expense data for selected filters
          </div>
        )}
      </div>

      {/* Monthly Spending Bar Chart */}
      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-base font-bold text-foreground">
            Monthly Spending
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Income vs. expenses over time
          </p>
        </div>
        {monthlyData.length > 0 ? (
          <div className="p-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={monthlyData}
                margin={{ top: 4, right: 8, bottom: 4, left: 16 }}
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E2E8F0"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
                  }
                />
                <RechartTooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === "income" ? "Income" : "Expenses",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  formatter={(value) =>
                    value === "income" ? "Income" : "Expenses"
                  }
                />
                <Bar
                  dataKey="income"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="expenses"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div
            className="flex h-48 items-center justify-center text-sm text-muted-foreground"
            data-ocid="dashboard.bar_chart.empty_state"
          >
            No monthly data for selected filters
          </div>
        )}
      </div>

      {/* Category Summary Table */}
      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-base font-bold text-foreground">
            Category Summary
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Breakdown by spending category
          </p>
        </div>
        {allCategories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Transactions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {allCategories
                  .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
                  .map((cat, i) => {
                    const share = allCategories.reduce(
                      (s, c) => s + Math.abs(c.total),
                      0,
                    );
                    const pct =
                      share > 0
                        ? Math.round((Math.abs(cat.total) / share) * 100)
                        : 0;
                    return (
                      <tr
                        key={cat.category}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                        data-ocid={`dashboard.category.item.${i + 1}`}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                              style={{
                                background:
                                  CHART_COLORS[i % CHART_COLORS.length],
                              }}
                            />
                            <span className="font-medium text-foreground">
                              {cat.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right text-muted-foreground">
                          {cat.count}
                        </td>
                        <td
                          className={`px-6 py-3.5 text-right font-semibold tabular-nums ${
                            cat.total >= 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {cat.total >= 0 ? "+" : "-"}
                          {formatCurrency(cat.total)}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary/60"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8 text-right">
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className="p-10 text-center text-sm text-muted-foreground"
            data-ocid="dashboard.category.empty_state"
          >
            No transactions match the current filters
          </div>
        )}
      </div>
    </div>
  );
}

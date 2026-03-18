export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number; // positive = income, negative = expense
  category: string;
  confidence: number; // 0-100
  isManualOverride: boolean;
}

export interface MappingRule {
  id: string;
  keyword: string;
  category: string;
}

export type ActiveTab = "dashboard" | "transactions" | "mapping";

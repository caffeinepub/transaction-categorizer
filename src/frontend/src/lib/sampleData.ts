import type { MappingRule, Transaction } from "../types";
import { categorize } from "./categorize";

export const SAMPLE_RULES: MappingRule[] = [
  { id: crypto.randomUUID(), keyword: "netflix", category: "Entertainment" },
  { id: crypto.randomUUID(), keyword: "spotify", category: "Entertainment" },
  { id: crypto.randomUUID(), keyword: "hulu", category: "Entertainment" },
  { id: crypto.randomUUID(), keyword: "starbucks", category: "Food & Drink" },
  { id: crypto.randomUUID(), keyword: "uber eats", category: "Food & Drink" },
  { id: crypto.randomUUID(), keyword: "doordash", category: "Food & Drink" },
  { id: crypto.randomUUID(), keyword: "whole foods", category: "Groceries" },
  { id: crypto.randomUUID(), keyword: "trader joe", category: "Groceries" },
  { id: crypto.randomUUID(), keyword: "amazon", category: "Shopping" },
  { id: crypto.randomUUID(), keyword: "apple", category: "Shopping" },
  { id: crypto.randomUUID(), keyword: "at&t", category: "Utilities" },
  { id: crypto.randomUUID(), keyword: "payroll", category: "Income" },
  { id: crypto.randomUUID(), keyword: "direct deposit", category: "Income" },
];

const RAW_TRANSACTIONS = [
  { date: "2024-01-03", description: "Direct Deposit Payroll", amount: 3250.0 },
  { date: "2024-01-05", description: "Whole Foods Market", amount: -87.43 },
  { date: "2024-01-07", description: "Netflix Subscription", amount: -15.99 },
  { date: "2024-01-09", description: "Starbucks Coffee", amount: -6.75 },
  { date: "2024-01-11", description: "Amazon Prime Purchase", amount: -49.95 },
  { date: "2024-01-14", description: "Uber Eats Delivery", amount: -32.5 },
  { date: "2024-01-15", description: "Spotify Premium", amount: -9.99 },
  { date: "2024-01-17", description: "Apple Store Purchase", amount: -129.0 },
  { date: "2024-01-19", description: "Trader Joe's Grocery", amount: -64.2 },
  { date: "2024-01-20", description: "AT&T Wireless Bill", amount: -85.0 },
  { date: "2024-01-22", description: "Starbucks Reserve", amount: -8.25 },
  { date: "2024-01-25", description: "Amazon Fresh Delivery", amount: -38.1 },
  {
    date: "2024-01-28",
    description: "Freelance Client Payment",
    amount: 1200.0,
  },
  { date: "2024-01-30", description: "Netflix Annual Plan", amount: -15.99 },
  {
    date: "2024-02-01",
    description: "Whole Foods Online Order",
    amount: -92.6,
  },
];

export function buildSampleTransactions(): Transaction[] {
  return RAW_TRANSACTIONS.map((raw) => {
    const { category, confidence } = categorize(raw.description, SAMPLE_RULES);
    return {
      id: crypto.randomUUID(),
      date: raw.date,
      description: raw.description,
      amount: raw.amount,
      category,
      confidence,
      isManualOverride: false,
    };
  });
}

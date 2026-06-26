export interface User {
  id: string;
  email: string;
  full_name: string;
  plan: "free" | "paid";
  scans_used_this_month: number;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  source: "manual" | "receipt";
  receipt_id: string | null;
  created_at: string;
}

export interface ExpenseSummaryItem {
  category_id: string;
  category_name: string;
  total: number;
}

export interface ParsedItem {
  name: string;
  amount: number;
  category: string;
}

export interface ParsedReceipt {
  merchant: string | null;
  date: string | null;
  total: number | null;
  items: ParsedItem[];
}

export interface ReceiptScanOut {
  receipt_id: string;
  parsed: ParsedReceipt;
  scans_used: number;
  scans_limit: number | null;
}
